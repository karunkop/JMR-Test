import { useHistory, useLocation } from "react-router-dom";
import headerImage from "../japanese-mountain-retreat-banner.jpg";
import logo from "../JMR_Horizontal Brand Mark_White_144x64.png";
import { Button, Grid } from "semantic-ui-react";
import { useCartItemContext } from "../context/cartContext";
import { useResponsive } from "use-responsive";
import { secondaryColor } from "../utility/defaults";

const Header = () => {
    const history = useHistory();
    const location = useLocation();
    const { cart } = useCartItemContext();
    const { xs, sm } = useResponsive();

    const handleCartClick = () => {
        history.push("/cart");
    };

    const isSmall = xs && !sm;
    if (location.pathname.includes("voucher-details")) {
        return null;
    }

    return (
        <>
            <header className="center">
                <Grid columns={isSmall ? 1 : 2}>
                    <Grid.Column
                        textAlign={
                            isSmall ? "center" : "left"
                        }
                        verticalAlign="middle"
                    >
                        <a href="http://www.japanesemountainretreat.com.au">
                            <img
                                className="logo-large"
                                src={logo}
                                alt="Japanese Mountain Retreat logo"
                            />
                        </a>
                    </Grid.Column>
                    <Grid.Column
                        textAlign={
                            isSmall ? "center" : "right"
                        }
                        verticalAlign="middle"
                    >
                        <Button
                            onClick={handleCartClick}
                            color={secondaryColor}
                            icon="shopping cart"
                            content="Cart"
                            label={{
                                as: "a",
                                basic: true,
                                content: cart.length,
                            }}
                            labelPosition="right"
                        />
                    </Grid.Column>
                </Grid>
            </header>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <img
                    src={headerImage}
                    alt="Japanese Mountain Retreat Mineral Springs and Spa header"
                />
            </div>
        </>
    );
};

export default Header;
