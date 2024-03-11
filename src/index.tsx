import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "semantic-ui-css/semantic.min.css";
import "react-input-range/lib/css/index.css";
import App from "./App";
import { configResponsive } from "use-responsive";
import { responsiveSizes } from "./utility/defaults";


configResponsive(responsiveSizes);

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
