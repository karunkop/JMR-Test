import { get } from "lodash";
import {
    Context,
    createContext,
    FC,
    useCallback,
    useContext,
    useReducer,
} from "react";
import arrayMove from "array-move";
import {
    CartItem,
    Weekdays,
} from "../types/coreInterfaces";
import { ExperienceDTO } from "../types/apiInterfaces";
import _ from "lodash";

export interface ServiceOrderType {
    id: string;
    serviceId: number;
    itemId: number;
    isSingleService: boolean;
    key: string;
    name: string;
    unavailableDays: Weekdays[];
}
export interface CartState {
    cart: CartItem[];
    servicesOrder: ServiceOrderType[];
    idsMap: { [key: number]: boolean }; // if an id has been selected in the cart
    addItem: (item: CartItem) => void;
    updateItemServiceContents: (experiences: ExperienceDTO[]) => void,
    removeItem: (id: number) => void;
    updateItem: (id: number, adults: number) => void;
    updateIdsCount: (idsCount: {
        [key: number]: number;
    }) => void;
    updateServicesOrder: (a: {
        oldIndex: number;
        newIndex: number;
    }) => void;
}

export type CartAction =
    | {
        type: "UPDATE_ITEM_SERVICE_CONTENTS";
        payload: {
            experiences: ExperienceDTO[];
        };
    }
    | {
        type: "ADD";
        payload: {
            item: CartItem;
        };
    }
    | {
        type: "REMOVE";
        payload: { id: number };
    }
    | {
        type: "UPDATE";
        payload: { id: number; adults: number };
    }
    | {
        type: "UPDATE_IDS_COUNT";
        payload: { idsCount: { [key: number]: number } };
    }
    | {
        type: "UPDATE_SERVICES_ORDER";
        payload: {
            oldIndex: number;
            newIndex: number;
        };
    };

export const CartContext: Context<CartState | undefined> =
    createContext(undefined as CartState | undefined);

