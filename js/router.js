

/**
 * 1. Purpose
 *    - Hash-based application routing coordinator with access control guards.
 * 2. Responsibilities
 *    - Configures route definitions matching paths to template pages.
 *    - Listens to global hash change events (`window.onhashchange`) to re-trigger page rendering.
 *    - Restricts access to authenticated-only pages and checks that the user's onboarding profile is completed.
 *    - Redirects authenticated users away from authentication pages to the dashboard workspace.
 *    - Mounts views into the primary app shell viewport and binds global DOM actions.
 * 3. Dependencies
 *    - js/auth.js (Session user validation)
 *    - js/pages.js (Page layout templates and visual event handlers)
 *    - js/ui.js (App shell elements, headers, and UI templates)
 * 4. Important Functions
 *    - `start()`: Registers listeners and renders current URL hash on startup.
 *    - `path()`: Extracts and normalizes clean route path strings.
 *    - `render()`: Evaluates permissions, processes redirects, mounts DOM nodes, invokes template bindings, and scrolls window page back to coordinates (0, 0).
 * 5. Data Flow
 *    - Hash changes in window -> Router intercept -> Match pattern -> Query auth state from Auth -> Mount rendered string to UI root -> Page actions hook.
 */

import Auth from "./auth.js";
import Pages from "./pages.js";
import UI from "./ui.js";
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
  
  start() {
    console.log("router started");
    window.addEventListener("hashchange", () => this.render());
    if (!location.hash) location.hash = "#/";
    this.render();
  },

  
  path() {
    return location.hash.replace(/^#/, "") || "/";
  },

  
  render() {
    const path = this.path();
    const match = routes.find((route) => route.pattern.test(path));
    const route = match || routes[0];
    const params = route.pattern.exec(path)?.slice(1) || [];
    const user = Auth.currentUser();
    if (route.auth && !user) {
      location.hash = "#/login";
      return;
    }
    if (route.auth && user && !user.onboardingComplete && !route.allowIncomplete) {
      location.hash = "#/onboarding";
      return;
    }
    if ((path === "/login" || path === "/signup") && user?.onboardingComplete) {
      location.hash = "#/dashboard";
      return;
    }
    UI.app.innerHTML = UI.shell(route.render(...params), { public: route.public });
    Pages.bind();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
};

export default Router;
