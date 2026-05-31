/*
File: router.js

Purpose:
A custom lightweight hash-based client-side router. It maps URL hashes 
to specific render functions within the Pages module, and handles 
route guards (authentication/onboarding checks).

Dependencies:
- auth.js
- pages.js
- ui.js

Used By:
- app.js

====================================================
*/

import Auth from "./auth.js";
import Pages from "./pages.js";
import UI from "./ui.js";

// Route definition mapping Regex patterns to rendering logic and access rules.
// Public routes can be accessed without login.
// Auth routes require a logged-in user.
// allowIncomplete lets users access routes even if onboarding isn't finished.
const routes = [
  { pattern: /^\/$/, render: Pages.landing, public: true },
  { pattern: /^\/login$/, render: Pages.login, public: true },
  { pattern: /^\/signup$/, render: Pages.signup, public: true },
  { pattern: /^\/onboarding$/, render: Pages.onboarding, auth: true, allowIncomplete: true },
  { pattern: /^\/dashboard$/, render: Pages.dashboard, auth: true },
  { pattern: /^\/builders$/, render: Pages.builders, auth: true },
  { pattern: /^\/builders\/([^/]+)$/, render: Pages.builderProfile, auth: true },
  { pattern: /^\/teams$/, render: Pages.teams, auth: true },
  { pattern: /^\/team\/create$/, render: Pages.createTeam, auth: true },
  { pattern: /^\/team\/dashboard$/, render: Pages.teamDashboard, auth: true },
  { pattern: /^\/team\/members$/, render: Pages.teamMembers, auth: true },
  { pattern: /^\/team\/requests$/, render: Pages.teamRequests, auth: true },
  { pattern: /^\/team\/settings$/, render: Pages.teamSettings, auth: true },
  { pattern: /^\/requests\/sent$/, render: Pages.requestsSent, auth: true },
  { pattern: /^\/requests\/received$/, render: Pages.requestsReceived, auth: true },
  { pattern: /^\/requests\/([^/]+)$/, render: Pages.requestDetails, auth: true },
  { pattern: /^\/saved\/builders$/, render: Pages.savedBuilders, auth: true },
  { pattern: /^\/saved\/teams$/, render: Pages.savedTeams, auth: true },
  { pattern: /^\/notifications$/, render: Pages.notifications, auth: true },
  { pattern: /^\/settings\/account$/, render: Pages.accountSettings, auth: true },
  { pattern: /^\/settings\/profile$/, render: Pages.editProfile, auth: true },
  { pattern: /^\/settings\/privacy$/, render: Pages.privacySettings, auth: true },
  { pattern: /^\/settings\/delete$/, render: Pages.deleteAccount, auth: true }
];

const Router = {
  /*
  Purpose: Starts the router by hooking into the browser's hashchange event.
  Parameters: None
  Returns: undefined
  Side Effects: Adds an event listener to the window object and triggers initial render.
  */
  start() {
    console.log("router started");
    window.addEventListener("hashchange", () => this.render());
    // Default to the landing page if no hash is provided.
    if (!location.hash) location.hash = "#/";
    this.render();
  },

  /*
  Purpose: Extracts the path from the current URL hash.
  Parameters: None
  Returns: String - The current route path.
  Side Effects: None.
  */
  path() {
    return location.hash.replace(/^#/, "") || "/";
  },

  /*
  Purpose: Handles navigation by matching the path to a route, enforcing guards, and rendering the UI.
  Parameters: None
  Returns: undefined
  Side Effects: 
    - Replaces the DOM content of the UI shell.
    - Redirects users if they fail route guard checks.
    - Scrolls the window to the top.
  */
  render() {
    const path = this.path();
    const match = routes.find((route) => route.pattern.test(path));
    // Fallback to the first route (landing) if no match is found.
    const route = match || routes[0];
    
    // Extract dynamic segments from the URL based on the regex capture groups.
    const params = route.pattern.exec(path)?.slice(1) || [];
    const user = Auth.currentUser();

    // Guard: Prevent unauthenticated access to protected routes.
    if (route.auth && !user) {
      location.hash = "#/login";
      return;
    }
    
    // Guard: Prevent authenticated but incomplete users from accessing core features.
    if (route.auth && user && !user.onboardingComplete && !route.allowIncomplete) {
      location.hash = "#/onboarding";
      return;
    }
    
    // Guard: Prevent authenticated users from accessing login/signup again.
    if ((path === "/login" || path === "/signup") && user?.onboardingComplete) {
      location.hash = "#/dashboard";
      return;
    }

    // Render the layout shell and inject the specific page HTML.
    UI.app.innerHTML = UI.shell(route.render(...params), { public: route.public });
    
    // Attach event listeners to the newly rendered DOM elements.
    Pages.bind();
    
    // Reset scroll position for the new page.
    window.scrollTo({ top: 0, behavior: "instant" });
  }
};

export default Router;