type CartReducerType = {
    cart: CartItem[];
    servicesOrder: ServiceOrderType[];
    idsMap: { [key: number]: boolean };
};
export const CartProvider: FC = ({ children }) => {
    const cartReducer = (
        state: CartReducerType = {
            cart: [],
            servicesOrder: [],
            idsMap: {},
        },
        action: CartAction
    ): CartReducerType => {
        switch (action.type) {
            case "ADD": {
                const { item } = action.payload;
                const newCart = [
                    ...state.cart,
                    action.payload.item,
                ];
                const newIdsMap = {
                    ...state.idsMap,
                    [action.payload.item.id]: true,
                };
                const newServiceOrder: ServiceOrderType[] =
                    [
                        ...state.servicesOrder,
                        ...(!item.isPackage
                            ? item.ignoreFromAvailabilityCalculation ||
                                !item.requiresRoom
                                ? []
                                : [
                                    {
                                        id: "" + item.id,
                                        serviceId:
                                            item.id,
                                        isSingleService:
                                            true,
                                        itemId: item.id,
                                        key: `dnd-service-${item.id}`,
                                        name: item.name,
                                        unavailableDays:
                                            [],
                                    },
                                ]
                            : item.servicesContent
                                ?.filter(
                                    (i) =>
                                        !i.ignoreFromAvailabilityCalculation &&
                                        i.requiresRoom
                                )
                                .map(
                                    ({
                                        id,
                                        name,
                                        unavailableDays,
                                    }) => ({
                                        id: `${item.id}/${id}`,
                                        serviceId: id,
                                        itemId: item.id,
                                        isSingleService:
                                            false,
                                        key: `dnd-service-${item.id}-${id}`,
                                        name,
                                        unavailableDays:
                                            unavailableDays.map(
                                                ({
                                                    value,
                                                }) =>
                                                    value
                                            ),
                                    })
                                ) || [
                                {
                                    id: `${item.id}`,
                                    serviceId: item.id,
                                    itemId: item.id,
                                    isSingleService: true,
                                    key: `dnd-service-${item.id}`,
                                    name: item.name,
                                    unavailableDays: [],
                                },
                            ]),
                    ];
                return {
                    ...state,
                    cart: newCart,
                    servicesOrder: newServiceOrder,
                    idsMap: newIdsMap,
                };
            }

            case "UPDATE_ITEM_SERVICE_CONTENTS": {
                const { experiences } = action.payload;
                const experiencesMap: {[ key: string ]: ExperienceDTO} = {}
                for (let e of experiences) {
                    experiencesMap[e.id] = e;
                }

                let newCart: CartItem[] = [];
                let newServicesOrder: ServiceOrderType[] = []

                for (let c of state.cart) {
                    let exp = experiencesMap[c.id] || {};
                    const servicesContent = _.sortBy(
                        (exp?.servicesList||[])
                            ?.filter((s) => _.has(s, "serviceDetails"))
                            .map((s) => ({
                                unavailableDays:
                                    s.serviceDetails?.[
                                    "unavailable-days"
                                    ] || [],
                                order: +(s.order || 0),
                                ignoreFromAvailabilityCalculation:
                                    s.serviceDetails?.[
                                    "ignore-from-availability-calculation"
                                    ] || false,
                                requiresRoom:
                                    s.serviceDetails?.[
                                    "requires-room"
                                    ] || false,
                                rooms:
                                    s.serviceDetails?.available.map(
                                        (a) => a.id
                                    ) || [],
                                id: _.get(s, ["serviceDetails", "id"]),
                                name: _.get(s, [
                                    "serviceDetails",
                                    "name",
                                ]),
                            })),
                        (s) => s.order
                    );
                    const item:CartItem = {...c, servicesContent}
                    newCart.push(item)

                    const so = !item.isPackage
                        ? item.ignoreFromAvailabilityCalculation ||
                            !item.requiresRoom
                            ? []
                            : [
                                {
                                    id: "" + item.id,
                                    serviceId: item.id,
                                    isSingleService: true,
                                    itemId: item.id,
                                    key: `dnd-service-${item.id}`,
                                    name: item.name,
                                    unavailableDays: [],
                                },
                            ]
                        : servicesContent
                            ?.filter(
                                (i) =>
                                    !i.ignoreFromAvailabilityCalculation &&
                                    i.requiresRoom
                            )
                            .map(({ id, name, unavailableDays }) => ({
                                id: `${item.id}/${id}`,
                                serviceId: id,
                                itemId: item.id,
                                isSingleService: false,
                                key: `dnd-service-${item.id}-${id}`,
                                name,
                                unavailableDays: unavailableDays.map(
                                    ({ value }) => value
                                ),
                            })) || [
                            {
                                id: `${item.id}`,
                                serviceId: item.id,
                                itemId: item.id,
                                isSingleService: true,
                                key: `dnd-service-${item.id}`,
                                name: item.name,
                                unavailableDays: [],
                            },
                        ];
                    newServicesOrder.push(...so);
                }

                return {
                    ...state,
                    cart: newCart,
                    servicesOrder: newServicesOrder,
                }
            }

            case "REMOVE": {
                const { id } = action.payload;
                const item = state.cart.filter(
                    (c) => c.id === id
                )[0];
                let servicesOrder = state.servicesOrder;
                if (item) {
                    const servicesIdsToRemove =
                        !item.isPackage
                            ? [`${item.id}`]
                            : item.servicesContent?.map(
                                ({ id }) =>
                                    `${item.id}/${id}`
                            ) || [];
                    servicesOrder =
                        state.servicesOrder.filter(
                            ({ id }) =>
                                !servicesIdsToRemove.includes(
                                    id
                                )
                        );
                }
                return {
                    ...state,
                    cart: state.cart.filter(
                        (c) => c.id !== id
                    ),
                    servicesOrder,
                    idsMap: {
                        ...state.idsMap,
                        [id]: false,
                    },
                };
            }
            case "UPDATE":
                return {
                    ...state,
                    cart: state.cart.map((item) => ({
                        ...item,
                        adults:
                            action.payload.id === item.id
                                ? action.payload.adults
                                : item.adults,
                    })),
                };
            case "UPDATE_IDS_COUNT":
                return {
                    ...state,
                    cart: state.cart.map((item) => ({
                        ...item,
                        adults: get(
                            action,
                            [
                                "payload",
                                "idsCount",
                                item.id,
                            ],
                            item.adults
                        ),
                    })),
                };
            case "UPDATE_SERVICES_ORDER": {
                return {
                    ...state,
                    servicesOrder: arrayMove(
                        state.servicesOrder,
                        action.payload.oldIndex,
                        action.payload.newIndex
                    ),
                };
            }
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(cartReducer, {
        cart: [],
        servicesOrder: [],
        idsMap: {},
    });

    const updateItemServiceContents = useCallback<(item: ExperienceDTO[]) => void>(
        (experiences) => {
            dispatch({
                type: "UPDATE_ITEM_SERVICE_CONTENTS",
                payload: {
                    experiences
                },
            });
        },
        []
    )

    const addItem = useCallback<(item: CartItem) => void>(
        (item) => {
            dispatch({
                type: "ADD",
                payload: {
                    item,
                },
            });
        },
        []
    );

    const removeItem = useCallback<(id: number) => void>(
        (id) => {
            dispatch({
                type: "REMOVE",
                payload: {
                    id,
                },
            });
        },
        []
    );

    const updateItem = useCallback<
        (id: number, adults: number) => void
    >((id, adults) => {
        dispatch({
            type: "UPDATE",
            payload: {
                id,
                adults,
            },
        });
    }, []);

    const updateIdsCount = useCallback<
        (idsCount: { [key: number]: number }) => void
    >((idsCount) => {
        dispatch({
            type: "UPDATE_IDS_COUNT",
            payload: {
                idsCount,
            },
        });
    }, []);

    const updateServicesOrder = ({
        oldIndex,
        newIndex,
    }: {
        oldIndex: number;
        newIndex: number;
    }) => {
        dispatch({
            type: "UPDATE_SERVICES_ORDER",
            payload: {
                oldIndex,
                newIndex,
            },
        });
    };

    return (
        <CartContext.Provider
            value={{
                cart: state.cart,
                servicesOrder: state.servicesOrder,
                idsMap: state.idsMap,
                addItem,
                updateItemServiceContents,
                removeItem,
                updateItem,
                updateIdsCount,
                updateServicesOrder,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCartItemContext: () => CartState = () => {
    let context = useContext(CartContext);
    if (context === undefined) {
        throw Error("Cart item provider not found");
    }

    return context;
};
