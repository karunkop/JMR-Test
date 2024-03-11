import { SortableContainer, SortableElement } from "react-sortable-hoc";
import BetLoader from "react-spinners/BeatLoader";
import {
    Button,
    Grid,
    Segment,
    Message,
    List,
    Accordion,
    Icon,
} from "semantic-ui-react";
import DatePicker from "react-date-picker";
import useAvailabilityUI from "../custom hooks/useAvailabilityUI";
import moment from "moment";
import { OnChooseAvailability, Weekdays } from "../types/coreInterfaces";
import { AvailabilityDTO } from "../types/apiInterfaces";

const SortableItem = SortableElement(({ name }: { name: string }) => (
    <div
        style={{
            zIndex: 99999999,
            border: `1px solid #000`,
            padding: "10px",
            margin: "4px",
            borderRadius: "4px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            cursor: "move",
        }}
        className="sortable-item"
    >
        <div style={{ marginRight: "2px" }}>
            <Icon name="bars" />
        </div>
        <div>{name}</div>
    </div>
));

const SortableList = SortableContainer(
    ({ items }: { items: { name: string; key: string; id: string }[] }) => {
        return (
            <ul
                style={{
                    zIndex: 99999999,
                    padding: "0px",
                    margin: "0px",
                    color: "black",
                }}
            >
                {items.map(({ name, key }, index) => (
                    <SortableItem key={key} index={index} name={name} />
                ))}
            </ul>
        );
    }
);

