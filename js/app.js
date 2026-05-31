/*
File: app.js

Purpose:
Main entry point for the Javascript application. It orchestrates the initialization 
sequence by setting up data, mounting the UI, and starting the router.

Dependencies:
- data.js (Data)
- ui.js (UI)
- router.js (Router)

Used By:
- index.html

====================================================
*/

import Data from "./data.js";
import UI from "./ui.js";
import Router from "./router.js";

// Log initialization to console
console.log("app.js loaded");

// Initialize application state/data
Data.initialize();

// Mount the user interface onto the root element
UI.init(document.querySelector("#app"));

// Start handling routing for the application
Router.start();
