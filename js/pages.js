/*
File: pages.js

Purpose:
The core view layer of the application. Responsible for rendering HTML strings 
for every page (Dashboard, Builders, Teams, Settings, etc.), managing form submissions, 
and binding event listeners for all interactive elements in the DOM.

Dependencies:
- auth.js
- data.js
- ui.js
- validation.js
- userService.js
- teamService.js
- requestService.js
- notificationService.js
- storage.js
- canvas.js

Used By:
- router.js (Invokes page render functions)

====================================================
*/

import Auth from "./auth.js";
import Data from "./data.js";
import UI from "./ui.js";
import Validation from "./validation.js";
import UserService from "./userService.js";
import TeamService from "./teamService.js";
import RequestService from "./requestService.js";
import NotificationService from "./notificationService.js";
import Storage from "./storage.js";
import InteractiveBackground from "./canvas.js";

/*
Purpose: Generates a standard HTML text input field wrapped in a label.
Parameters: label, name, type, value, attrs (Strings)
Returns: String - HTML for the field.
Side Effects: None.
*/
const field = (label, name, type = "text", value = "", attrs = "") => `
  <label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${value || ""}" ${attrs} /></label>
`;

/*
Purpose: Generates a standard HTML select dropdown wrapped in a label.
Parameters: label, name, options, value (Strings/Array)
Returns: String - HTML for the select field.
Side Effects: None.
*/
const select = (label, name, options, value = "") => `
  <label class="field"><span>${label}</span><select name="${name}" required>
    <option value="">Choose ${label.toLowerCase()}</option>
    ${options.map((item) => `<option ${item === value ? "selected" : ""}>${item}</option>`).join("")}
  </select></label>
`;

// Helper: Retrieves the current authenticated user.
const current = () => Auth.currentUser();

// Helper: Retrieves all users who have successfully completed onboarding.
const users = () => UserService.getUsers().filter((user) => user.onboardingComplete);

// Helper: Retrieves the first team that the given user is a member of.
const activeTeam = (userId) => TeamService.getTeams().find((team) => team.memberIds.includes(userId));

// Helper: Extracts the first two initials from a full name string.
const initials = (name = "") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

/*
Purpose: Renders a UI card representing a builder/user profile.
Parameters: 
  - user (Object): The builder to display.
  - viewer (Object): The current user viewing the card (for compatibility scoring).
Returns: String - HTML for the builder card.
Side Effects: Calculates compatibility score.
*/
function cardUser(user, viewer) {
  const score = UserService.compatibility(viewer, user);
  return `
    <article class="card builder-card">
      <div class="card-top">
        <div class="identity"><span class="avatar small">${initials(user.fullName)}</span><div><h3>${user.fullName}</h3><p>${user.role} · ${user.experience}</p></div></div>
        ${user.verified ? `<span class="badge success">Verified</span>` : ""}
      </div>
      <div class="score"><strong>${score}%</strong><span>compatibility</span>${UI.progress(score)}</div>
      ${UI.tags(user.skills)}
      <dl class="compact-list"><dt>Availability</dt><dd><span class="status-pill">${user.availability}</span></dd><dt>Trust links</dt><dd><a href="${user.github}" target="_blank">GitHub</a> · <a href="${user.linkedin}" target="_blank">LinkedIn</a></dd></dl>
      <div class="actions">
        <a class="button secondary" href="#/builders/${user.id}">View Profile</a>
        <button class="ghost" data-action="save-builder" data-id="${user.id}">Save</button>
        <button class="button" data-action="request-builder" data-id="${user.id}">Send Request</button>
      </div>
    </article>
  `;
}

/*
Purpose: Renders a UI card representing a team profile.
Parameters: team (Object) - The team to display.
Returns: String - HTML for the team card.
Side Effects: Queries user service to resolve member names.
*/
function cardTeam(team) {
  const members = team.memberIds.map((id) => UserService.getUser(id)?.fullName).filter(Boolean);
  return `
    <article class="card team-card">
      <div class="card-top"><div><h3>${team.name}</h3><p>${team.goal}</p></div><div class="readiness"><strong>${team.readiness}%</strong><span>ready</span></div></div>
      ${UI.progress(team.readiness)}
      <div class="member-strip">${members.map((member) => `<span class="avatar tiny" title="${member}">${initials(member)}</span>`).join("") || `<span class="status-pill">Open</span>`}</div>
      <dl class="compact-list"><dt>Members</dt><dd>${members.join(", ") || "Open"}</dd><dt>Missing roles</dt><dd><span class="role-gap">${team.missingRoles.join(", ") || "None"}</span></dd></dl>
      ${UI.tags(team.techStack)}
      <div class="actions">
        <button class="button" data-action="join-team" data-id="${team.id}">Join Team</button>
        <button class="ghost" data-action="save-team" data-id="${team.id}">Save Team</button>
      </div>
    </article>
  `;
}

