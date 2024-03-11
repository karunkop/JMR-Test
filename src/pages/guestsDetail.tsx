import { useState } from "react";
import {
    Icon,
    Segment,
    Button,
    Form,
    Input,
    Message,
    List,
    Header,
    Checkbox,
    Grid,
    TextArea,
} from "semantic-ui-react";
import ReactSelect, { OptionsType } from "react-select";
import { has, map } from "lodash";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { emailValidator } from "../utility/validators";
import {
    ChoosenAvailabilityType,
    GuestsDetailsInput,
    OnGuestsAndOrderBody,
} from "../types/coreInterfaces";
import { useCartItemContext } from "../context/cartContext";
import moment from "moment-timezone";
import { useHistory } from "react-router-dom";
import _ from "lodash";

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
const GuestDetails = ({
    choosenAvailabilityData,
    onGuestsAndOrderBody,
    guestsAndOrderBody,
}: {
    choosenAvailabilityData: ChoosenAvailabilityType | undefined;
    onGuestsAndOrderBody: OnGuestsAndOrderBody;
    guestsAndOrderBody?: GuestsDetailsInput;
}) => {
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(
        guestsAndOrderBody !== undefined
    );

    const [hasDuplicateEmails, setHasDuplicateEmails] = useState<boolean>(
        false
    );

    const parseGuestsAndOrderBody = () => {
        if (guestsAndOrderBody) {
            const {
                firstName,
                lastName,
                phone,
                email,
                guestDetails,
                subscribe,
                dietaryRequirements
            } = guestsAndOrderBody;
            if (_.get(guestsAndOrderBody, "metadata.addAsGuest1", false)) {
                return {
                    firstName,
                    lastName,
                    phone,
                    email,
                    subscribe,
                    guestDetails: [
                        {
                            firstName,
                            lastName,
                            email,
                            mobile: phone,
                            dietaryRequirements: dietaryRequirements || "",
                        },
                        ...guestDetails,
                    ],
                };
            }
            return {
                firstName,
                lastName,
                phone,
                email,
                subscribe,
                guestDetails,
            };
        }
        return {};
    };
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        trigger,
        getValues,
    } = useForm<GuestsDetailsInput>({
        defaultValues: {
            // firstName: "test",
            // lastName: "last",
            // email: "test@test.com",
            // phone: "9860722217",
            // guestDetails: [
            //   {
            //     firstName: "",
            //     lastName: "",
            //     email: "",
            //     mobile: "",
            //   },
            // ],
            subscribe: { label: "No thanks", value: false },
            ...parseGuestsAndOrderBody(),
        },
    });
    const { cart } = useCartItemContext();
    const [guestListPage, setGuestListPage] = useState<boolean>(false);
    const history = useHistory();

    const hasDining = cart.reduce((acc, c) => c.isDining || acc, false);

    const hasDuplicates = (array: string[]): boolean => {
    const emailSet: Set<string> = new Set();

    return array.some((email: string) => {
        if (emailSet.has(email)) {
        return true; // Duplicate found
        }
        emailSet.add(email);
        return false; // No duplicate found yet
    });
    };


    const onSubmit: SubmitHandler<GuestsDetailsInput> = data => {
        const guestEmails = data.guestDetails.map(gd=> gd.email);

        if(hasDuplicates(guestEmails)){
           setHasDuplicateEmails(true)
           return; 
        }


        if (choosenAvailabilityData) {
            const { arrivalDate, metadata } = choosenAvailabilityData;
            const checkInCheckOut = metadata.servicesStartTimes[
                metadata.index
            ].map((t, i) => {
                return [
                    metadata.servicesIds[i],
                    {
                        checkIn: moment
                            .tz(
                                `${arrivalDate} ${t}`,
                                "DD-MM-YYYY HH:mm",
                                "Australia/Melbourne"
                            )
                            .toISOString(),

                        checkOut: moment
                            .tz(
                                `${arrivalDate} ${t}`,
                                "DD-MM-YYYY HH:mm",
                                "Australia/Melbourne"
                            )
                            .add(metadata.servicesDuration[i], "minutes")
                            .subtract(
                                metadata.servicesCleanupDuration[i],
                                "minutes"
                            )
                            .toISOString(),
                    },
                ];
            });
            // const bookingCheckInCheckOutData = _.fromPairs(checkInCheckOut);
            const bookingCheckInCheckOutData = checkInCheckOut;
            const primaryGuest = data.guestDetails.find(gd=> gd.email && data.email && gd.email===data.email);
            const addAsGuest1 = !!primaryGuest
            let primaryGuestDietaryRequirements = primaryGuest? primaryGuest.dietaryRequirements || "":""
            let packages = cart.filter(c => c.isPackage);
            let services = cart.filter(c => !c.isPackage);
            const notes_packages = packages.length? `<p><b>Packages:</b></p><ul>${packages.map(v=>`<li>${v.name||""}</li>`).join("")}</ul>`:``;
            const notes_services = services.length? `<p><b>Services:</b></p><ul>${services.map(v=>`<li>${v.name||""}</li>`).join("")}</ul>`:``;
            const guestDetails = (data.guestDetails || []).filter(gd=> !!gd.email).filter(gd=> primaryGuest? gd.email !==primaryGuest.email : true);
            const gd = [
                {
                    dietaryRequirements: primaryGuestDietaryRequirements,
                    firstName: data.firstName,
                    lastName: data.lastName,
                 }, 
                 ...guestDetails,
            ]
            const guests = `<p><b>Guests: </b></p><ul>${gd.map(v=>`<li>${v.firstName} ${v.lastName}</li>`).join("")}</ul>`
            const dietary_requirements = `<p><b>Dietary Requirements: </b></p><ul>${gd.map(v=>`<li>${v.firstName} ${v.lastName}: ${v.dietaryRequirements||"-"}</li>`).join("")}</ul>`
            const order_placed_on = `<p><b>Order placed on:</b> ${moment().format("Do MMM YYYY")}</p>`;
            const notes = [
                guests,
                notes_packages,
                notes_services,
                dietary_requirements,
                order_placed_on,
            ]

            const d = {
                ...data,
                dietaryRequirements: primaryGuestDietaryRequirements,
                guestDetails,
                packages: packages.map(c => "" + c.id),
                services: services.map(c => "" + c.id),
                packagesGuests: cart
                    .filter(c => c.isPackage)
                    .map(c => c.adults),
                servicesGuests: cart
                    .filter(c => !c.isPackage)
                    .map(c => c.adults),
                arrivalDate,
                isPrimaryGuestInGuestList: addAsGuest1,
                metadata: {
                    choosenAvailabilityData,
                    cart,
                    bookingCheckInCheckOutData,
                    addAsGuest1,
                    notes,
                },
            };

            onGuestsAndOrderBody(d);
            history.push(`/checkout`);
        }
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
            const data = getValues();
            if(!_.get(data, "guestDetails.0.firstName")){
                setValue("guestDetails.0.firstName", data.firstName)
            }
            if(!_.get(data, "guestDetails.0.lastName")){
                setValue("guestDetails.0.lastName", data.firstName)
            }
            if(!_.get(data, "guestDetails.0.mobile")){
                setValue("guestDetails.0.mobile", data.phone)
            }
            if(!_.get(data, "guestDetails.0.email")){
                setValue("guestDetails.0.email", data.email)
            }
            setGuestListPage(true);
        }
    };

    const getGuestArrays = () => {
        let segments: JSX.Element[] = [];
        const numberOfGuests = cart.reduce(
            (agg, v) => Math.max(agg, v.adults),
            0
        );
        for (let i = 0; i < numberOfGuests; i++) {
            const segment = (
                <Segment>
                    <Header as="h4" content={`Guest ${i + 1}`} />
                    {(
                        <>
                            <Form.Group widths="equal">
                                <Form.Field
                                    error={has(
                                        errors,
                                        `guestDetails.${i}.firstName`
                                    )}
                                    required={true}
                                >
                                    <label>First name</label>
                                    <Controller
                                        name={`guestDetails.${i}.firstName`}
                                        control={control}
                                        rules={{
                                            required: `Guest ${
                                                i + 1
                                            }'s first name is required`,
                                        }}
                                        render={({ field }) => (
                                            <Input {...field} />
                                        )}
                                    />
                                </Form.Field>
                                <Form.Field
                                    error={has(
                                        errors,
                                        `guestDetails.${i}.lastName`
                                    )}
                                    required={true}
                                >
                                    <label>Last name</label>
                                    <Controller
                                        name={`guestDetails.${i}.lastName`}
                                        control={control}
                                        rules={{
                                            required: `Guest ${
                                                i + 1
                                            }'s last name is required`,
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
                                    required={true}
                                >
                                    <label>Email</label>
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

                                <Form.Field
                                    error={has(
                                        errors,
                                        `guestDetails.${i}.mobile`
                                    )}
                                    required={true}
                                >
                                    <label>Mobile phone</label>
                                    <Controller
                                        name={`guestDetails.${i}.mobile`}
                                        control={control}
                                        rules={{
                                            required: `Guest ${
                                                i + 1
                                            }'s mobile phone number is required`,
                                        }}
                                        render={({ field }) => (
                                            <Input {...field} />
                                        )}
                                    />
                                </Form.Field>
                            </Form.Group>
                            {hasDining && (
                                <Form.Field
                                    error={has(
                                        errors,
                                        `guestDetails.${i}.dietaryRequirements`
                                    )}
                                    required={true}
                                >
                                    <label>Dietary requirements</label>
                                    <Controller
                                        name={`guestDetails.${i}.dietaryRequirements`}
                                        control={control}
                                        rules={{
                                            required: `Guest ${
                                                i + 1
                                            }'s dietary requirements is required`,
                                        }}
                                        render={({ field }) => (
                                            <TextArea
                                                placeholder="e.g. Is vegan, allergic to peanuts"
                                                {...field}
                                            />
                                        )}
                                    />
                                </Form.Field>
                            )}
                        </>
                    )}
                </Segment>
            );
            segments = [...segments, segment];
        }
        return segments;
    };

    return (
        <section className="cart-wrapper center">
            <Form onSubmit={handleSubmit(onSubmit)}>
                {!guestListPage ? (
                    <Segment>
                        <Header as="h2" content="Details" />
                        <p> Please provide the information of the person placing the order and making the payment. </p>
                        {Object.keys(errors).length > 0 && (
                            <Message
                                negative
                                content={
                                    <>
                                        <p>
                                            Please resolve following errors to
                                            proceed.
                                        </p>
                                        <List as="ol">
                                            {map(
                                                errors as any,
                                                ({ message }) => (
                                                    <List.Item
                                                        key={`${message}_error_list_item`}
                                                        as="li"
                                                        value="-"
                                                    >
                                                        {message}
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
                                error={has(errors, "firstName")}
                                required
                            >
                                <label>First name</label>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{
                                        required: "First name is required",
                                    }}
                                    defaultValue=""
                                    render={({ field }) => <Input {...field} />}
                                />
                            </Form.Field>
                            <Form.Field
                                error={has(errors, "lastName")}
                                required
                            >
                                <label>Last name</label>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{
                                        required: "Last name is required",
                                    }}
                                    defaultValue=""
                                    render={({ field }) => <Input {...field} />}
                                />
                            </Form.Field>
                        </Form.Group>

                        <Form.Group widths="equal">
                            <Form.Field error={has(errors, "email")} required>
                                <label>Email</label>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: emailValidator,
                                            message: "Email is invalid",
                                        },
                                    }}
                                    defaultValue=""
                                    render={({ field }) => <Input {...field} />}
                                />
                            </Form.Field>

                            <Form.Field error={has(errors, "phone")} required>
                                <label>Mobile phone</label>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{
                                        required:
                                            "Mobile phone number is required",
                                    }}
                                    defaultValue=""
                                    render={({ field }) => <Input {...field} />}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Field error={has(errors, "subscribe")}>
                            <label>
                                Be the first to hear about our latest news and
                                events via our e-newsletter
                            </label>
                            <Controller
                                render={({ field }) => (
                                    <ReactSelect
                                        className="jmr-select"
                                        classNamePrefix="jmr-react-select"
                                        theme={theme => ({
                                            ...theme,
                                            colors: {
                                                ...theme.colors,
                                                primary25: "#ffffffd3",
                                                primary: "white",
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
                                        onClick={e => {
                                            e.preventDefault();
                                            history.push("/cart");
                                        }}
                                        content="Back"
                                    />
                                </Grid.Column>
                                <Grid.Column textAlign="center">
                                    <Button
                                        basic
                                        onClick={handleNextClick}
                                        content="Next"
                                    />
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Segment>
                ) : (
                    <Segment>
                        <Header as="h2" content="Guest details" />
                        <p> Please provide the information of those who will be using the services. </p>
                        {errors.guestDetails &&
                            errors.guestDetails.length > 0 && (
                                <Message
                                    negative
                                    content="Please complete the guest information accurately. Fields marked with an asterisk (*) are required."
                                />
                            )}

                            {hasDuplicateEmails && (
                                <Message
                                    negative
                                    content="All guests must have unique emails."
                                />
                            )}
                        {getGuestArrays()}
                        <Form.Field error={!agreedToTerms}>
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
                                    label={"By continuing I agree to the "}
                                    onChange={() =>
                                        setAgreedToTerms(!agreedToTerms)
                                    }
                                    checked={agreedToTerms}
                                />
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="http://www.japanesemountainretreat.com.au/terms-conditions/"
                                >
                                    Terms and conditions - <Icon name="eye" />
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
                                        onClick={e => {
                                            e.preventDefault();
                                            setGuestListPage(false);
                                        }}
                                        content="Back"
                                    />
                                </Grid.Column>
                                <Grid.Column textAlign="center">
                                    <Form.Field
                                        disabled={!agreedToTerms}
                                        control={Button}
                                        basic
                                    >
                                        Checkout
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

export default GuestDetails;
