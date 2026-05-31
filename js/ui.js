/*
File: ui.js

Purpose:
A central utility for generating HTML components, managing the global application shell 
(sidebar, topbar), handling themes, and rendering reusable UI elements like toasts, tags, and stats.

Dependencies:
- auth.js
- notificationService.js

Used By:
- app.js
- router.js
- pages.js

====================================================
*/

import Auth from "./auth.js";
import NotificationService from "./notificationService.js";

// SVG icon library used across the platform
const icons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  save: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  request: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
  team: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  profile: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`
};

const UI = {
  // Global app logo
  appIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  
  // Reference to the main DOM container
  app: null,
  
  /*
  Purpose: Initializes the UI module by binding the root element and applying the stored theme.
  Parameters: root (Element) - The DOM element where the app mounts.
  Returns: undefined
  Side Effects: Sets dataset attributes on document.documentElement.
  */
  init(root) {
    this.app = root;
    this.applyTheme(this.theme());
  },

  /*
  Purpose: Retrieves the current theme from localStorage.
  Parameters: None
  Returns: String - "light" or "dark"
  Side Effects: Reads from localStorage.
  */
  theme() {
    return localStorage.getItem("hb_theme") || "light";
  },

  /*
  Purpose: Applies a theme by setting the data-theme attribute on the root HTML element.
  Parameters: theme (String) - The theme to apply.
  Returns: undefined
  Side Effects: 
    - Modifies DOM.
    - Writes to localStorage.
  */
  applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("hb_theme", nextTheme);
  },

  /*
  Purpose: Toggles between light and dark themes.
  Parameters: None
  Returns: String - The new theme applied.
  Side Effects: Calls applyTheme.
  */
  toggleTheme() {
    const nextTheme = this.theme() === "dark" ? "light" : "dark";
    this.applyTheme(nextTheme);
    return nextTheme;
  },

  /*
  Purpose: Generates the HTML for the theme toggle button.
  Parameters: None
  Returns: String - HTML for the theme toggle.
  Side Effects: None.
  */
  themeToggle() {
    const isDark = this.theme() === "dark";
    return `
      <button class="theme-toggle ${isDark ? 'is-dark' : ''}" type="button" data-action="toggle-theme" aria-label="Toggle theme">
        <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </button>
    `;
  },

  /*
  Purpose: Displays a temporary toast notification on the screen.
  Parameters: 
    - message (String): The text to display.
    - tone (String): The visual tone (e.g., "success", "error").
  Returns: undefined
  Side Effects: Mutates the DOM and sets a timeout for removal.
  */
  toast(message, tone = "success") {
    const root = document.querySelector("#toast-root");
    const item = document.createElement("div");
    item.className = `toast ${tone}`;
    item.textContent = message;
    root.appendChild(item);
    setTimeout(() => item.remove(), 3200);
  },

  /*
  Purpose: Wraps page content inside the main application layout (sidebar + topbar).
           Skips the wrapper for public routes (e.g. landing, login).
  Parameters: 
    - content (String): The HTML content for the specific page.
    - options (Object): Route options (e.g., { public: true }).
  Returns: String - The complete HTML to render.
  Side Effects: Reads notifications from localStorage to calculate unread badge.
  */
  shell(content, options = {}) {
    const user = Auth.currentUser();
    // Do not show the app shell for unauthenticated/public views
    if (!user || options.public) {
      return content;
    }
    const unread = NotificationService.list(user.id).filter((note) => !note.read).length;
    return `
      <div class="app-shell">
        <aside class="sidebar">
          <a class="brand brand-logo compact" href="#/dashboard">
            ${this.appIconSvg}
            <span class="logo-text">Hackathon Buddy</span>
          </a>
          <nav class="side-nav" aria-label="Product navigation">
            ${this.navLink("dashboard", "Command Center", "#/dashboard")}
            ${this.navLink("profile", "Builders", "#/builders")}
            ${this.navLink("team", "Teams", "#/teams")}
            ${this.navLink("request", "Requests", "#/requests/received")}
            ${this.navLink("save", "Saved", "#/saved/builders")}
            ${this.navLink("bell", `Notifications${unread ? ` (${unread})` : ""}`, "#/notifications")}
            ${this.navLink("settings", "Settings", "#/settings/account")}
          </nav>
          <button class="ghost full logout-btn" data-action="logout">${icons.logout} Logout</button>
        </aside>
        <main class="workspace">
          <header class="topbar">
            <div class="topbar-left">
              <button class="icon-button mobile-menu" data-action="toggle-menu" aria-label="Open navigation"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
              <div class="topbar-context">
                <strong class="context-title">Welcome back, ${user.fullName.split(' ')[0]}</strong>
                <span class="context-label">${user.role || "Builder"} · ${user.availability || "Onboarding"}</span>
              </div>
            </div>
            <div class="topbar-actions">${this.themeToggle()}<a class="button secondary" href="#/team/create">Create Team</a></div>
          </header>
          ${content}
        </main>
      </div>
    `;
  },

  /*
  Purpose: Generates a sidebar navigation link and automatically applies an "active" class.
  Parameters: 
    - icon (String): The key of the icon to display.
    - label (String): The text for the link.
    - href (String): The URL hash.
  Returns: String - HTML for the nav link.
  Side Effects: Checks window.location.hash to determine active state.
  */
  navLink(icon, label, href) {
    // Determines if the current path matches the link href.
    const active = location.hash === href || (href !== "#/dashboard" && location.hash.startsWith(href.replace(/\/[^/]+$/, "")));
    return `<a class="${active ? "active" : ""}" href="${href}"><span aria-hidden="true">${icons[icon]}</span>${label}</a>`;
  },

  /*
  Purpose: Generates a standard page header.
  Parameters: title, subtitle, action (String HTML)
  Returns: String - HTML for the heading block.
  Side Effects: None.
  */
  pageTitle(title, subtitle = "", action = "") {
    return `<section class="page-heading"><div><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}</div>${action}</section>`;
  },

  /*
  Purpose: Generates a UI card for a statistic/metric.
  Parameters: label, value, hint (Strings)
  Returns: String - HTML for the metric block.
  Side Effects: None.
  */
  stat(label, value, hint = "") {
    return `<article class="metric"><span>${label}</span><strong>${value}</strong>${hint ? `<small>${hint}</small>` : ""}</article>`;
  },

  /*
  Purpose: Generates a container of pill tags.
  Parameters: items (Array of Strings)
  Returns: String - HTML for tags.
  Side Effects: None.
  */
  tags(items = []) {
    return `<div class="tags">${items.map((item) => `<span>${item}</span>`).join("")}</div>`;
  },

  /*
  Purpose: Generates a progress bar UI element.
  Parameters: value (Number) - Progress percentage (0-100).
  Returns: String - HTML for the progress bar.
  Side Effects: None.
  */
  progress(value) {
    return `<div class="progress" aria-label="${value}%"><span style="width:${value}%"></span></div>`;
  },

  /*
  Purpose: Generates an empty state view when there's no data.
  Parameters: title, body, href, label (Strings)
  Returns: String - HTML for the empty state.
  Side Effects: None.
  */
  empty(title, body, href = "", label = "") {
    return `<section class="empty"><h3>${title}</h3><p>${body}</p>${href ? `<a class="button" href="${href}">${label}</a>` : ""}</section>`;
  },

  /*
  Purpose: Utility function to convert form fields into a key-value object.
  Parameters: form (HTMLFormElement)
  Returns: Object - Form data representation.
  Side Effects: None.
  */
  serialize(form) {
    return Object.fromEntries(new FormData(form).entries());
  }
};

export default UI;
