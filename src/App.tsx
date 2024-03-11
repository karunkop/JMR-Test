import {
    QueryClient,
    QueryClientProvider,
} from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useLocation,
} from "react-router-dom";
import { CartProvider } from "./context/cartContext";
import CheckoutUI from "./pages/Checkout";
import CartUI from "./pages/cartUI";
import ExperienceList from "./pages/experienceList";
import GuestDetails from "./pages/guestsDetail";
import Header from "./components/header";
import { Grid } from "semantic-ui-react";
import StepsUI from "./components/stepsUI";
import "./App.css";
import { useState } from "react";
import {
    ChoosenAvailabilityType,
    GuestsDetailsInput,
} from "./types/coreInterfaces";
import BookingPage from "./pages/bookingPage";
import VoucherPage from "./pages/voucherPage";
import VoucherImagePage from "./pages/voucherImagePage";

const queryClient = new QueryClient();

const Body = () => {
    const [
        choosenAvailabilityData,
        setChoosenAvailabilityData,
    ] = useState<ChoosenAvailabilityType | undefined>();
    const [guestsAndOrderBody, setGuestsAndOrderBody] =
        useState<GuestsDetailsInput | undefined>();
    const location = useLocation();

    const needsCentered = location.pathname.includes(
        "voucher-details"
    );
    return (
        <section
            className={`cart-wrapper ${
                needsCentered ? "center" : ""
            }`}
        >
            <Grid>
                <Grid.Row centered only="computer tablet">
                    <StepsUI />
                </Grid.Row>
            </Grid>
            <Switch>
                <Route path="/voucher">
                    <VoucherPage />
                </Route>
                <Route path="/voucher-details">
                    <VoucherImagePage />
                </Route>
                <Route path="/cart">
                    <CartUI
                        onChooseAvailability={
                            setChoosenAvailabilityData
                        }
                    />
                </Route>
                <Route path="/details">
                    <GuestDetails
                        onGuestsAndOrderBody={
                            setGuestsAndOrderBody
                        }
                        guestsAndOrderBody={
                            guestsAndOrderBody
                        }
                        choosenAvailabilityData={
                            choosenAvailabilityData
                        }
                    />
                </Route>
                <Route path="/checkout">
                    <CheckoutUI
                        guestsAndOrderBody={
                            guestsAndOrderBody
                        }
                        choosenAvailabilityData={
                            choosenAvailabilityData
                        }
                    />
                </Route>
                <Route path="/booking/:orderId">
                    <BookingPage />
                </Route>
                <Route path="/" exact={true}>
                    <ExperienceList />
                </Route>
            </Switch>
        </section>
    );
};

function App() {
    return (
        <div className="App">
            <Router>
                <QueryClientProvider client={queryClient}>
                    <CartProvider>
                        <Header />
                        <Body />
                    </CartProvider>
                    <ReactQueryDevtools
                        position="bottom-right"
                        initialIsOpen={false}
                    />
                </QueryClientProvider>
            </Router>
        </div>
    );
}

export default App;
