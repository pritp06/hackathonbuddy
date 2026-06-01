

/**
 * 1. Purpose
 *    - Main application entry point for bootstrapping client services.
 * 2. Responsibilities
 *    - Orchestrates application initialization sequencing.
 *    - Invokes local storage seeding for mock database resources.
 *    - Registers target DOM app shell anchor.
 *    - Attaches routing event listeners to trigger view rendering on route changes.
 * 3. Dependencies
 *    - js/data.js (Seeding mock database storage)
 *    - js/ui.js (Managing application shell & theme setup)
 *    - js/router.js (Managing hash-change routes and protection)
 * 4. Important Functions
 *    - None (Sequential bootstrap script executions)
 * 5. Data Flow
 *    - Loaded as an ES module by index.html.
 *    - Sequence: Data initialization -> UI initialization -> Router boot.
 */

import Data from "./data.js";
import UI from "./ui.js";
import Router from "./router.js";
console.log("app.js loaded");
Data.initialize();
UI.init(document.querySelector("#app"));
Router.start();
