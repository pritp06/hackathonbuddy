

/**
 * 1. Purpose
 *    - UI layout renderer, theme state coordinator, and page-element generation service.
 * 2. Responsibilities
 *    - Maintains application SVG icon dictionaries.
 *    - Controls dark mode and light mode configuration settings on document root.
 *    - Wraps authenticated layout routes inside a standard HTML sidebar dashboard shell.
 *    - Supplies dynamic UI templates for headers, toast bars, lists, tags, and progress bars.
 *    - Serializes HTML form elements to JavaScript objects.
 * 3. Dependencies
 *    - js/auth.js (Resolving current session user context for shell banners)
 *    - js/notificationService.js (Querying notifications status for sidebar badges)
 * 4. Important Functions
 *    - `init(root)`: Binds target layout node and sets starting theme context.
 *    - `applyTheme(theme)`: Sets dataset attributes and saves state in localStorage.
 *    - `shell(content, options)`: Returns layout containers wrapped with menus and navigation links.
 * 5. Data Flow
 *    - View content -> UI.shell(content) -> outputs dashboard template -> router mounts to app container.
 */

import Auth from "./auth.js";
import NotificationService from "./notificationService.js";
import ThemeRepository from "./themeRepository.js";
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
  appIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="app-icon"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  app: null,
  
  
  init(root) {
    this.app = root;
    this.applyTheme(this.theme());
  },

  
  // Theme state is persisted in localStorage so user preferences survive session restarts.
  // The theme is applied as a 'data-theme' attribute on the document HTML element to trigger
  // CSS variables transitions.
  theme() {
    return ThemeRepository.getTheme();
  },

  
  applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    ThemeRepository.setTheme(nextTheme);
  },

  
  toggleTheme() {
    const nextTheme = this.theme() === "dark" ? "light" : "dark";
    this.applyTheme(nextTheme);
    return nextTheme;
  },

  
  themeToggle() {
    const isDark = this.theme() === "dark";
    return `
      <button class="theme-toggle ${isDark ? 'is-dark' : ''}" type="button" data-action="toggle-theme" aria-label="Toggle theme">
        <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </button>
    `;
  },

  
  toast(message, tone = "success") {
    const root = document.querySelector("#toast-root");
    const item = document.createElement("div");
    item.className = `toast ${tone}`;
    item.textContent = message;
    root.appendChild(item);
    setTimeout(() => item.remove(), 3200);
  },

  
  shell(content, options = {}) {
    const user = Auth.currentUser();
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
            ${this.navLink("dashboard", "Workspace", "#/dashboard")}
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
                <strong class="context-title">${user.fullName.split(' ')[0]}</strong>
                <span class="context-label">${user.role || "Builder"} · ${user.availability || "Onboarding"}</span>
              </div>
            </div>
            <div class="topbar-actions">${this.themeToggle()}<a class="button secondary" href="#/team/create">Create team</a></div>
          </header>
          ${content}
        </main>
      </div>
    `;
  },

  
  navLink(icon, label, href) {
    const active = location.hash === href || (href !== "#/dashboard" && location.hash.startsWith(href.replace(/\/[^/]+$/, "")));
    return `<a class="${active ? "active" : ""}" href="${href}"><span aria-hidden="true">${icons[icon]}</span>${label}</a>`;
  },

  
  pageTitle(title, subtitle = "", action = "") {
    return `<section class="page-heading"><div><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}</div>${action}</section>`;
  },

  
  stat(label, value, hint = "") {
    return `<article class="metric"><span>${label}</span><strong>${value}</strong>${hint ? `<small>${hint}</small>` : ""}</article>`;
  },

  
  tags(items = []) {
    return `<div class="tags">${items.map((item) => `<span>${item}</span>`).join("")}</div>`;
  },

  
  progress(value) {
    return `<div class="progress" aria-label="${value}%"><span style="width:${value}%"></span></div>`;
  },

  
  empty(title, body, href = "", label = "") {
    return `<section class="empty"><h3>${title}</h3><p>${body}</p>${href ? `<a class="button" href="${href}">${label}</a>` : ""}</section>`;
  },

  
  serialize(form) {
    return Object.fromEntries(new FormData(form).entries());
  }
};

export default UI;
