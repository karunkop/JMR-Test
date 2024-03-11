import _, { reduce } from "lodash";
import moment from "moment";
import queryString from "query-string";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
    Loader,
    Grid,
    Button,
    Header,
    Segment,
    SemanticWIDTHSNUMBER,
    Divider,
    Accordion,
    AccordionTitleProps,
    Icon,
    List,
    Message,
} from "semantic-ui-react";
import { useCreateGuestsAndOrder } from "../api";
import { useCartItemContext } from "../context/cartContext";
import {
    CartItem,
    ChoosenAvailabilityType,
    GuestsDetailsInput,
} from "../types/coreInterfaces";
import { secondaryColor } from "../utility/defaults";

const CheckoutUI = ({
    guestsAndOrderBody,
    choosenAvailabilityData,
}: {
    guestsAndOrderBody?: GuestsDetailsInput;
    choosenAvailabilityData?: ChoosenAvailabilityType;
}) => {
    // const [url, setUrl] = useState<string | undefined>();
    const history = useHistory();
    const { cart } = useCartItemContext();

    const { isLoading, mutate, isError } = useCreateGuestsAndOrder({
        onSuccess: (guestsAndOrderData) => {
            const arrivalDate =
                choosenAvailabilityData?.arrivalDate;
            const queryParams = queryString.stringify({
                amount: guestsAndOrderData?.orderResponse
                    .entry.amount,
                description: `Payment for booking Japanese Mountain Retreat experiences for ${arrivalDate}. Order ID: {{${guestsAndOrderData.orderResponse.entry
                        .id}}}`,
                amount_editable: false,
                success_url:
                    process.env.NODE_ENV === "development"
                        ? `http://localhost:3000/booking/${guestsAndOrderData.orderResponse.entry.id}`
                        : `https://experience.japanesemountainretreat.com.au/booking/${guestsAndOrderData.orderResponse.entry.id}`,
                email: guestsAndOrderData.guestsData[0]
                    ?.entry.email,
                field1label: "Order Id",
                field1value:
                    guestsAndOrderData.orderResponse.entry
                        .id,
            });
            const url =
                process.env.NODE_ENV === "development"
                    ? `https://pay.pinpayments.com/riiy/sc/test?${queryParams}`
                    : `https://pay.pinpayments.com/riiy/sc?${queryParams}`;
            window.location.href = url;
        },
        onError: () => {
            // Todo: show notification
            console.log("couldn't make guests and order");
        },
    });

    const widths: SemanticWIDTHSNUMBER[] = [1, 7, 6, 2];
    const [openPackages, setOpenPackages] = useState<
        number[]
    >([]);

    const handleCollapsableClick: (
        event: React.MouseEvent<HTMLDivElement>,
        data: AccordionTitleProps
    ) => void = (_, titleProps) => {
        const { index } = titleProps;
        if (index === undefined) {
            return;
        }
        if (openPackages.includes(+index)) {
            setOpenPackages(
                openPackages.filter(
                    (openIndex) => openIndex !== index
                )
            );
            return;
        }
        setOpenPackages([...openPackages, +index]);
    };
    const items = cart.map(
        (item: CartItem, index: number) => {
            const isActive = openPackages.includes(index);
            return (
                <Grid.Row>
                    <Grid.Column width={widths[1]}>
                        {item.isPackage ? (
                            <>
                                <Accordion.Title
                                    active={isActive}
                                    index={index}
                                    onClick={
                                        handleCollapsableClick
                                    }
                                >
                                    <Icon name="dropdown" />
                                    {item.name}
                                </Accordion.Title>
                                <Accordion.Content
                                    active={isActive}
                                >
                                    <List as="ol">
                                        {item.servicesContent?.map(
                                            (s) => (
                                                <List.Item
                                                    key={`summary_package_${item.id}-${s.id}`}
                                                    as="li"
                                                    value="-"
                                                >
                                                    <p>
                                                        {
                                                            s.name
                                                        }
                                                    </p>
                                                </List.Item>
                                            )
                                        )}
                                    </List>
                                </Accordion.Content>
                            </>
                        ) : (
                            item.name
                        )}
                    </Grid.Column>
                    <Grid.Column width={widths[2]}>
                        {item.adults}
                    </Grid.Column>
                    <Grid.Column width={widths[3]}>
                        ${+(choosenAvailabilityData?.isPublicHolidayPrice? item.publicHolidayPrice|| item.price: item.price) * +item.adults}
                    </Grid.Column>
                </Grid.Row>
            );
        }
    );

    const total = reduce(
        cart,
        (acc, s) => {
            return acc + +(choosenAvailabilityData?.isPublicHolidayPrice? s.publicHolidayPrice || s.price: s.price) * s.adults;
        },
        0
    );

    const getAvailabilityList = () => {
        if (!choosenAvailabilityData) {
            return null;
        }
        const {
            index,
            servicesStartTimes,
            servicesDuration,
            servicesCleanupDuration,
            servicesEndTimes,
            servicesNames,
        } = choosenAvailabilityData.metadata;
        const arrivalDate =
            choosenAvailabilityData.arrivalDate;
        const allPanels = [servicesStartTimes[index]].map(
            (startTimes, i) => {
                return {
                    key: `availability-time-${arrivalDate}-${i}`,

                    title: `${moment(
                        startTimes[0],
                        "HH:mm"
                    ).format("hh:mm A")} - ${moment(
                        servicesEndTimes[index],
                        "HH:mm"
                    ).format("hh:mm A")} on the ${moment(
                        choosenAvailabilityData.arrivalDate,
                        "DD-MM-YYYY"
                    ).format("Do MMMM")}`,
                    content: {
                        content: (
                            <div
                                style={{
                                    padding: "5px 15px",
                                }}
                            >
                                <List as="ol">
                                    {startTimes.map(
                                        (t, i) => {
                                            return (
                                                <List.Item
                                                    key={`availability-desc-time-${arrivalDate}-${i}-${i}`}
                                                    as="li"
                                                    value="-"
                                                >
                                                    {`${
                                                        servicesNames[
                                                            i
                                                        ]
                                                    } : ${moment(
                                                        t,
                                                        "HH:mm"
                                                    ).format(
                                                        "hh:mm A"
                                                    )} - ${moment(
                                                        t,
                                                        "HH:mm"
                                                    )
                                                        .add(
                                                            servicesDuration[
                                                                i
                                                            ],
                                                            "minutes"
                                                        )
                                                        .subtract(
                                                            servicesCleanupDuration[
                                                                i
                                                            ],
                                                            "minutes"
                                                        )
                                                        .format(
                                                            "hh:mm A"
                                                        )}`}
                                                </List.Item>
                                            );
                                        }
                                    )}
                                </List>
                            </div>
                        ),
                    },
                };
            }
        );
        return (
            <Accordion
                defaultActiveIndex={0}
                panels={allPanels}
            />
        );
    };

    return (
        <>
            <section className="cart-wrapper center">
                <Segment disabled={isLoading}>
                    <Header as="h1" content="Summary" />
                    <Segment>
                        <Accordion>
                            <Header
                                as="h2"
                                content="Experiences"
                            />
                            <Grid>
                                <Grid.Row>
                                    <Grid.Column
                                        width={widths[1]}
                                    >
                                        Items
                                    </Grid.Column>
                                    <Grid.Column
                                        width={widths[2]}
                                    >
                                        Guests
                                    </Grid.Column>
                                    <Grid.Column
                                        width={widths[3]}
                                    >
                                        Subtotal
                                    </Grid.Column>
                                </Grid.Row>
                                <Divider />
                                {items}
                                <Divider />
                                <Grid.Row columns={4}>
                                    <Grid.Column width={4}>
                                        {" "}
                                        Total
                                    </Grid.Column>
                                    <Grid.Column
                                        width={10}
                                    />
                                    <Grid.Column width={2}>
                                        ${total}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Accordion>
                    </Segment>
                    <Segment>
                        <Header
                            as="h2"
                            content="Timeline"
                        />
                        {getAvailabilityList()}
                    </Segment>
                    <Segment>
                        <Header as="h2" content="Guests" />
                        <List as="ol">
                            {_.uniqBy(
                                [
                                    ...(guestsAndOrderBody &&
                                    _.get(
                                        guestsAndOrderBody,
                                        "metadata.addAsGuest1",
                                        false
                                    )
                                        ? [
                                              {
                                                  firstName:
                                                      guestsAndOrderBody.firstName,
                                                  lastName:
                                                      guestsAndOrderBody.lastName,
                                                  email: guestsAndOrderBody.email,
                                              },
                                          ]
                                        : []),
                                    ..._.get(
                                        guestsAndOrderBody,
                                        "guestDetails",
                                        []
                                    ),
                                ],
                                "email"
                            ).map(
                                (
                                    {
                                        email,
                                        firstName,
                                        lastName,
                                    },
                                    i
                                ) => {
                                    return (
                                        <List.Item
                                            key={`summary-guest-${email}-${i}`}
                                            as="li"
                                            value="-"
                                        >
                                            {firstName}{" "}
                                            {lastName} (
                                            {email})
                                        </List.Item>
                                    );
                                }
                            )}
                        </List>
                    </Segment>
                    {isLoading && <Loader active />}
                    <Grid>
                        <Grid.Row centered columns={2}>
                            <Grid.Column textAlign="center">
                                <Button
                                    onClick={() =>
                                        history.push(
                                            "/details"
                                        )
                                    }
                                    content="Back"
                                />
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                                {!guestsAndOrderBody ||
                                isLoading ? (
                                    <Button
                                        style={{
                                            marginTop:
                                                "12px",
                                        }}
                                        color={
                                            secondaryColor
                                        }
                                        content={
                                            isLoading
                                                ? "Loading..."
                                                : "Proceed to payment"
                                        }
                                        disabled={true}
                                    />
                                ) : (
                                    <Button
                                        style={{
                                            marginTop:
                                                "12px",
                                        }}
                                        content="Proceed to payment"
                                        onClick={() =>
                                            mutate(
                                                guestsAndOrderBody
                                            )
                                        }
                                        basic
                                    />
                                )}
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                            {
                                !isLoading && isError &&
                                    <Message
                                        error
                                        header="There was some problem making your order."
                                        content="Please choose try again or contact us at info@japanesemountainretreat.com.au or +61 (03) 9737 0086"
                                    />
                            }
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </section>
        </>
    );
};

export default CheckoutUI;
