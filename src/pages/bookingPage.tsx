import { useLocation, useRouteMatch } from "react-router-dom";
import _ from "lodash";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { useGetOrder } from "../api";
import { Message } from "semantic-ui-react";

const BookingPage = () => {
    const location = useLocation();
    const match = useRouteMatch<{ orderId: string }>();
    const [isVoucher, setIsVoucher] = useState(false);

    useEffect(() => {
        const query = queryString.parse(location.search);
        const isVoucher = _.get(query, "isVoucher", false) as string | boolean;
        setIsVoucher(isVoucher === "true" || isVoucher === true);
    }, [location.search, match.params.orderId]);

    const { data: orderDetails } = useGetOrder(+match.params.orderId, {
        enabled: !!match.params.orderId,
    });

    useEffect(() => {
        if (orderDetails) {
            const query = queryString.parse(location.search);
            const guests = orderDetails.metadata.guests || [];
            const unitAmount = (+orderDetails.amount || 0) / guests.length;

            const productData = {
                event: "purchase",
                ecommerce: {
                    transaction_id: query.charge_token,
                    value: (+orderDetails.amount).toFixed(2),
                    tax: 0,
                    currency: "AUD",
                    items: orderDetails.metadata.cart.map((item) => {
                        return {
                            item_id: "" + item.id,
                            item_name: item.name,
                            currency: "AUD",
                            item_category: "Service",
                            price: unitAmount.toFixed(2),
                            quantity: guests.length,
                        };
                    }),
                },
            };


            window.dataLayer = window.dataLayer || [];

            window.dataLayer.push(productData);

            guests.forEach((guest) => {
                window.dataLayer.push({
                    event: "user_info",
                    first_name: guest["first-name"],
                    last_name: guest["last-name"],
                    email: guest.email,
                    phone: guest.phone,
                    // postal_code: "10010",
                    // city: "Sydney",
                    // state: "New South Wales",
                });
            });
        }
    }, [orderDetails]);

    if (isVoucher) {
        return (
            <section className="cart-wrapper center">
                <Message
                    success
                    icon="check circle"
                    header={`Voucher successfully bought`}
                    content={
                        <>
                            <p>
                                Congratulations! You've successfully bought the
                                gift vouchers.
                            </p>
                            <p>You will be notified via email soon.</p>
                        </>
                    }
                />
            </section>
        );
    }
    return (
        <section className="cart-wrapper center">
            <Message
                success
                icon="check circle"
                header={`Booking successful`}
                content={
                    <>
                        <p>Congratulations! Your payment was successfull.</p>
                        <p>You will be notified further via email soon.</p>
                    </>
                }
            />
        </section>
    );
};

export default BookingPage;