const AvailabilityUI = ({
    onChooseAvailability,
}: {
    onChooseAvailability: OnChooseAvailability;
}) => {
    const {
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
        publicHolidayAffectedItems,
    } = useAvailabilityUI({ onChooseAvailability });

    const getAvailabilityList = (availabilityData: AvailabilityDTO) => {
        const servicesStartTimes: Array<Array<string>> =
            availabilityData?.allServiceStartTimes.map((v, i) => [
                ...v,
                ...availabilityData?.allExcludedServicesStartTimesFinal[i],
            ]) || [];
        const servicesDuration = [
            ...(availabilityData?.serviceDuration || []),
            ...(availabilityData?.excludedServicesDuration || []),
        ];
        const servicesCleanupDuration = [
            ...(availabilityData?.postCleaningDuration || []),
            ...(availabilityData?.excludedServicesPostCleaningDuration || []),
        ];
        const servicesEndTimes = servicesStartTimes.map((startTimes) => {
            return moment(startTimes[startTimes.length - 1], "HH:mm")
                .add(servicesDuration[servicesDuration.length - 1], "minutes")
                .format("HH:mm");
        });
        const servicesNames = [
            ...(availabilityData?.serviceDetails.map(({ name }) => name) || []),
            ...(availabilityData?.excludedServicesDetails.map(
                ({ name }) => name
            ) || []),
        ];
        const servicesIds = [
            ...(availabilityData?.serviceDetails.map(({ id }) => id) || []),
            ...(availabilityData?.excludedServicesDetails.map(({ id }) => id) ||
                []),
        ];
        // TODO: if avd is today, filter times slots that are in the past
        // const avd = moment
        //     .tz(arrivalDate, "Australia/Melbourne")
        //     .format("DD-MM-YYYY");
        const metadata = {
            servicesStartTimes,
            servicesDuration,
            servicesCleanupDuration,
            servicesEndTimes,
            servicesNames,
            servicesIds,
        };
        // title
        const allPanels = servicesStartTimes.map((startTimes, index) => {
            return {
                key: `availability-time-${arrivalDate}-${index}`,
                title: `${moment(startTimes[0], "HH:mm").format(
                    "hh:mm A"
                )} - ${moment(servicesEndTimes[index], "HH:mm").format(
                    "hh:mm A"
                )}`,
                content: {
                    content: (
                        <div
                            style={{
                                padding: "5px 15px",
                            }}
                        >
                            <List as="ol">
                                {startTimes.map((t, i) => {
                                    return (
                                        <List.Item
                                            key={`availability-desc-time-${arrivalDate}-${index}-${i}`}
                                            as="li"
                                            value="-"
                                        >
                                            {`${servicesNames[i]} : ${moment(
                                                t,
                                                "HH:mm"
                                            ).format("hh:mm A")} - ${moment(
                                                t,
                                                "HH:mm"
                                            )
                                                .add(
                                                    servicesDuration[i],
                                                    "minutes"
                                                )
                                                .subtract(
                                                    servicesCleanupDuration[i],
                                                    "minutes"
                                                )
                                                .format("hh:mm A")}`}
                                        </List.Item>
                                    );
                                })}
                            </List>
                            <Button
                                onClick={() =>
                                    handleAvailabilityChoose(
                                        index,
                                        {
                                            ...metadata,
                                            index,
                                        },
                                        availabilityData
                                    )
                                }
                                content="Choose"
                                basic
                            />
                        </div>
                    ),
                },
            };
        });
        // const onlyFutureTimes = startAndEndTimes?.filter(
        //     ([s, e]) =>
        //         moment(
        //             avd + " " + s,
        //             "DD-MM-YYYY h:mm A"
        //         ).isAfter(moment())
        // );
        const isAllNull = allPanels?.reduce(
            (agg, val) => agg && val === null,
            true
        );
        if (isAllNull) {
            return (
                <Message
                    warning
                    header="No time available for the day"
                    content="Please choose another date or reorder your experience to find more availability"
                />
            );
        }
        return <Accordion defaultActiveIndex={0} panels={allPanels} />;
    };

    return (
        <div style={{ padding: "10px" }}>
            <Segment>
                <Grid>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <label>Arrival date:</label>
                            <span
                                style={{
                                    paddingLeft: "8px",
                                }}
                            >
                                <DatePicker
                                    format="dd/MM/yyyy"
                                    className="custom-date-picker"
                                    value={arrivalDate}
                                    minDate={new Date()}
                                    onChange={(date: Date) => {
                                        setArrivalDate(date);
                                        setArrivalWeekday(
                                            moment(date).format(
                                                "dddd"
                                            ) as Weekdays
                                        );
                                    }}
                                />
                            </span>
                        </Grid.Column>
                    </Grid.Row>
                    {unavailableServices.length > 0 ? (
                        <Grid.Row>
                            <Grid.Column>
                                <Message
                                    error
                                    header={`Booking can not be made on the ${moment(arrivalDate).format("Do MMM")} because the following ${
                                        unavailableServices.length > 1
                                            ? "services are"
                                            : "service is"
                                    } not available on ${moment(
                                        arrivalDate
                                    ).format("dddd")}`}
                                    list={unavailableServices.map(
                                        ({ name }) => name
                                    )}
                                />
                            </Grid.Column>
                        </Grid.Row>
                    ) : (
                        <>
                            <Grid.Row>
                                {servicesOrder.length >= 2 && show2Options ? (
                                    <>
                                        <Grid.Column width={8}>
                                            <label>Option 1</label>
                                            <span>
                                                <div
                                                    style={{
                                                        paddingTop: "10px",
                                                    }}
                                                >
                                                    <ul
                                                        style={{
                                                            zIndex: 99999999,
                                                            padding: "0px",
                                                            margin: "0px",
                                                            color: "black",
                                                        }}
                                                    >
                                                        {servicesOrder.map(
                                                            ({ name, key }) => (
                                                                <div
                                                                    key={key}
                                                                    style={{
                                                                        zIndex: 99999999,
                                                                        border: `1px solid #000`,
                                                                        padding:
                                                                            "10px",
                                                                        margin: "4px",
                                                                        borderRadius:
                                                                            "4px",
                                                                        background:
                                                                            "#fff",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        color: "black",
                                                                    }}
                                                                    className="sortable-item"
                                                                >
                                                                    <div
                                                                        style={{
                                                                            marginRight:
                                                                                "2px",
                                                                        }}
                                                                    >
                                                                        <Icon name="triangle right" />
                                                                    </div>
                                                                    <div>
                                                                        {name}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </ul>
                                                    {remainingExperiences &&
                                                        remainingExperiences.map(
                                                            (exp) =>
                                                                exp && (
                                                                    <div
                                                                        style={{
                                                                            zIndex: 99999999,
                                                                            border: `1px solid #000`,
                                                                            opacity: 0.5,
                                                                            padding:
                                                                                "10px",
                                                                            margin: "4px",
                                                                            borderRadius:
                                                                                "4px",
                                                                            background:
                                                                                "#fff",
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            cursor: "not-allowed",
                                                                            color: "black",
                                                                        }}
                                                                        className="sortable-item"
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                marginRight:
                                                                                    "2px",
                                                                            }}
                                                                        >
                                                                            <Icon name="triangle right" />
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                exp.name
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                        )}
                                                </div>
                                            </span>
                                        </Grid.Column>
                                        <Grid.Column width={8}>
                                            <label>Option 2</label>
                                            <span>
                                                <div
                                                    style={{
                                                        paddingTop: "10px",
                                                    }}
                                                >
                                                    <ul
                                                        style={{
                                                            zIndex: 99999999,
                                                            padding: "0px",
                                                            margin: "0px",
                                                        }}
                                                    >
                                                        {[
                                                            servicesOrder[1],
                                                            servicesOrder[0],
                                                            ...servicesOrder.slice(
                                                                2
                                                            ),
                                                        ].map(
                                                            ({ name, key }) => (
                                                                <div
                                                                    key={key}
                                                                    style={{
                                                                        zIndex: 99999999,
                                                                        border: `1px solid #000`,
                                                                        padding:
                                                                            "10px",
                                                                        margin: "4px",
                                                                        borderRadius:
                                                                            "4px",
                                                                        background:
                                                                            "#fff",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        color: "black",
                                                                    }}
                                                                    className="sortable-item"
                                                                >
                                                                    <div
                                                                        style={{
                                                                            marginRight:
                                                                                "2px",
                                                                        }}
                                                                    >
                                                                        <Icon name="triangle right" />
                                                                    </div>
                                                                    <div>
                                                                        {name}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </ul>
                                                    {remainingExperiences &&
                                                        remainingExperiences.map(
                                                            (exp) =>
                                                                exp && (
                                                                    <div
                                                                        style={{
                                                                            zIndex: 99999999,
                                                                            border: `1px solid #000`,
                                                                            opacity: 0.5,
                                                                            padding:
                                                                                "10px",
                                                                            margin: "4px",
                                                                            borderRadius:
                                                                                "4px",
                                                                            background:
                                                                                "#fff",
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            cursor: "not-allowed",
                                                                            color: "black",
                                                                        }}
                                                                        className="sortable-item"
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                marginRight:
                                                                                    "2px",
                                                                            }}
                                                                        >
                                                                            <Icon name="triangle right" />
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                exp.name
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                        )}
                                                </div>
                                            </span>
                                        </Grid.Column>
                                    </>
                                ) : (
                                    <Grid.Column width={8}>
                                        <label>Experiences order:</label>
                                        <span>
                                            <div
                                                style={{
                                                    paddingTop: "10px",
                                                }}
                                            >
                                                <SortableList
                                                    lockAxis="y"
                                                    items={servicesOrder}
                                                    onSortEnd={handleSortEnd}
                                                />
                                                {remainingExperiences &&
                                                    remainingExperiences.map(
                                                        (exp) =>
                                                            exp && (
                                                                <div
                                                                    style={{
                                                                        zIndex: 99999999,
                                                                        border: `1px solid #000`,
                                                                        opacity: 0.5,
                                                                        padding:
                                                                            "10px",
                                                                        margin: "4px",
                                                                        borderRadius:
                                                                            "4px",
                                                                        background:
                                                                            "#fff",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        cursor: "not-allowed",
                                                                        color: "black",
                                                                    }}
                                                                    className="sortable-item"
                                                                >
                                                                    <div
                                                                        style={{
                                                                            marginRight:
                                                                                "2px",
                                                                        }}
                                                                    >
                                                                        <Icon name="bars" />
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            exp.name
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                    )}
                                            </div>
                                        </span>
                                    </Grid.Column>
                                )}
                            </Grid.Row>
                            <Grid.Row style={{ paddingTop: 0 }}>
                                <Grid.Column
                                    textAlign={
                                        servicesOrder.length >= 2 &&
                                        show2Options
                                            ? "center"
                                            : "left"
                                    }
                                    width={16}
                                >
                                    <Button
                                        loading={isLoadingClosedDates}
                                        disabled={isLoadingClosedDates}
                                        onClick={handleCheckArrivalClick}
                                        basic
                                        content="Check availability"
                                    />
                                </Grid.Column>
                            </Grid.Row>
                        </>
                    )}
                </Grid>
                {isPublicHoliday && publicHolidayAffectedItems.length > 0 && (
                    <Message
                        info
                        header={`Its holiday on ${moment(arrivalDate).format(
                            "LL"
                        )}. Following different rates apply:`}
                        content={
                            <>
                                <List as="ol">
                                    {publicHolidayAffectedItems.map((cart) => (
                                        <List.Item
                                            key={`${cart.id}_cart_item`}
                                            as="li"
                                            value="-"
                                        >
                                            {`${cart.name}: $${cart.price} => $${cart.publicHolidayPrice}`}
                                        </List.Item>
                                    ))}
                                </List>
                            </>
                        }
                    />
                )}
                <Message
                    info
                    content={
                        <p>
                            <b>Note:</b> All times are Melbourne local time
                        </p>
                    }
                />
            </Segment>
            {isClosed ? (
                <Segment>
                    <Message
                        info
                        header={`Business closed on ${moment(
                            arrivalDate
                        ).format("LL")}.`}
                        content={`Our business is closed on ${moment(
                            arrivalDate
                        ).format("LL")}. Please select another date to book.`}
                    />
                </Segment>
            ) : isLoadingArrivalDates || isLoadingArrivalDates2 ? (
                <Segment>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column
                                textAlign={
                                    servicesOrder.length >= 2 && show2Options
                                        ? "center"
                                        : "left"
                                }
                            >
                                <BetLoader color="white" loading={true} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            ) : isErrorArrivalDates || isErrorArrivalDates2 ? (
                <Segment>
                    <Message
                        error
                        header="There was problem getting availabilities"
                        content="Please choose some other date"
                    />
                </Segment>
            ) : !availabilityData ? null : moment(arrivalDate).format(
                  "YYYY-MM-DD"
              ) !==
              moment(availabilityData["dateString"]).format(
                  "YYYY-MM-DD"
              ) ? null : availabilityData.isAvailable === false ? (
                <Segment
                    style={{
                        maxHeight: "500px",
                        overflow: "auto",
                    }}
                >
                    <Grid>
                        <Grid.Row>
                            <Grid.Column>
                                <Message
                                    warning
                                    header="Packages are not available on the day"
                                    content={
                                        availabilityData.isTuesOrWed
                                            ? "Packages with lunch and dinner are not available on Tuesday or Wednesday. Please select days between Thursday - Monday."
                                            : "The packages are not availalble that day. Please choose some another date to your convenience to find availability."
                                    }
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            ) : (
                <Segment
                    style={{
                        maxHeight: "500px",
                        overflow: "auto",
                    }}
                >
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={8}>
                                {availabilityData.allServiceStartTimes.length >
                                0 ? (
                                    getAvailabilityList(availabilityData)
                                ) : servicesOrder.length >= 2 &&
                                  show2Options &&
                                  availabilityData2 &&
                                  (availabilityData2.allServiceStartTimes || [])
                                      .length > 0 ? null : (
                                    <Message
                                        warning
                                        header="No time available for the day"
                                        content="Please choose another date or reorder your experience to find more availability"
                                    />
                                )}
                            </Grid.Column>
                            {servicesOrder.length >= 2 &&
                                show2Options &&
                                availabilityData2 &&
                                availabilityData2.isAvailable !== false && (
                                    <Grid.Column width={8}>
                                        {availabilityData2.allServiceStartTimes
                                            .length > 0 ? (
                                            getAvailabilityList(
                                                availabilityData2
                                            )
                                        ) : (
                                            <Message
                                                warning
                                                header="No time available for the day"
                                                content="Please choose another date or reorder your experience to find more availability"
                                            />
                                        )}
                                    </Grid.Column>
                                )}
                        </Grid.Row>
                    </Grid>
                </Segment>
            )}
        </div>
    );
};

export default AvailabilityUI;
