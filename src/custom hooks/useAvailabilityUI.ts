import { Weekdays } from "./../types/coreInterfaces";
import _ from "lodash";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { SortEndHandler } from "react-sortable-hoc";
import arrayMove from "array-move";
import {
    useGetAvailability,
    useGetClosedDates,
    useGetServicesExceptions,
} from "../api";
import {
    ServiceOrderType,
    useCartItemContext,
} from "../context/cartContext";
import { AvailabilityDTO } from "../types/apiInterfaces";
import {
    ChoosenAvailabilityTypeMetadata,
    OnChooseAvailability,
} from "../types/coreInterfaces";

const diningCategories = new Set([
    "Six Course Omakase Dinner",
    "Japanese Lunch",
    "Dining"
])
const useAvailability = ({
    onChooseAvailability,
}: {
    onChooseAvailability: OnChooseAvailability;
}) => {
    const history = useHistory();
    const {
        cart,
        servicesOrder:
        originalServicesOrder /*updateServicesOrder*/,
    } = useCartItemContext();
    const [isClosed, setIsClosed] =
        useState<boolean>(false);
    const [isPublicHoliday, setIsPublicHoliday] =
        useState<boolean>(false);
    const {
        data: dates,
        isLoading: isLoadingClosedDates,
    } = useGetClosedDates();
    const [arrivalDate, setArrivalDate] = useState<Date>(
        new Date()
    );
    const { data: servicesExceptions } = useGetServicesExceptions(originalServicesOrder.map(({ serviceId }) => serviceId), moment
        .tz(arrivalDate, "Australia/Melbourne")
        .toISOString());
    const [arrivalWeekday, setArrivalWeekday] =
        useState<Weekdays>(
            moment().format("dddd") as Weekdays
        );
    const [servicesOrder, setServicesOrder] = useState<
        ServiceOrderType[]
    >([]);
    const [unavailableServices, setUnavailableServices] =
        useState<ServiceOrderType[]>([]);

    useEffect(() => {
        setServicesOrder(originalServicesOrder);
    }, [originalServicesOrder]);

    useEffect(() => {
        if (servicesExceptions) {
            const newServicesOrder =
                originalServicesOrder.filter(
                    ({ unavailableDays }) => {
                        const serviceException = servicesExceptions[0];

                        if (serviceException) {
                            const isClosed = serviceException?.closed;
                            return !isClosed;
                        }

                        return !unavailableDays.includes(
                            arrivalWeekday
                        )
                    }
                );
            const unavailableServices =
                originalServicesOrder.filter(
                    ({ unavailableDays }) => {
                        const serviceException = servicesExceptions[0];

                        if (serviceException) {
                            const isClosed = serviceException?.closed;
                            return isClosed;
                        }
                        return unavailableDays.includes(arrivalWeekday)
                    }
                );
            setServicesOrder(newServicesOrder);
            setUnavailableServices(unavailableServices);
        }
    }, [arrivalWeekday, servicesExceptions]);

    const updateServicesOrder = ({
        oldIndex,
        newIndex,
    }: {
        oldIndex: number;
        newIndex: number;
    }) => {
        setServicesOrder(
            arrayMove(servicesOrder, oldIndex, newIndex)
        );
    };

    const show2Options = useMemo(
        () =>
            cart.reduce(
                (agg, { needs2Options }) =>
                    agg || needs2Options,
                false
            ),
        [cart]
    );

    useEffect(() => {
        const avd = moment(arrivalDate).format("YYYY-MM-DD");
        const publicHoliday = dates?.publicHolidays?.find(
            ({ date }) => date === avd
        );
        if (publicHoliday) {
            setIsPublicHoliday(true);
        } else {
            setIsPublicHoliday(false);
        }
        setIsClosed(false);
    }, [arrivalDate, dates]);

    const remainingExperiences: (
        | {
            serviceId: number;
            name: string;
        }
        | undefined
    )[] =
        _.flatten(
            cart.map((c) =>
                c.isPackage
                    ? c.servicesContent?.map((s) => ({
                        serviceId: s.id,
                        name: s.name,
                    }))
                    : [{ serviceId: c.id, name: c.name }]
            )
        ).filter(
            (c) =>
                !originalServicesOrder
                    .map((s) => s.serviceId)
                    .includes(c?.serviceId || 1)
        ) || [];
    const {
        isLoading: isLoadingArrivalDates,
        isError: isErrorArrivalDates,
        mutate,
        data: availabilityData,
    } = useGetAvailability({
        /* onSuccess: (data) => {
          console.log(data);
        }, */
    });

    const {
        isLoading: isLoadingArrivalDates2,
        isError: isErrorArrivalDates2,
        mutate: mutate2,
        data: availabilityData2,
    } = useGetAvailability({
        /* onSuccess: (data) => {
          console.log(data);
        }, */
    });

    const generateDataForAvailability = (
        servicesOrder: ServiceOrderType[],
        packageIds: number[],
        packagesWithDinnerRelatedCategories: number[],
    ) => {
        const remainingServiceIds: number[] = _.flatten(
            cart.map((c) =>
                c.isPackage
                    ? c.servicesContent?.map((s) => s.id) ||
                    []
                    : c.id
            )
        ).filter(
            (c) =>
                !originalServicesOrder
                    .map((s) => s.serviceId)
                    .includes(c || 1)
        );
        const singleServiceTest = servicesOrder.map(
            ({ isSingleService }) => isSingleService
        );
        const data = {
            serviceIds: servicesOrder.map(
                ({ serviceId }) => serviceId
            ),
            packageIds,
            packagesWithDinnerRelatedCategories,
            singleServiceTest,
            guests: servicesOrder.map(
                ({ itemId }) =>
                    cart
                        .filter(({ id }) => id === itemId)
                        .map(({ adults }) => adults)[0] || 2
            ),
            dateString: moment
                .tz(arrivalDate, "Australia/Melbourne")
                .toISOString(),
            orderExcludedServiceIds: remainingServiceIds,
        };
        return data;
    };

    // handlers
    const handleCheckArrivalClick = () => {
        const packagesInCart = cart.filter(item => item.isPackage).map(item => item.id);
        const packagesWithDinnerRelatedCategories = cart.filter(item => {
            const diningCategoriesOfItem = item.categories.filter(c => diningCategories.has(c.value))
            return diningCategoriesOfItem.length > 0
        }).map(item => item.id)
        const avd =
            moment(arrivalDate).format("YYYY-MM-DD");
        const closedDateForToday = dates?.closedDates?.find(
            ({ date }) => date === avd
        );
        if (closedDateForToday) {
            setIsClosed(true);
        } else {
            if (servicesOrder.length >= 2 && show2Options) {
                mutate2(
                    generateDataForAvailability([
                        servicesOrder[1],
                        servicesOrder[0],
                        ...servicesOrder.slice(2),
                    ], packagesInCart, packagesWithDinnerRelatedCategories)
                );
            }
            mutate(
                generateDataForAvailability(servicesOrder, packagesInCart, packagesWithDinnerRelatedCategories)
            );
        }
    };

    const handleAvailabilityChoose = (
        index: number,
        metadata: ChoosenAvailabilityTypeMetadata,
        availabilityData: AvailabilityDTO
    ) => {
        const startTimes =
            availabilityData.allServiceStartTimes[index];
        const startTimesRoomAvailable =
            availabilityData.startTimesRoomAvailability[
            index
            ];
        onChooseAvailability({
            isPublicHolidayPrice: isPublicHoliday,
            startTimes,
            diningServices:
                availabilityData?.diningServices,
            duration: availabilityData?.serviceDuration,
            services: availabilityData?.services,
            arrivalDate: moment
                .tz(arrivalDate, "Australia/Melbourne")
                .format("DD-MM-YYYY"),
            startTimesRoomAvailable,
            excludedServicesDuration:
                availabilityData.excludedServicesDuration,
            excludedServices:
                availabilityData.excludedServices,
            metadata,
        });
        history.push("/details");
    };

    const handleSortEnd: SortEndHandler = ({
        oldIndex,
        newIndex,
    }) => {
        updateServicesOrder({ oldIndex, newIndex });
    };

    return {
        servicesOrder,
        unavailableServices,
        availabilityData,
        availabilityData2,
        remainingExperiences,
        arrivalDate,
        setArrivalDate,
        setArrivalWeekday,
        handleCheckArrivalClick,
        isLoadingArrivalDates,
        isErrorArrivalDates,
        isLoadingArrivalDates2,
        isErrorArrivalDates2,
        handleAvailabilityChoose,
        handleSortEnd,
        isClosed,
        isPublicHoliday,
        isLoadingClosedDates,
        show2Options,
        publicHolidayAffectedItems: cart.filter(c => !!c.publicHolidayPrice),
    };
};

export default useAvailability;
