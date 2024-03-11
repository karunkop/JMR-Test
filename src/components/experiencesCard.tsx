import _ from "lodash";
import {
    Label,
    Button,
    Image,
    Card,
} from "semantic-ui-react";
import {
    Experience,
    ExperienceDTO,
} from "../types/apiInterfaces";
import { useCartItemContext } from "../context/cartContext";
import { useHistory } from "react-router-dom";

const CardsUI = ({
    experiences,
}: {
    experiences: ExperienceDTO[];
}) => {
    const { addItem, removeItem, idsMap } =
        useCartItemContext();
    const history = useHistory();

    const handleAddToCartClick = (item: Experience) => {
        const servicesContent = _.sortBy(
            item.servicesList
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
        // push to voucher page
        if (item.isVoucher) {
            addItem({
                needs2Options: false,
                isVoucher: true,
                id: item.id,
                name: item.name,
                price: item.price,
                publicHolidayPrice: item.publicHolidayPrice,
                isPackage: item.isPackage,
                categories: item.categories,
                isDining:
                    item.categories.filter(
                        ({ value }) =>
                            value === "Dining" ||
                            value ===
                                "Six Course Omakase Dinner" ||
                            value === "Japanese Lunch"
                    ).length > 0,
                adults: 1,
                ignoreFromAvailabilityCalculation:
                    item.ignoreFromAvailabilityCalculation ||
                    false,
                requiresRoom: item.requiresRoom || false,
                servicesContent,
            });
            history.push("/cart");
        } else {
            addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                publicHolidayPrice: item.publicHolidayPrice,
                isPackage: item.isPackage,
                categories: item.categories,
                needs2Options:
                    item.allow2AvailabilityOptions || false,
                isDining:
                    item.categories.filter(
                        ({ value }) =>
                            value === "Dining" ||
                            value ===
                                "Six Course Omakase Dinner" ||
                            value === "Japanese Lunch"
                    ).length > 0,
                adults: 2,
                ignoreFromAvailabilityCalculation:
                    item.ignoreFromAvailabilityCalculation ||
                    false,
                requiresRoom: item.requiresRoom || false,
                servicesContent,
            });
            history.push("/cart");
        }
    };

    if (experiences.length === 0) {
        return null;
    }

    return (
        <Card.Group>
            {experiences.map((experience, i) => {
                return (
                    <Card
                        style={{
                            margin: "1.5em",
                            background: "#F7F6F3",
                            color: "black",
                        }}
                        key={`experience_card_${i}_${experience.id}`}
                    >
                        <Card.Content>
                            <Image
                                style={{
                                    marginBottom:
                                        experience.isPackage ||
                                        experience.isVoucher
                                            ? "4px"
                                            : "32px",
                                }}
                                src={
                                    experience.image ||
                                    "https://react.semantic-ui.com/images/wireframe/image.png"
                                }
                            />
                            {(experience.isPackage ||
                                experience.isVoucher) && (
                                <Label
                                    color="teal"
                                    ribbon="right"
                                >
                                    {experience.isVoucher
                                        ? "Voucher"
                                        : "Package"}
                                </Label>
                            )}
                            <Card.Header>
                                {experience.name}
                            </Card.Header>
                            <Card.Meta
                                style={{
                                    fontWeight: "700",
                                    marginTop: "12px",
                                }}
                            >
                                ${experience.price}
                                {!experience.isVoucher &&
                                    " per person"}
                            </Card.Meta>
                            <Card.Description>
                                {experience.description && (
                                    <div
                                        style={{
                                            maxHeight:
                                                "200px",
                                            overflow:
                                                "auto",
                                            opacity: "0.75",
                                            color: "black"
                                        }}
                                        className="desc-experience"
                                        dangerouslySetInnerHTML={{
                                            __html: experience.description,
                                        }}
                                    ></div>
                                )}
                            </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            <div className="ui two buttons">
                                {idsMap[experience.id] ? (
                                    <Button
                                        onClick={() =>
                                            removeItem(
                                                experience.id
                                            )
                                        }
                                        icon="trash"
                                        basic
                                        content="Remove"
                                    />
                                ) : experience.isVoucher ? (
                                    <Button
                                        onClick={() =>
                                            handleAddToCartClick(
                                                experience
                                            )
                                        }
                                        icon="cart"
                                        content="Buy voucher"
                                    />
                                ) : (
                                    <Button
                                        onClick={() =>
                                            handleAddToCartClick(
                                                experience
                                            )
                                        }
                                        icon="cart"
                                        content="Add to cart"
                                        basic
                                    />
                                )}
                            </div>
                        </Card.Content>
                    </Card>
                );
            })}
        </Card.Group>
    );
};

export default CardsUI;
