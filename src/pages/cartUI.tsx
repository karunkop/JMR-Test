import {
    Button,
    Grid,
    Icon,
    Segment,
    Container,
    Divider,
    Accordion,
    Loader,
    Message,
    Input,
    Form,
    Modal,
} from "semantic-ui-react";
import {
    CartItem,
    OnChooseAvailability,
} from "../types/coreInterfaces";
import { get } from "lodash";
import { Controller } from "react-hook-form";
import useCartUI from "../custom hooks/useCartUI";
import AvailabilityUI from "../components/availabilityUI";
import {
    primaryColor,
    secondaryColor,
} from "../utility/defaults";

const CartUI = ({
    onChooseAvailability,
}: {
    onChooseAvailability: OnChooseAvailability;
}) => {
    const {
        cart,
        openPackages,
        errors,
        widths,
        handleDeleteItemClick,
        handleCollapsableClick,
        control,
        hasErrors,
        handleSubmit,
        onSubmit,
        isLoading,
        isError,
        handleAddExperienceClick,
        handleVoucherButtonClick,
        total,
        isVoucher,
    } = useCartUI();
    // renders
    const items = cart.map(
        (item: CartItem, index: number) => {
            const isActive = openPackages.includes(index);
            return (
                <Grid.Row>
                    <Grid.Column width={widths[0]}>
                        <Button
                            onClick={() =>
                                handleDeleteItemClick(item)
                            }
                            icon="trash"
                        />
                    </Grid.Column>
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
                                    {item.servicesContent?.map(
                                        (s) => (
                                            <p>{s.name}</p>
                                        )
                                    )}
                                </Accordion.Content>
                            </>
                        ) : (
                            item.name
                        )}
                    </Grid.Column>
                    {!isVoucher && (
                        <Grid.Column width={widths[2]}>
                            <Form.Field
                                error={get(
                                    errors,
                                    `guestsCount.${index}`,
                                    false
                                )}
                                required
                            >
                                <Controller
                                    name={`guestsCount.${index}`}
                                    control={control}
                                    rules={{
                                        required: true,
                                        min: 2,
                                        pattern: /^\d+$/,
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            style={{
                                                maxWidth:
                                                    "50px",
                                            }}
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Field>
                        </Grid.Column>
                    )}
                    <Grid.Column
                        width={widths[isVoucher ? 2 : 3]}
                    >
                        {!hasErrors
                            ? `$${+item.price}`
                            : "-"}
                    </Grid.Column>
                </Grid.Row>
            );
        }
    );

    return (
        <section className="cart-wrapper center text-center">
            {hasErrors && (
                <Message
                    error
                    content="Guests is invalid. Please make sure all the experiences have at least 2 guests"
                />
            )}
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Segment
                    style={{
                        borderBottomLeftRadius: "0px",
                        borderBottomRightRadius: "0px",
                    }}
                >
                    <Accordion>
                        <Container>
                            <h2>
                                <Icon
                                    style={{
                                        marginRight: "8px",
                                    }}
                                    size="small"
                                    name="shopping cart"
                                />
                                Cart
                            </h2>
                            <Divider />
                            {isLoading ? (
                                <Loader active />
                            ) : isError ? (
                                <Message
                                    content={
                                        <>
                                            <p>
                                                Couldn't
                                                load cart
                                                experience
                                                details.
                                            </p>
                                            <Button
                                                onClick={
                                                    handleAddExperienceClick
                                                }
                                                color={
                                                    secondaryColor
                                                }
                                            >
                                                Add
                                                experience
                                            </Button>
                                        </>
                                    }
                                />
                            ) : cart.length === 0 ? (
                                <Message
                                    content={
                                        <>
                                            <p>
                                                No items in
                                                cart
                                            </p>
                                            <Button
                                                onClick={
                                                    handleAddExperienceClick
                                                }
                                                basic
                                            >
                                                Add
                                                experience
                                            </Button>
                                        </>
                                    }
                                />
                            ) : (
                                <Grid>
                                    <Grid.Row>
                                        <Grid.Column
                                            width={
                                                widths[0]
                                            }
                                        ></Grid.Column>
                                        <Grid.Column
                                            width={
                                                widths[1]
                                            }
                                        >
                                            Items
                                        </Grid.Column>
                                        {!isVoucher && (
                                            <Grid.Column
                                                width={
                                                    widths[2]
                                                }
                                            >
                                                Guests
                                            </Grid.Column>
                                        )}
                                        <Grid.Column
                                            width={
                                                widths[
                                                    isVoucher
                                                        ? 2
                                                        : 3
                                                ]
                                            }
                                        >
                                            Price per guest
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Divider />
                                    {items}
                                    <Divider />

                                    {!isVoucher && (
                                        <>
                                            <Grid.Row
                                                columns={4}
                                            >
                                                <Grid.Column
                                                    width={
                                                        4
                                                    }
                                                >
                                                    {" "}
                                                    Total
                                                </Grid.Column>
                                                <Grid.Column
                                                    width={
                                                        isVoucher
                                                            ? 4
                                                            : 10
                                                    }
                                                />
                                                <Grid.Column
                                                    width={
                                                        isVoucher
                                                            ? 8
                                                            : 2
                                                    }
                                                >
                                                    {!hasErrors
                                                        ? `$${total}`
                                                        : "-"}
                                                </Grid.Column>
                                            </Grid.Row>
                                            <Divider />
                                        </>
                                    )}
                                </Grid>
                            )}
                        </Container>
                    </Accordion>
                </Segment>
                {cart.length > 0 && !isError && (
                    <Segment
                        style={{
                            borderTopLeftRadius: "0px",
                            borderTopRightRadius: "0px",
                        }}
                    >
                        {cart.find((i) => i.isVoucher) ? (
                            <Grid>
                                <Grid.Row columns={2}>
                                    <Grid.Column centered>
                                        <Button
                                            onClick={
                                                handleAddExperienceClick
                                            }
                                            basic
                                        >
                                            Add experience
                                        </Button>
                                    </Grid.Column>
                                    <Grid.Column centered>
                                        <Button
                                            onClick={
                                                handleVoucherButtonClick
                                            }
                                            color={
                                                secondaryColor
                                            }
                                        >
                                            Add guests
                                        </Button>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        ) : (
                            <Grid>
                                <Grid.Row columns={2}>
                                    <Grid.Column centered>
                                        <Button
                                            basic
                                            onClick={
                                                handleAddExperienceClick
                                            }
                                        >
                                            Add experience
                                        </Button>
                                    </Grid.Column>
                                    <Grid.Column centered>
                                        <Modal
                                            trigger={
                                                <Button
                                                    basic
                                                    type="submit"
                                                    disabled={
                                                        isLoading ||
                                                        hasErrors ||
                                                        cart.length ===
                                                            0
                                                    }
                                                >
                                                    Check
                                                    availability
                                                </Button>
                                            }
                                            header="Choose arrival date and time"
                                            content={
                                                <AvailabilityUI
                                                    onChooseAvailability={
                                                        onChooseAvailability
                                                    }
                                                />
                                            }
                                        />
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        )}
                    </Segment>
                )}
            </Form>
        </section>
    );
};

export default CartUI;
