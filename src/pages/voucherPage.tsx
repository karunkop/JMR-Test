import { useState } from "react";
import queryString from "query-string";
import {
    Modal,
    Icon,
    Segment,
    Button,
    Form,
    Input,
    Message,
    List,
    Header,
    Checkbox,
    Loader,
    Grid,
    TextArea,
} from "semantic-ui-react";
import ReactSelect, { OptionsType } from "react-select";
import { has, map } from "lodash";
import {
    useForm,
    Controller,
    SubmitHandler,
} from "react-hook-form";
import backgroundImage from "../background2.jpg";
import { emailValidator } from "../utility/validators";
import { VoucherDetailsInput } from "../types/coreInterfaces";
import { useCreateVoucher } from "../api";
import { useCartItemContext } from "../context/cartContext";
import { useHistory } from "react-router-dom";

const options: OptionsType<{
    value: boolean;
    label: string;
    key: string;
}> = [
    { key: "yes_newsletter", label: "Yes", value: true },
    {
        key: "no_newsletter",
        label: "No thanks",
        value: false,
    },
];
const VoucherPage = () => {
    const history = useHistory();
    const [agreedToTerms, setAgreedToTerms] =
        useState<boolean>(false);
    const [numberOfGuests, setNumberOfGuests] =
        useState<number>(1);
    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger,
        getValues,
    } = useForm<VoucherDetailsInput>({
        defaultValues: {
            guestDetails: [
                {
                    fromName: "",
                    toName: "",
                    email: "",
                    message: "",
                },
            ],
            subscribe: { label: "No thanks", value: false },
        },
    });
    const { cart } = useCartItemContext();
    const [guestListPage, setGuestListPage] =
        useState<boolean>(false);
    const [url, setUrl] = useState<string | undefined>();
    const { mutate, isLoading, data, isSuccess } =
        useCreateVoucher({
            onSuccess: (data) => {
                const queryParams = queryString.stringify({
                    amount: data.orderResponse.entry.amount,
                    description: `Payment for Japanese Mountain Retreat voucher of ${data.orderResponse.entry.id}. Order ID: {{${data.orderResponse.entry.id}}}`,
                    amount_editable: false,
                    success_url:
                        process.env.NODE_ENV ===
                        "development"
                            ? `http://localhost:3000/booking/${data.orderResponse.entry.id}?isVoucher=true`
                            : `https://experience.japanesemountainretreat.com.au/booking/${data.orderResponse.entry.id}?isVoucher=true`,
                    email: data.guestsData[0]?.entry.email,
                    field1label: "Order Id",
                    field1value:
                        data.orderResponse.entry.id,
                });
                const temp_url =
                    process.env.NODE_ENV === "development"
                        ? `https://pay.pinpayments.com/riiy/sc/test?${queryParams}`
                        : `https://pay.pinpayments.com/riiy/sc?${queryParams}`;
                setUrl(temp_url);
            },
        });

    const onSubmit: SubmitHandler<VoucherDetailsInput> = (
        data
    ) => {
        const guestDetails = data.guestDetails.slice(
            0,
            numberOfGuests
        );
        const perGuestPrice = cart.reduce(
            (agg, c) => +c.price + agg,
            0
        );
        const totalPrice = perGuestPrice * numberOfGuests;
        const d = {
            ...data,
            guestDetails,
            serviceIds: cart
                .filter((c) => !c.isPackage)
                .map((c) => "" + c.id),
            packageIds: cart
                .filter((c) => c.isPackage)
                .map((c) => "" + c.id),
            voucherTotalPrice: totalPrice,
            metadata: {
                cart,
                perGuestPrice,
                guestDetails,
            },
        };
        mutate(d);
    };

    const handleNextClick = async () => {
        const validated = await trigger([
            "firstName",
            "lastName",
            "email",
            "phone",
            "subscribe",
        ]);
        if (validated) {
            const values = getValues([
                "firstName",
                "lastName",
                "email",
                "guestDetails",
            ]);
            const newGuestDetails =
                values[3].map((v) => {
                    return {
                        ...v,
                        email: values[2],
                        fromName: `${values[0]} ${values[1]}`,
                    };
                }) || [];
            setValue("guestDetails", newGuestDetails);
            setGuestListPage(true);
        }
    };

    const handleAddGuestClick = () => {
        const values = getValues([
            "firstName",
            "lastName",
            "email",
            "guestDetails",
        ]);
        const newGuestDetails = [
            ...values[3],
            {
                toName: "",
                message: "",
                email: values[2],
                fromName: `${values[0]} ${values[1]}`,
            },
        ];
        setValue("guestDetails", newGuestDetails);
        setNumberOfGuests(numberOfGuests + 1);
    };

    const handleGuestDelete = (i: number) => {
        const guests = getValues("guestDetails");
        const newGuests = guests.filter(
            (_g, ind) => ind !== i
        );
        setValue("guestDetails", newGuests);
        setNumberOfGuests(numberOfGuests - 1);
    };

    const guestDetails = watch("guestDetails");
    const getGuestArrays = () => {
        let segments: JSX.Element[] = [];
        for (let i = 0; i < numberOfGuests; i++) {
            const segment = (
                <Segment clearing>
                    {/* <Header as="h4" content={`Guest ${i + 1}`} /> */}
                    <Form.Group widths="equal">
                        <Form.Field
                            error={has(
                                errors,
                                `guestDetails.${i}.fromName`
                            )}
                            required
                        >
                            <label>From Name:</label>
                            <Controller
                                name={`guestDetails.${i}.fromName`}
                                control={control}
                                rules={{
                                    required: `${
                                        i + 1
                                    }'s from name is required`,
                                }}
                                render={({ field }) => (
                                    <Input {...field} />
                                )}
                            />
                        </Form.Field>
                        <Form.Field
                            error={has(
                                errors,
                                `guestDetails.${i}.toName`
                            )}
                            required
                        >
                            <label>To Name:</label>
                            <Controller
                                name={`guestDetails.${i}.toName`}
                                control={control}
                                rules={{
                                    required: `Guest ${
                                        i + 1
                                    }'s name is required`,
                                }}
                                render={({ field }) => (
                                    <Input {...field} />
                                )}
                            />
                        </Form.Field>
                        <Form.Field
                            error={has(
                                errors,
                                `guestDetails.${i}.email`
                            )}
                            required
                        >
                            <label>
                                Email to send voucher
                            </label>
                            <Controller
                                name={`guestDetails.${i}.email`}
                                control={control}
                                rules={{
                                    required: `Guest ${
                                        i + 1
                                    }'s email is required`,
                                    pattern: {
                                        value: emailValidator,
                                        message: `Guest ${
                                            i + 1
                                        } email is incorrect`,
                                    },
                                }}
                                render={({ field }) => (
                                    <Input {...field} />
                                )}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Field
                        error={has(
                            errors,
                            `guestDetails.${i}.message`
                        )}
                    >
                        <label>Message</label>
                        <Controller
                            name={`guestDetails.${i}.message`}
                            control={control}
                            rules={{}}
                            render={({ field }) => (
                                <TextArea {...field} />
                            )}
                        />
                    </Form.Field>
                    <Grid>
                        <Grid.Row centered>
                            <Modal
                                trigger={
                                    <Button
                                        basic
                                        icon="eye"
                                        onClick={(e) => {
                                            e.preventDefault();
                                        }}
                                        content="Preview"
                                    />
                                }
                                closeIcon={true}
                                style={{ width: "auto" }}
                                content={
                                    <div
                                        style={{
                                            position:
                                                "relative",
                                            height: "1080px",
                                            width: "1080px",
                                        }}
                                    >
                                        <img
                                            alt="Japanese Mountain Retreat"
                                            style={{
                                                padding:
                                                    "0",
                                                margin: "0",
                                                minHeight:
                                                    "99%",
                                                objectFit:
                                                    "cover",
                                            }}
                                            // src="https://secure.netbookings.com.au/business-files/day-spa/japanese-mountain-retreat-mineral-springs-and-spa/Gift-Background/background.jpg?13/07/2021 2:22:42 PM"
                                            src={
                                                backgroundImage
                                            }
                                        />
                                        <div
                                            style={{
                                                top: "90px",
                                                right: "110px",
                                                color: "#cee5f5",
                                                position:
                                                    "absolute",
                                                padding:
                                                    "36px 24px",
                                                background:
                                                    "rgba(25, 20, 20, 0.75) none repeat scroll 0% 0%",
                                                transform:
                                                    "scale(1.1)",
                                            }}
                                        >
                                            <p>
                                                Dear{" "}
                                                {
                                                    guestDetails[
                                                        i
                                                    ].toName
                                                }
                                                ,
                                            </p>
                                            <p>
                                                {
                                                    guestDetails[
                                                        i
                                                    ]
                                                        .message
                                                }
                                            </p>
                                            <p>
                                                From{" "}
                                                {
                                                    guestDetails[
                                                        i
                                                    ]
                                                        .fromName
                                                }
                                            </p>
                                            <hr />
                                            <p>
                                                This gift
                                                certificate
                                                entitles you
                                                to:
                                            </p>
                                            <p>
                                                <ul>
                                                    {cart.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <li>
                                                                1
                                                                x{" "}
                                                                {
                                                                    item.name
                                                                }
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </p>

                                            <hr />

                                            <p>
                                                Redeem code:
                                                XXXXXX
                                            </p>
                                            <p>
                                                Valid until:
                                                XXXXXX
                                            </p>
                                            <p
                                                style={{
                                                    marginTop:
                                                        "16px",
                                                }}
                                            >
                                                You will
                                                need to call
                                                Japanese
                                                Mountain
                                                Retreat to
                                                book a date
                                                and time.
                                            </p>
                                            <p>
                                                Phone: +61 3
                                                9737 0086, 7
                                                days a week.
                                            </p>
                                        </div>
                                    </div>
                                }
                            />
                            <Button
                                icon="minus"
                                content="Delete"
                                onClick={() =>
                                    handleGuestDelete(i)
                                }
                                basic
                            />
                        </Grid.Row>
                    </Grid>
                </Segment>
            );
            segments = [...segments, segment];
        }
        return segments;
    };

    if (isSuccess && data && url) {
        const guestsCount = numberOfGuests;
        return (
            <section className="cart-wrapper center">
                <Segment>
                    <Message
                        success
                        header="Voucher ordered successfully."
                        content={
                            <>
                                <p>
                                    Vouchers ordered for{" "}
                                    {guestsCount} guests at{" "}
                                    {"$" +
                                        data?.orderResponse
                                            .entry
                                            .amount}{" "}
                                    total.
                                </p>
                            </>
                        }
                    />
                    <Message
                        warning
                        header="Note before you proceed"
                        content="Please do not close this tab immediately after payment. You will be shown booking status. Thank you"
                    />
                    <Grid>
                        <Grid.Row centered>
                            <a href={url}>
                                <Button
                                    basic
                                    content="Proceed to payment"
                                />
                            </a>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </section>
        );
    }
    const totalPrice = cart.reduce(
        (agg, c) => +c.price + agg,
        0
    );
    return (
        <section className="cart-wrapper center">
            <Form onSubmit={handleSubmit(onSubmit)}>
                {!guestListPage ? (
                    <Segment>
                        <Header as="h2" content="Details" />
                        {Object.keys(errors).length > 0 && (
                            <Message
                                negative
                                content={
                                    <>
                                        <p>
                                            Please resolve
                                            following errors
                                            to proceed.
                                        </p>
                                        <List as="ol">
                                            {map(
                                                errors as any,
                                                ({
                                                    message,
                                                }) => (
                                                    <List.Item
                                                        key={`${message}_error_list_item`}
                                                        as="li"
                                                        value="-"
                                                    >
                                                        {
                                                            message
                                                        }
                                                    </List.Item>
                                                )
                                            )}
                                        </List>
                                    </>
                                }
                            />
                        )}
                        <Form.Group widths="equal">
                            <Form.Field
                                error={has(
                                    errors,
                                    "firstName"
                                )}
                                required
                            >
                                <label>First name</label>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{
                                        required:
                                            "First name is required",
                                    }}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Input {...field} />
                                    )}
                                />
                            </Form.Field>
                            <Form.Field
                                error={has(
                                    errors,
                                    "lastName"
                                )}
                                required
                            >
                                <label>Last name</label>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{
                                        required:
                                            "Last name is required",
                                    }}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Input {...field} />
                                    )}
                                />
                            </Form.Field>
                        </Form.Group>

                        <Form.Group widths="equal">
                            <Form.Field
                                error={has(errors, "email")}
                                required
                            >
                                <label>Email</label>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required:
                                            "Email is required",
                                        pattern: {
                                            value: emailValidator,
                                            message:
                                                "Email is invalid",
                                        },
                                    }}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Input {...field} />
                                    )}
                                />
                            </Form.Field>

                            <Form.Field
                                error={has(errors, "phone")}
                                required
                            >
                                <label>Mobile phone</label>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{
                                        required:
                                            "Mobile phone number is required",
                                    }}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Input {...field} />
                                    )}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Field
                            error={has(errors, "subscribe")}
                        >
                            <label>
                                Be the first to hear about
                                our latest news and events
                                via our e-newsletter
                            </label>
                            <Controller
                                render={({ field }) => (
                                    <ReactSelect
                                        className="jmr-select"
                                        classNamePrefix="jmr-react-select"
                                        theme={(theme) => ({
                                            ...theme,
                                            colors: {
                                                ...theme.colors,
                                                primary25:
                                                    "#ffffffd3",
                                                primary:
                                                    "white",
                                            },
                                        })}
                                        options={options}
                                        {...field}
                                    />
                                )}
                                name="subscribe"
                                control={control}
                                rules={{ required: true }}
                            />
                        </Form.Field>

                        <Grid>
                            <Grid.Row centered columns={2}>
                                <Grid.Column textAlign="center">
                                    <Button
                                        onClick={() =>
                                            history.push(
                                                "/cart"
                                            )
                                        }
                                        content="Back"
                                    />
                                </Grid.Column>
                                <Grid.Column textAlign="center">
                                    <Button
                                        onClick={
                                            handleNextClick
                                        }
                                        content="Next"
                                    />
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Segment>
                ) : (
                    <Segment>
                        <Header
                            as="h2"
                            content="Guest details"
                        />
                        {errors.guestDetails && (
                            <Message
                                negative
                                content="Please fill all the guest details correctly"
                            />
                        )}
                        {getGuestArrays()}
                        <Grid>
                            <Grid.Row centered>
                                <Button
                                    basic
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddGuestClick();
                                    }}
                                    icon="plus"
                                    content="Add guest"
                                />
                            </Grid.Row>
                            <Grid.Row
                                style={{ paddingTop: 0 }}
                                centered
                            >
                                <span>
                                    <b>Total:</b> $
                                    {totalPrice} X{" "}
                                    {numberOfGuests} = $
                                    {totalPrice *
                                        numberOfGuests}
                                </span>
                            </Grid.Row>
                        </Grid>
                        <Form.Field
                            style={{ paddingTop: "1rem" }}
                            error={!agreedToTerms}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Checkbox
                                    style={{
                                        marginRight: "3px",
                                    }}
                                    label={
                                        "By continuing I agree to the "
                                    }
                                    onChange={() =>
                                        setAgreedToTerms(
                                            !agreedToTerms
                                        )
                                    }
                                    checked={agreedToTerms}
                                />
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="http://www.japanesemountainretreat.com.au/terms-conditions/"
                                >
                                    Terms and conditions -{" "}
                                    <Icon name="eye" />
                                </a>
                            </div>
                        </Form.Field>
                        {!agreedToTerms && (
                            <Message
                                negative
                                content={
                                    "You need to agree to our terms and condition to continue"
                                }
                            />
                        )}
                        <Grid>
                            <Grid.Row centered columns={2}>
                                <Grid.Column textAlign="center">
                                    <Button
                                        onClick={() =>
                                            setGuestListPage(
                                                false
                                            )
                                        }
                                        content="Back"
                                    />
                                </Grid.Column>
                                <Grid.Column textAlign="center">
                                    <Form.Field
                                        disabled={
                                            isLoading ||
                                            !agreedToTerms
                                        }
                                        control={Button}
                                    >
                                        {isLoading && (
                                            <Loader
                                                active
                                            />
                                        )}
                                        {isLoading
                                            ? "Loading..."
                                            : "Checkout"}
                                    </Form.Field>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Segment>
                )}
            </Form>
        </section>
    );
};

export default VoucherPage;