const Pages = {
  /*
  Purpose: Renders the public landing page.
  User Journey: Unauthenticated users land here first to learn about the product.
  Data Dependencies: None.
  */
  landing() {
    console.log("landing rendered");
    return `
      <div class="marketing">
        <canvas id="hero-canvas" class="hero-canvas"></canvas>
        <header class="marketing-nav">
          <div class="nav-left">
            <a class="brand brand-logo" href="#/">${UI.appIconSvg}<span class="logo-text">Hackathon Buddy</span></a>
          </div>
          <nav class="nav-center">
            <a href="#/" data-action="scroll-to" data-target="features">Features</a>
            <a href="#/" data-action="scroll-to" data-target="how">How It Works</a>
            <a href="#/" data-action="scroll-to" data-target="about">About</a>
          </nav>
          <div class="nav-right">
            ${UI.themeToggle()}
            <a class="login-btn" href="#/login">Login</a>
            <a class="button small cta-btn" href="#/signup">Get Started</a>
            <button class="icon-button mobile-menu-toggle" data-action="toggle-marketing-menu" aria-label="Open navigation"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
          </div>
        </header>

        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">Trust-first team formation</p>
            <h1>Find the right hackathon teammates faster.</h1>
            <p>Connect with reliable builders, validate compatibility instantly, and form stronger hackathon teams before the clock even starts.</p>
            <div class="hero-actions">
              <a class="button large" href="#/signup">Get Started</a>
              <a class="ghost large" href="#/login">Login</a>
            </div>
          </div>
          <div class="hero-panel interactive-preview">
            <div class="preview-header">
              <div class="preview-dots"><span></span><span></span><span></span></div>
              <div class="preview-title">team_readiness.json</div>
            </div>
            <div class="preview-body">
              <div class="preview-card main-card">
                <div class="card-top-preview">
                  <div class="score-ring"><strong>84%</strong></div>
                  <div class="card-titles">
                    <h4>Team Readiness</h4>
                    <p>High compatibility</p>
                  </div>
                </div>
                <div class="signal-grid">
                  <div class="signal active"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Role fit</div>
                  <div class="signal active"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Skills match</div>
                  <div class="signal active"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Availability</div>
                  <div class="signal pending"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Verified resume</div>
                </div>
              </div>
              <div class="preview-card float-card">
                <div class="builder-row">
                  <div class="avatar small">AI</div>
                  <div class="builder-info">
                    <strong>AI Engineer</strong>
                    <span>100% Match</span>
                  </div>
                  <button class="button small">Request</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="band problem" id="about">
          <h2>Hackathon teams fail before they start.</h2>
          <p>Builders commit too late, roles overlap, trust signals are scattered, and the strongest ideas lose momentum to team formation chaos.</p>
        </section>

        <section class="section" id="features">
          <div class="section-header center">
            <h2>Features built for serious teams</h2>
            <p>Production-style workflows backed by trust signals and compatibility.</p>
          </div>
          <div class="grid three feature-grid">
            <article class="card feature-card">
              <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
              <h3>Verified Profiles</h3>
              <p>Trust resumes, proof of work, and real identities front and center.</p>
            </article>
            <article class="card feature-card">
              <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <h3>Compatibility Matching</h3>
              <p>Find teammates based on overlapping skills and complementary roles.</p>
            </article>
            <article class="card feature-card">
              <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
              <h3>Team Discovery</h3>
              <p>Discover teams with clear goals and exact role gaps to fill.</p>
            </article>
            <article class="card feature-card">
              <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
              <h3>Request Tracking</h3>
              <p>Send and manage team formation requests with full context.</p>
            </article>
            <article class="card feature-card">
              <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
              <h3>Team Readiness</h3>
              <p>Score your team's hackathon readiness before the event begins.</p>
            </article>
            <article class="card feature-card">
              <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
              <h3>Builder Discovery</h3>
              <p>Search specifically for the roles and skills your team lacks.</p>
            </article>
          </div>
        </section>

        <section class="section" id="how">
          <div class="section-header center">
            <h2>How It Works</h2>
            <p>From individual builder to a highly compatible team in three steps.</p>
          </div>
          <div class="steps">
            <article><b>1</b><h3>Complete trust profile</h3><p>Add role, skills, proof links, availability, projects, and resume.</p></article>
            <article><b>2</b><h3>Discover matches</h3><p>Filter builders and teams by the signals that matter during a hackathon.</p></article>
            <article><b>3</b><h3>Request with context</h3><p>Send clear team formation requests with compatibility already visible.</p></article>
          </div>
        </section>

        <section class="section">
          <div class="section-header center">
            <h2>Testimonials</h2>
            <p>Don't just take our word for it.</p>
          </div>
          <div class="grid three">
            <blockquote class="card">“We found our missing AI engineer in minutes.”<span>Frontend lead</span></blockquote>
            <blockquote class="card">“The readiness score made our role gaps obvious.”<span>Product builder</span></blockquote>
            <blockquote class="card">“No more scattered DMs and stale spreadsheets.”<span>Design founder</span></blockquote>
          </div>
        </section>

        <section class="section faq">
          <div class="section-header center">
            <h2>FAQ</h2>
          </div>
          <div class="faq-list">
            <details open><summary>Is this a social network?</summary><p>No. It is focused on team formation workflows.</p></details>
            <details><summary>Does it need a backend?</summary><p>Not today. LocalStorage powers the product until APIs are connected.</p></details>
            <details><summary>Why require a PDF resume?</summary><p>It adds a stronger trust signal before users can contact teammates.</p></details>
          </div>
        </section>

        <section class="final-cta">
          <h2>Build your hackathon team with confidence.</h2>
          <a class="button large" href="#/signup">Get Started</a>
        </section>

        <footer>
          <span>Hackathon Buddy</span>
          <div class="footer-links">
            <a href="#/" data-action="scroll-to" data-target="features">Features</a>
            <a href="#/" data-action="scroll-to" data-target="how">How It Works</a>
            <a href="#/login">Login</a>
          </div>
        </footer>
      </div>
    `;
  },

  /*
  Purpose: Renders the login form page.
  User Journey: Existing users authenticate here to access their dashboard.
  */
  login() {
    return `<main class="auth-page"><form class="auth-card" id="login-form"><div class="auth-head"><a class="brand brand-logo" href="#/">${UI.appIconSvg}<span class="logo-text">Hackathon Buddy</span></a>${UI.themeToggle()}</div><div class="auth-title"><h1>Login to continue</h1><p>Welcome back to the builder network.</p></div>${field("Email", "email", "email", "", "required autocomplete='email'")}${field("Password", "password", "password", "", "required autocomplete='current-password'")}<button class="button full">Login</button><p class="auth-footer">New here? <a href="#/signup">Create an account</a></p></form></main>`;
  },

  /*
  Purpose: Renders the signup form page.
  User Journey: New users create an account here before entering the onboarding flow.
  */
  signup() {
    return `<main class="auth-page"><form class="auth-card" id="signup-form"><div class="auth-head"><a class="brand brand-logo" href="#/">${UI.appIconSvg}<span class="logo-text">Hackathon Buddy</span></a>${UI.themeToggle()}</div><div class="auth-title"><h1>Create an account</h1><p>Join thousands of builders forming serious teams.</p></div>${field("Full Name", "fullName", "text", "", "required autocomplete='name'")}${field("Username", "username", "text", "", "required autocomplete='username'")}${field("Email", "email", "email", "", "required autocomplete='email'")}${field("Password", "password", "password", "", "required minlength='8' autocomplete='new-password'")}<button class="button full">Signup</button><p class="auth-footer">Already have an account? <a href="#/login">Login</a></p></form></main>`;
  },

  /*
  Purpose: Renders the multi-step onboarding wizard.
  User Journey: Users must complete these 8 steps to unlock the platform.
  Data Dependencies: Uses sessionStorage to persist form progress across steps.
  */
  onboarding() {
    const user = current();
    const draft = Storage.sessionGet("onboarding", user) || user;
    const step = Number(Storage.sessionGet("onboardingStep", 1));
    const progress = Math.round((step / 8) * 100);
    const stepMarkup = {
      1: `${field("Full Name", "fullName", "text", draft.fullName, "required")}${field("Username", "username", "text", draft.username, "required")}${field("Email", "email", "email", draft.email, "required")}`,
      2: `${select("Role", "role", Data.roles, draft.role)}${select("Experience Level", "experience", Data.experience, draft.experience)}`,
      3: `<label class="field"><span>Skills (minimum 3, comma-separated)</span><textarea name="skills" required>${(draft.skills || []).join(", ")}</textarea></label><p class="hint">Examples: ${Data.skills.slice(0, 7).join(", ")}</p>`,
      4: `${field("GitHub URL", "github", "url", draft.github, "required")}${field("LinkedIn URL", "linkedin", "url", draft.linkedin, "required")}${field("Portfolio Website", "portfolio", "url", draft.portfolio)}`,
      5: `${field("Live Project 1", "project1", "url", draft.projects?.[0] || "")}${field("Live Project 2", "project2", "url", draft.projects?.[1] || "")}<p class="hint">This step is optional.</p>`,
      6: `<label class="field"><span>Resume PDF</span><input name="resume" type="file" accept="application/pdf,.pdf" ${draft.resume ? "" : "required"} /></label><div class="upload-status">${draft.resume ? `Uploaded: ${draft.resume.name}` : "No PDF uploaded yet."}</div>`,
      7: `${select("Availability", "availability", Data.availability, draft.availability)}`,
      8: `<div class="profile-preview"><h3>${draft.fullName || "Your profile"}</h3><p>${draft.role || "Role"} · ${draft.experience || "Experience"} · ${draft.availability || "Availability"}</p>${UI.tags(draft.skills || [])}<dl class="compact-list"><dt>Email</dt><dd>${draft.email || ""}</dd><dt>GitHub</dt><dd>${draft.github || ""}</dd><dt>LinkedIn</dt><dd>${draft.linkedin || ""}</dd><dt>Resume</dt><dd>${draft.resume?.name || "Missing"}</dd></dl></div>`
    }[step];
    return `<main class="onboarding"><form id="onboarding-form" class="onboarding-card"><div class="step-head"><span>Step ${step} of 8</span>${UI.progress(progress)}</div><h1>${["","Basic Information","Professional Information","Skills","Professional Links","Projects","Resume Upload","Availability","Review & Complete"][step]}</h1>${stepMarkup}<div class="actions between">${step > 1 ? `<button type="button" class="ghost" data-action="onboarding-prev">Back</button>` : "<span></span>"}<button class="button">${step === 8 ? "Complete Onboarding" : "Continue"}</button></div></form></main>`;
  },

  /*
  Purpose: Renders the primary dashboard (Command Center).
  User Journey: This is the main hub for fully onboarded users.
  Data Dependencies: Users, Teams, Requests, Notifications, active team status.
  */
  dashboard() {
    const user = current();
    const allUsers = users().filter((item) => item.id !== user.id);
    const sorted = allUsers.sort((a, b) => UserService.compatibility(user, b) - UserService.compatibility(user, a));
    const teams = TeamService.getTeams().slice(0, 2);
    const incoming = RequestService.received(user.id);
    const readiness = activeTeam(user.id)?.readiness || 42;
    return `
      ${UI.pageTitle("Command Center", "Your team formation workspace for trust signals, matches, requests, and readiness.", `<a class="button" href="#/builders">Find Builders</a>`)}
      <section class="metrics">${UI.stat("Profile Completion", "100%", "Verified onboarding")}${UI.stat("Incoming Requests", incoming.length, "Awaiting review")}${UI.stat("Team Readiness", `${readiness}%`, "Based on current team")}${UI.stat("Notifications", NotificationService.list(user.id).length, "Local activity")}</section>
      <section class="panel next-action"><div><span class="eyebrow">Next Action</span><h2>${incoming.length ? "Review incoming requests" : "Find your strongest next teammate"}</h2><p>${incoming.length ? "You have pending team formation signals waiting for a decision." : "Compatibility-ranked builders are ready for outreach."}</p></div><a class="button" href="${incoming.length ? "#/requests/received" : "#/builders"}">${incoming.length ? "Review Requests" : "Find Builders"}</a></section>
      <section class="grid two"><div>${UI.pageTitle("Suggested Builders", "", `<a href="#/builders">View all</a>`)}<div class="stack">${sorted.slice(0, 2).map((u) => cardUser(u, user)).join("")}</div></div><div>${UI.pageTitle("Team Status", "", `<a href="#/teams">View teams</a>`)}<div class="stack">${teams.map(cardTeam).join("")}</div></div></section>
      <section class="grid two"><div class="panel"><h2>Quick Actions</h2><div class="quick-actions"><a class="button" href="#/team/create">Create Team</a><a class="button secondary" href="#/requests/received">Review Requests</a><a class="button secondary" href="#/settings/profile">Edit Profile</a></div></div><div class="panel"><h2>Activity Feed</h2>${NotificationService.activities().slice(0, 6).map((a) => `<p class="feed"><b>${a.type}</b><span>${a.text}</span></p>`).join("")}</div></section>
    `;
  },

  /*
  Purpose: Renders the builder discovery directory.
  User Journey: Users use this page to find and filter other developers/designers.
  Data Dependencies: Users list and search/filter inputs.
  */
  builders() {
    const user = current();
    return `${UI.pageTitle("Builder Discovery", "Search, filter, and request reliable teammates.", `<button class="button secondary" data-action="clear-builder-filters">Clear filters</button>`)}
      <form class="filters" id="builder-filters">${field("Search", "query", "search")} ${select("Role", "role", ["", ...Data.roles])} ${select("Experience", "experience", ["", ...Data.experience])} ${select("Availability", "availability", ["", ...Data.availability])}<label class="field"><span>Skill</span><input name="skill" list="skill-list" /></label><datalist id="skill-list">${Data.skills.map((s) => `<option value="${s}">`).join("")}</datalist><label class="field"><span>Sort</span><select name="sort"><option value="compat">Compatibility</option><option value="name">Name</option><option value="experience">Experience</option></select></label></form>
      <section class="grid two" id="builders-results">${users().filter((item) => item.id !== user.id).map((u) => cardUser(u, user)).join("")}</section>`;
  },

  /*
  Purpose: Renders a detailed view for a single builder profile.
  Parameters: id (String) - The ID of the builder.
  Data Dependencies: Specific user record.
  */
  builderProfile(id) {
    const user = current();
    const builder = UserService.getUser(id);
    if (!builder) return UI.empty("Profile not found", "That builder is no longer available.", "#/builders", "Back to builders");
    const score = UserService.compatibility(user, builder);
    return `${UI.pageTitle(builder.fullName, `${builder.role} · ${builder.experience}`, `<button class="button" data-action="request-builder" data-id="${builder.id}">Send Request</button>`)}
      <section class="profile-layout"><article class="panel profile-card"><div class="profile-hero"><span class="avatar">${initials(builder.fullName)}</span><div><span class="badge success">${builder.verified ? "Verified profile" : "Profile"}</span><h2>${score}% Compatibility</h2>${UI.progress(score)}</div></div><div class="section-block"><h3>Skills</h3>${UI.tags(builder.skills)}</div><div class="section-block"><h3>Trust Resume</h3><dl class="compact-list"><dt>Availability</dt><dd><span class="status-pill">${builder.availability}</span></dd><dt>GitHub</dt><dd><a href="${builder.github}" target="_blank">${builder.github}</a></dd><dt>LinkedIn</dt><dd><a href="${builder.linkedin}" target="_blank">${builder.linkedin}</a></dd><dt>Resume</dt><dd>${builder.resume?.name || "Not shared"}</dd><dt>Projects</dt><dd>${builder.projects?.join(", ") || "No projects listed"}</dd></dl></div><button class="ghost" data-action="save-builder" data-id="${builder.id}">Save Builder</button></article><aside class="panel"><h3>Compatibility</h3><p>Skills match and role coverage suggest this builder can add ${builder.role === user.role ? "depth" : "complementary coverage"} to your team.</p></aside></section>`;
  },

  /*
  Purpose: Renders the team directory.
  User Journey: Users use this page to find open teams looking for their skillset.
  Data Dependencies: All teams.
  */
  teams() {
    return `${UI.pageTitle("Team Discovery", "Find teams with clear goals, role gaps, and readiness.", `<a class="button" href="#/team/create">Create Team</a>`)}<section class="grid two">${TeamService.getTeams().map(cardTeam).join("")}</section>`;
  },

  /*
  Purpose: Renders the form to create a new team.
  User Journey: Users become team owners by filling out this form.
  */
  createTeam() {
    return `${UI.pageTitle("Create Team", "Open role gaps and define the build direction.")}<form class="panel form-grid" id="team-form">${field("Team Name", "name", "text", "", "required")}${field("Goal", "goal", "text", "", "required")}<label class="field"><span>Missing Roles (comma-separated)</span><textarea name="missingRoles" required>Frontend Developer, AI/ML Engineer</textarea></label><label class="field"><span>Tech Stack (comma-separated)</span><textarea name="techStack" required>React, Python, Figma</textarea></label><button class="button">Create Team</button></form>`;
  },

  /*
  Purpose: Renders the internal dashboard for a user's active team.
  User Journey: Team owners and members monitor readiness and composition here.
  */
  teamDashboard() {
    const team = activeTeam(current().id);
    if (!team) return UI.empty("No active team", "Create or join a team to unlock the team dashboard.", "#/team/create", "Create Team");
    return `${UI.pageTitle(team.name, team.goal, `<a class="button secondary" href="#/team/members">Manage Members</a>`)}<section class="metrics">${UI.stat("Readiness", `${team.readiness}%`)}${UI.stat("Members", team.memberIds.length)}${UI.stat("Missing Roles", team.missingRoles.length)}${UI.stat("Tech Stack", team.techStack.length)}</section><section class="panel"><h2>Team Readiness</h2>${UI.progress(team.readiness)}${UI.tags(team.techStack)}</section>`;
  },

  /*
  Purpose: Lists all members currently within the user's active team.
  User Journey: Owners can remove members from this page.
  */
  teamMembers() {
    const team = activeTeam(current().id);
    if (!team) return UI.empty("No members yet", "Join or create a team first.", "#/teams", "Explore Teams");
    return `${UI.pageTitle("Team Members", team.name)}<section class="stack">${team.memberIds.map((id) => { const u = UserService.getUser(id); return `<article class="card row"><div><h3>${u.fullName}</h3><p>${u.role} · ${u.experience}</p></div>${team.ownerId === current().id && id !== current().id ? `<button class="ghost" data-action="remove-member" data-team="${team.id}" data-id="${id}">Remove</button>` : `<span class="badge">${id === team.ownerId ? "Owner" : "Member"}</span>`}</article>`; }).join("")}</section>`;
  },

  /*
  Purpose: Shows requests targeted at the user's active team.
  User Journey: Team owners accept/reject incoming join requests here.
  */
  teamRequests() {
    const team = activeTeam(current().id);
    const requests = RequestService.received(current().id).filter((r) => !team || r.teamId === team.id);
    return `${UI.pageTitle("Team Requests", "Requests related to your team.")}${requests.length ? `<section class="stack">${requests.map((r) => Pages.requestRow(r)).join("")}</section>` : UI.empty("No team requests", "Requests will appear here when builders ask to join.")}`;
  },

  /*
  Purpose: Renders a form for team owners to update team details.
  */
  teamSettings() {
    const team = activeTeam(current().id);
    if (!team) return UI.empty("No active team", "Create a team before editing team settings.", "#/team/create", "Create Team");
    return `${UI.pageTitle("Team Settings", team.name)}<form class="panel form-grid" id="team-settings-form" data-id="${team.id}">${field("Team Name", "name", "text", team.name, "required")}${field("Goal", "goal", "text", team.goal, "required")}<label class="field"><span>Missing Roles</span><textarea name="missingRoles">${team.missingRoles.join(", ")}</textarea></label><label class="field"><span>Tech Stack</span><textarea name="techStack">${team.techStack.join(", ")}</textarea></label><button class="button">Save Settings</button></form>`;
  },

  /*
  Purpose: Renders a small row representing a connection request.
  Parameters: request (Object)
  Returns: String - HTML for the row.
  */
  requestRow(request) {
    const from = UserService.getUser(request.fromUserId);
    const target = request.teamId ? TeamService.getTeam(request.teamId)?.name : UserService.getUser(request.toUserId)?.fullName;
    return `<article class="card row request-row"><div><h3>${from?.fullName || "Builder"} → ${target || "Builder"}</h3><p><span class="status-pill">${request.status}</span> ${request.compatibility}% compatibility</p></div><a class="button secondary" href="#/requests/${request.id}">Details</a></article>`;
  },

  /*
  Purpose: Lists all outbound requests sent by the current user.
  */
  requestsSent() {
    const items = RequestService.sent(current().id);
    return `${UI.pageTitle("Sent Requests", "Track your outbound team formation requests.", `<a href="#/requests/received">Received</a>`)}${items.length ? `<section class="stack">${items.map((r) => Pages.requestRow(r)).join("")}</section>` : UI.empty("No sent requests", "Send a request from a builder or team card.", "#/builders", "Find Builders")}`;
  },

  /*
  Purpose: Lists all inbound requests directed at the current user.
  */
  requestsReceived() {
    const items = RequestService.received(current().id);
    return `${UI.pageTitle("Received Requests", "Review inbound requests with compatibility context.", `<a href="#/requests/sent">Sent</a>`)}${items.length ? `<section class="stack">${items.map((r) => Pages.requestRow(r)).join("")}</section>` : UI.empty("No received requests", "New requests will appear here.")}`;
  },

  /*
  Purpose: Renders the detailed view of a specific request where it can be accepted/declined.
  Parameters: id (String) - Request ID.
  */
  requestDetails(id) {
    const request = RequestService.getRequest(id);
    if (!request) return UI.empty("Request not found", "This request is unavailable.", "#/requests/received", "Back");
    const from = UserService.getUser(request.fromUserId);
    const to = UserService.getUser(request.toUserId);
    const skillMatch = (from.skills || []).filter((skill) => (to.skills || []).includes(skill));
    return `${UI.pageTitle("Request Details", `${request.status} · ${request.compatibility}% compatibility`)}<section class="panel request-detail"><div class="score hero-score"><strong>${request.compatibility}%</strong><span>compatibility</span>${UI.progress(request.compatibility)}</div><dl class="compact-list"><dt>From</dt><dd>${from.fullName} · ${from.role}</dd><dt>To</dt><dd>${to.fullName} · ${to.role}</dd><dt>Skills Match</dt><dd>${skillMatch.join(", ") || "Complementary skills"}</dd><dt>Role Match</dt><dd>${from.role === to.role ? "Role depth" : "Complementary roles"}</dd><dt>Message</dt><dd>${request.message}</dd><dt>Status</dt><dd><span class="status-pill">${request.status}</span></dd></dl>${request.status === "Pending" && request.toUserId === current().id ? `<div class="actions"><button class="button" data-action="request-status" data-id="${request.id}" data-status="Accepted">Accept</button><button class="ghost" data-action="request-status" data-id="${request.id}" data-status="Declined">Decline</button></div>` : ""}</section>`;
  },

  /*
  Purpose: Lists all builders saved by the current user.
  */
  savedBuilders() {
    const items = (current().savedBuilders || []).map((id) => UserService.getUser(id)).filter(Boolean);
    return `${UI.pageTitle("Saved Builders", "Your teammate shortlist.", `<a href="#/saved/teams">Saved Teams</a>`)}${items.length ? `<section class="grid two">${items.map((u) => cardUser(u, current())).join("")}</section>` : UI.empty("No saved builders", "Save builders from discovery to compare later.", "#/builders", "Explore Builders")}`;
  },

  /*
  Purpose: Lists all teams saved by the current user.
  */
  savedTeams() {
    const items = (current().savedTeams || []).map((id) => TeamService.getTeam(id)).filter(Boolean);
    return `${UI.pageTitle("Saved Teams", "Teams you are considering.", `<a href="#/saved/builders">Saved Builders</a>`)}${items.length ? `<section class="grid two">${items.map(cardTeam).join("")}</section>` : UI.empty("No saved teams", "Save teams from discovery.", "#/teams", "Explore Teams")}`;
  },

  /*
  Purpose: Displays the user's notification history.
  */
  notifications() {
    const notes = NotificationService.list(current().id);
    return `${UI.pageTitle("Notification Center", "Requests, invites, saves, and team updates.")}${notes.length ? `<section class="stack">${notes.map((n) => `<article class="card row ${n.read ? "" : "unread"}"><div><h3>${n.type}</h3><p>${n.text}</p></div><button class="ghost" data-action="mark-read" data-id="${n.id}">${n.read ? "Read" : "Mark Read"}</button></article>`).join("")}</section>` : UI.empty("No notifications", "You are caught up.")}`;
  },

  /*
  Purpose: Renders the navigation tabs used within the settings area.
  Parameters: active (String) - Key of the active tab.
  Returns: String - HTML for tabs.
  */
  settingsTabs(active) {
    return `<nav class="tabs"><a class="${active === "account" ? "active" : ""}" href="#/settings/account">Account</a><a class="${active === "profile" ? "active" : ""}" href="#/settings/profile">Edit Profile</a><a class="${active === "privacy" ? "active" : ""}" href="#/settings/privacy">Privacy</a><a class="${active === "delete" ? "active" : ""}" href="#/settings/delete">Delete Account</a></nav>`;
  },

  /*
  Purpose: Renders the form to update core account info (name, email).
  */
  accountSettings() {
    const u = current();
    return `${UI.pageTitle("Account Settings", "Manage account identity.")}${Pages.settingsTabs("account")}<form class="panel form-grid" id="account-form">${field("Full Name", "fullName", "text", u.fullName, "required")}${field("Username", "username", "text", u.username, "required")}${field("Email", "email", "email", u.email, "required")}<button class="button">Save Account</button></form>`;
  },

  /*
  Purpose: Renders the form to update public profile details (role, skills).
  */
  editProfile() {
    const u = current();
    return `${UI.pageTitle("Edit Profile", "Keep trust and compatibility signals current.")}${Pages.settingsTabs("profile")}<form class="panel form-grid" id="profile-form">${select("Role", "role", Data.roles, u.role)}${select("Experience Level", "experience", Data.experience, u.experience)}${select("Availability", "availability", Data.availability, u.availability)}<label class="field"><span>Skills</span><textarea name="skills">${u.skills.join(", ")}</textarea></label>${field("GitHub URL", "github", "url", u.github)}${field("LinkedIn URL", "linkedin", "url", u.linkedin)}${field("Portfolio Website", "portfolio", "url", u.portfolio)}<button class="button">Save Profile</button></form>`;
  },

  /*
  Purpose: Renders the form to configure privacy preferences.
  */
  privacySettings() {
    const u = current();
    return `${UI.pageTitle("Privacy Settings", "Choose what trust signals are visible.")}${Pages.settingsTabs("privacy")}<form class="panel form-grid" id="privacy-form"><label class="check"><input type="checkbox" name="showResume" ${u.privacy?.showResume !== false ? "checked" : ""} /> Show resume filename on profile</label><label class="check"><input type="checkbox" name="showEmail" ${u.privacy?.showEmail ? "checked" : ""} /> Show email to accepted teammates</label><button class="button">Save Privacy</button></form>`;
  },

  /*
  Purpose: Renders the destructive action area to permanently delete an account.
  */
  deleteAccount() {
    return `${UI.pageTitle("Delete Account", "Remove your local account data from this browser.")}${Pages.settingsTabs("delete")}<section class="panel danger"><h2>Delete local account</h2><p>This removes your user profile from LocalStorage and ends the current session.</p><button class="button danger" data-action="delete-account">Delete Account</button></section>`;
  },

  /*
  Purpose: Attaches global event listeners to the document for click, input, and submit events.
           Uses event delegation to handle interactions across dynamically rendered HTML.
  Parameters: None
  Returns: undefined
  Side Effects: Binds functions to document.body, initializes canvas if present.
  */
  bind() {
    // Re-initialize or destroy the background canvas based on page context.
    if (document.getElementById("hero-canvas")) InteractiveBackground.init();
    else InteractiveBackground.destroy();

    // Event Delegation: Click Handler
    document.body.onclick = (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      const action = target.dataset.action;
      try {
        if (action === "scroll-to") {
          event.preventDefault();
          document.getElementById(target.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (action === "toggle-theme") { UI.toggleTheme(); location.reload(); }
        if (action === "logout") Auth.logout();
        if (action === "toggle-menu") document.querySelector(".sidebar")?.classList.toggle("open");
        if (action === "toggle-marketing-menu") document.querySelector(".marketing-nav")?.classList.toggle("menu-open");
        if (action === "onboarding-prev") { Storage.sessionSet("onboardingStep", Math.max(1, Number(Storage.sessionGet("onboardingStep", 1)) - 1)); location.reload(); }
        if (action === "save-builder") { UserService.saveBuilder(current().id, target.dataset.id); UI.toast("Builder saved."); location.reload(); }
        if (action === "save-team") { TeamService.saveTeam(current().id, target.dataset.id); UI.toast("Team saved."); location.reload(); }
        if (action === "request-builder") { const msg = prompt("Message for this builder", "I think our skills line up for a strong hackathon team."); if (msg !== null) { RequestService.sendRequest(current().id, { type: "builder", id: target.dataset.id }, msg); UI.toast("Request sent."); location.hash = "#/requests/sent"; } }
        if (action === "join-team") { const msg = prompt("Message for the team owner", "I would like to join this team and help ship the project."); if (msg !== null) { RequestService.sendRequest(current().id, { type: "team", id: target.dataset.id }, msg); UI.toast("Join request sent."); location.hash = "#/requests/sent"; } }
        if (action === "request-status") { RequestService.updateStatus(target.dataset.id, target.dataset.status, current().id); UI.toast(`Request ${target.dataset.status.toLowerCase()}.`); location.reload(); }
        if (action === "mark-read") { NotificationService.markRead(target.dataset.id); location.reload(); }
        if (action === "remove-member") { TeamService.removeMember(target.dataset.team, target.dataset.id, current().id); UI.toast("Member removed."); location.reload(); }
        if (action === "delete-account") { const remaining = UserService.getRawUsers().filter((u) => u.id !== current().id); UserService.saveUsers(remaining); Auth.logout(); }
        if (action === "clear-builder-filters") { location.reload(); }
      } catch (error) {
        UI.toast(error.message, "error");
      }
    };

    // Event Delegation: Input Handler (Dynamic Filtering)
    document.body.oninput = (event) => {
      if (event.target.closest("#builder-filters")) Pages.filterBuilders();
    };

    // Event Delegation: Form Submit Handler
    document.body.onsubmit = (event) => {
      event.preventDefault();
      const form = event.target;
      try {
        if (form.id === "login-form") {
          const data = UI.serialize(form);
          const user = Auth.login(data.email, data.password);
          location.hash = user.onboardingComplete ? "#/dashboard" : "#/onboarding";
        }
        if (form.id === "signup-form") {
          const data = UI.serialize(form);
          if (!Validation.email(data.email)) throw new Error("Enter a valid email.");
          Auth.signup(data);
          Storage.sessionSet("onboardingStep", 1);
          location.hash = "#/onboarding";
        }
        if (form.id === "onboarding-form") Pages.submitOnboarding(form);
        if (form.id === "team-form") {
          const data = UI.serialize(form);
          TeamService.createTeam(current().id, { name: data.name, goal: data.goal, missingRoles: data.missingRoles.split(",").map((x) => x.trim()).filter(Boolean), techStack: data.techStack.split(",").map((x) => x.trim()).filter(Boolean) });
          location.hash = "#/team/dashboard";
        }
        if (form.id === "team-settings-form") {
          const data = UI.serialize(form);
          TeamService.updateTeam(form.dataset.id, { name: data.name, goal: data.goal, missingRoles: data.missingRoles.split(",").map((x) => x.trim()).filter(Boolean), techStack: data.techStack.split(",").map((x) => x.trim()).filter(Boolean) });
          UI.toast("Team settings saved.");
        }
        if (form.id === "account-form") { const data = UI.serialize(form); UserService.updateUser(current().id, data); UI.toast("Account saved."); location.reload(); }
        if (form.id === "profile-form") {
          const data = UI.serialize(form);
          UserService.updateUser(current().id, { ...data, skills: data.skills.split(",").map((x) => x.trim()).filter(Boolean) });
          UI.toast("Profile saved."); location.reload();
        }
        if (form.id === "privacy-form") {
          const data = new FormData(form);
          UserService.updateUser(current().id, { privacy: { showResume: data.has("showResume"), showEmail: data.has("showEmail") } });
          UI.toast("Privacy saved.");
        }
      } catch (error) {
        UI.toast(error.message, "error");
      }
    };
  },

  /*
  Purpose: Processes submission for any step within the onboarding flow.
  Parameters: form (HTMLFormElement)
  Returns: undefined
  Side Effects: 
    - Validates data based on the current step.
    - Saves progress to sessionStorage.
    - Increments step or finalizes onboarding.
  */
  submitOnboarding(form) {
    const user = current();
    const step = Number(Storage.sessionGet("onboardingStep", 1));
    const draft = Storage.sessionGet("onboarding", user);
    const data = UI.serialize(form);
    
    // Step-specific validation rules
    if (step === 1 && (!Validation.required(data.fullName) || !Validation.required(data.username) || !Validation.email(data.email))) throw new Error("Complete basic information with a valid email.");
    if (step === 3) {
      data.skills = data.skills.split(",").map((x) => x.trim()).filter(Boolean);
      if (data.skills.length < 3) throw new Error("Add at least 3 skills.");
    }
    if (step === 4 && (!Validation.github(data.github) || !Validation.linkedin(data.linkedin) || !Validation.optionalUrl(data.portfolio))) throw new Error("Enter valid GitHub, LinkedIn, and optional portfolio URLs.");
    if (step === 5) data.projects = [data.project1, data.project2].filter(Boolean);
    if (step === 6) {
      const file = form.querySelector("[name='resume']").files[0];
      if (!draft.resume && !file) throw new Error("Upload a PDF resume.");
      if (file && !Validation.pdf(file)) throw new Error("Resume must be a PDF. Images and unsupported files are rejected.");
      data.resume = file ? { name: file.name, uploadedAt: new Date().toISOString(), status: "Uploaded" } : draft.resume;
    }
    
    // Merge new data with existing draft
    const next = { ...draft, ...data };
    
    // Cleanup temporary fields from UI
    delete next.project1;
    delete next.project2;
    Storage.sessionSet("onboarding", next);
    
    // Progress to next step if not complete
    if (step < 8) {
      Storage.sessionSet("onboardingStep", step + 1);
      location.reload();
      return;
    }
    
    // Final check before marking complete
    if (!next.resume) throw new Error("A PDF resume is required.");
    UserService.completeOnboarding(user.id, next);
    Storage.sessionRemove("onboarding");
    Storage.sessionRemove("onboardingStep");
    UI.toast("Onboarding complete.");
    location.hash = "#/dashboard";
  },

  /*
  Purpose: Executes real-time filtering of the builders list based on active form inputs.
           Invoked on every keystroke/change in the filter form.
  Parameters: None
  Returns: undefined
  Side Effects: Re-renders the DOM element containing builder results.
  */
  filterBuilders() {
    const form = document.querySelector("#builder-filters");
    const result = document.querySelector("#builders-results");
    const data = UI.serialize(form);
    const viewer = current();
    
    // Start with all valid users
    let list = users().filter((user) => user.id !== viewer.id);
    
    // Apply filters sequentially
    if (data.query) list = list.filter((u) => `${u.fullName} ${u.role} ${u.skills.join(" ")}`.toLowerCase().includes(data.query.toLowerCase()));
    if (data.role) list = list.filter((u) => u.role === data.role);
    if (data.experience) list = list.filter((u) => u.experience === data.experience);
    if (data.availability) list = list.filter((u) => u.availability === data.availability);
    if (data.skill) list = list.filter((u) => u.skills.some((skill) => skill.toLowerCase().includes(data.skill.toLowerCase())));
    
    // Apply sorting logic
    if (data.sort === "name") list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    else if (data.sort === "experience") list.sort((a, b) => a.experience.localeCompare(b.experience));
    else list.sort((a, b) => UserService.compatibility(viewer, b) - UserService.compatibility(viewer, a));
    
    // Update the DOM
    result.innerHTML = list.length ? list.map((u) => cardUser(u, viewer)).join("") : UI.empty("No builders match", "Adjust filters to broaden discovery.");
  }
};

export default Pages;
