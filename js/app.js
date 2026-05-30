import Data from "./data.js";
import UI from "./ui.js";
import Router from "./router.js";

console.log("app.js loaded");
Data.initialize();
UI.init(document.querySelector("#app"));
Router.start();
