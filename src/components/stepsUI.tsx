import {
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import { Step } from "semantic-ui-react";

const StepsUI = () => {
  const location = useLocation();
  const steps = [
    {
      key: "Shop",
      active:
        location.pathname === "/" ||
        location.pathname === "/cart",
      icon: "cart arrow down",
      title: "1. Shop",
      description: "Select experiences",
    },
    {
      key: "Details",
      active: location.pathname === "/details",
      icon: "user outline",
      title: "2. Details",
      description: "Provide check in date and details",
    },
    {
      key: "Checkout",
      active: location.pathname === "/checkout",
      icon: "payment",
      title: "3. Checkout",
      description: "Proceed to checkout",
    },
  ];
  if (
    location.pathname.includes("booking") ||
    location.pathname.includes("voucher")
  ) {
    return null;
  }
  return <Step.Group items={steps} />;
};

export default StepsUI;
