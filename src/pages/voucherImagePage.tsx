import {
    Button,
    Grid,
    Loader,
    Message,
    Segment,
} from "semantic-ui-react";
import { secondaryColor } from "../utility/defaults";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import queryString from "query-string";
import backgroundImage from "../background2.jpg";
import { useState } from "react";
import {
    useLocation,
} from "react-router-dom";
import { useGetVoucherImageDetails } from "../api";
import moment from "moment";

const VoucherImagePage = () => {
    // const t = {
    //   toName: "Prabhat Pandey",
    //   message: "hello world",
    //   fromName: "Anuja Aryal",
    //   experiences: [{ id: 213, value: "Exp 1" }],
    //   redeemCode: "asd123",
    // };
    // const {
    //   toName,
    //   message,
    //   fromName,
    //   experiences,
    //   redeemCode,
    // } = t;
    const location = useLocation();
    const { data, isLoading, isError } =
        useGetVoucherImageDetails(
            queryString.parse(location.search)
                .code as string
        );
    const [isDownloading, setIsDownloading] =
        useState<boolean>(false);

    const handleDownloadClick = () => {
        const element = document.getElementById(
            "voucher-image-content"
        );
        setIsDownloading(true);
        if (element) {
            htmlToImage
                .toPng(element)
                .then(function (dataUrl) {
                    download(dataUrl, "my-voucher.png");
                    setIsDownloading(false);
                });
        }
    };
    if (isError) {
        return (
            <Segment>
                <Message
                    error
                    header="Voucher not found"
                    content="Couldn't get your voucher. Please contact japanese mountain retreat."
                />
            </Segment>
        );
    }
    if (isLoading || !data) {
        return (
            <Segment>
                <Loader active />
            </Segment>
        );
    }
    const {
        message,
        fromName,
        toName,
        redeemCode,
        experiences,
        expiryDate,
    } = data;
    return (
        <>
            <div style={{ overflowX: "auto" }}>
                <div
                    id="voucher-image-content"
                    style={{
                        position: "relative",
                        margin: "0 auto",
                        height: "1080px",
                        width: "1080px",
                    }}
                >
                    <img
                        alt="Japanese Mountain Retreat"
                        style={{
                            padding: "0",
                            margin: "0",
                            minHeight: "99%",
                            objectFit: "cover",
                        }}
                        //   src="https://secure.netbookings.com.au/business-files/day-spa/japanese-mountain-retreat-mineral-springs-and-spa/Gift-Background/background.jpg?13/07/2021 2:22:42 PM"
                        src={backgroundImage}
                    />
                    <div
                        style={{
                            top: "90px",
                            right: "110px",
                            color: "#cee5f5",
                            position: "absolute",
                            padding: "36px 24px",
                            background:
                                "rgba(25, 20, 20, 0.75) none repeat scroll 0% 0%",
                            transform: "scale(1.1)",
                            maxWidth: "500px",
                        }}
                    >
                        <p>Dear {toName},</p>
                        <p>{message}</p>
                        <p>From {fromName}</p>
                        <hr />
                        <p>
                            This gift certificate entitles
                            you to:
                        </p>
                        <p>
                            <ul>
                                {experiences.map((item) => (
                                    <li key={item.id}>
                                        1 x {item.value}
                                    </li>
                                ))}
                            </ul>
                        </p>

                        <hr />

                        <p>Redeem code: {redeemCode}</p>
                        {expiryDate && (
                            <p>Valid until: {moment(expiryDate).format("DD-MM-YYYY")}</p>
                        )}
                        <p style={{ marginTop: "16px" }}>
                            You will need to call Japanese
                            Mountain Retreat to book a date
                            and time.
                        </p>
                        <p>
                            Phone: +61 3 9737 0086, 7 days a
                            week.
                        </p>
                    </div>
                </div>
            </div>
            <Grid
                style={{
                    marginTop: "2px",
                }}
            >
                <Grid.Row centered>
                    <Button
                        loading={isDownloading}
                        icon="download"
                        basic
                        onClick={handleDownloadClick}
                        content="Download"
                    />
                </Grid.Row>
            </Grid>
        </>
    );
};
export default VoucherImagePage;
