

/**
 * 1. Purpose
 *    - Core HTML template rendering engine and global event binding delegate for pages views.
 * 2. Responsibilities
 *    - Produces HTML template strings representing individual workspace and authentication screens.
 *    - Manages client-side event listeners dynamically via a centralized event delegator.
 *    - Guides registration inputs, multistep onboarding, profile search filtering, and state changes.
 * 3. Dependencies
 *    - js/auth.js (Resolving current authentication credentials)
 *    - js/data.js (Supplying catalog criteria arrays like roles and skills options)
 *    - js/ui.js (Generating toast notices, rendering app shell layouts)
 *    - js/validation.js (Inspecting correctness of form input parameters)
 *    - js/userService.js (Fetching and modifying user profiles, shortlisting, compatibility calculations)
 *    - js/teamService.js (Creating and joining teams, removing members)
 *    - js/requestService.js (Sending requests and transitioning invitation statuses)
 *    - js/notificationService.js (Fetching alerts history and global activities lists)
 *    - js/storage.js (Interacting with sessionStorage for onboarding progress and drafts)
 * 4. Important Functions
 *    - `landing()` / `login()` / `signup()` / `onboarding()` / `dashboard()` / `builders()`: Renders HTML strings.
 *    - `bind()`: Central event listener dispatcher for click, input, and submit forms.
 *    - `submitOnboarding(form)`: Increments multi-step wizard stages, checks forms, and registers finished accounts.
 *    - `filterBuilders()`: Reads filters inputs and runs dynamic queries over public profiles list.
 * 5. Data Flow
 *    - Routing matching -> pages render HTML -> inner HTML update -> Pages.bind() event hooks.
 */

import Auth from "./auth.js";
import Data from "./data.js";
import UI from "./ui.js";
import Validation from "./validation.js";
import UserService from "./userService.js";
import TeamService from "./teamService.js";
import RequestService from "./requestService.js";
import NotificationService from "./notificationService.js";


const field = (label, name, type = "text", value = "", attrs = "") => `
  <label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${value || ""}" ${attrs} /></label>
`;


const select = (label, name, options, value = "") => `
  <label class="field"><span>${label}</span><select name="${name}" required>
    <option value="">Choose ${label.toLowerCase()}</option>
    ${options.map((item) => `<option ${item === value ? "selected" : ""}>${item}</option>`).join("")}
  </select></label>
`;
const current = () => Auth.currentUser();
const users = () => UserService.getUsers().filter((user) => user.onboardingComplete);
const activeTeam = (userId) => TeamService.getTeams().find((team) => team.memberIds.includes(userId));
const initials = (name = "") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const linkHost = (url = "") => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const trustLinks = (user) => `
  <div class="trust-links">
    ${user.github ? `<a href="${user.github}" target="_blank" rel="noreferrer"><span>GH</span><strong>GitHub</strong><em>${linkHost(user.github)}</em></a>` : ""}
    ${user.linkedin ? `<a href="${user.linkedin}" target="_blank" rel="noreferrer"><span>IN</span><strong>LinkedIn</strong><em>${linkHost(user.linkedin)}</em></a>` : ""}
    ${user.portfolio ? `<a href="${user.portfolio}" target="_blank" rel="noreferrer"><span>PF</span><strong>Portfolio</strong><em>${linkHost(user.portfolio)}</em></a>` : ""}
  </div>
`;

const builderCard = (user, viewer, variant = "") => {
  const score = UserService.compatibility(viewer, user);
  const projects = user.projects?.filter(Boolean) || [];
  return `
    <article class="builder-card ${variant}">
      <div class="builder-identity">
        <span class="avatar">${initials(user.fullName)}</span>
        <div>
          <h3>${user.fullName}</h3>
          <p>${user.role} · ${user.experience}</p>
        </div>
        <span class="availability">${user.availability}</span>
      </div>
      <div class="builder-evidence">
        <span class="evidence-label">Project evidence</span>
        <strong>${projects[0] || "Project history not listed"}</strong>
        <p>${projects.slice(1, 3).join(" · ") || `${score}% role and availability fit for your profile`}</p>
      </div>
      ${trustLinks(user)}
      ${UI.tags((user.skills || []).slice(0, 5))}
      <div class="actions">
        <a class="button secondary" href="#/builders/${user.id}">Profile</a>
        <button class="ghost" data-action="save-builder" data-id="${user.id}">Save</button>
        <button class="button" data-action="request-builder" data-id="${user.id}">Request</button>
      </div>
    </article>
  `;
};

const teamStage = (team) => {
  if ((team.memberIds || []).length <= 1) return "Forming";
  if ((team.missingRoles || []).length > 1) return "Recruiting";
  if ((team.readiness || 0) >= 80) return "Ready";
  return "Finalizing";
};

const teamCard = (team, variant = "") => {
  const members = team.memberIds.map((id) => UserService.getUser(id)).filter(Boolean);
  const openRoles = team.missingRoles || [];
  return `
    <article class="team-card ${variant}">
      <div class="team-head">
        <div>
          <span class="stage">${teamStage(team)}</span>
          <h3>${team.name}</h3>
          <p>${team.goal}</p>
        </div>
        <div class="readiness"><strong>${team.readiness}%</strong><span>ready</span></div>
      </div>
      <div class="team-meta">
        <span>Hackathon</span><strong>Open sprint</strong>
        <span>Activity</span><strong>${members.length} committed · ${openRoles.length ? "recruiting" : "roster set"}</strong>
      </div>
      <div class="member-strip" aria-label="Current members">
        ${members.map((member) => `<span class="avatar tiny" title="${member.fullName}">${initials(member.fullName)}</span>`).join("") || `<span class="status-pill">Open roster</span>`}
      </div>
      <dl class="compact-list evidence-list">
        <dt>Needed roles</dt><dd><span class="role-gap">${openRoles.join(", ") || "None"}</span></dd>
        <dt>Stack</dt><dd>${(team.techStack || []).join(", ") || "Not listed"}</dd>
      </dl>
      ${UI.tags(team.techStack)}
      <div class="actions">
        <button class="button" data-action="join-team" data-id="${team.id}">Join Team</button>
        <button class="ghost" data-action="save-team" data-id="${team.id}">Save</button>
      </div>
    </article>
  `;
};


function cardUser(user, viewer) {
  return builderCard(user, viewer);
}


function cardTeam(team) {
  return teamCard(team);
}

const Pages = {
  
  landing() {
    const seededBuilders = UserService.getUsers().filter((user) => user.onboardingComplete);
    const seededTeams = TeamService.getTeams();
    const featuredBuilders = seededBuilders.slice(0, 3);
    const featuredTeams = seededTeams.slice(0, 2);
    return `
      <div class="marketing">
        <header class="marketing-nav">
          <div class="nav-left">
            <a class="brand brand-logo" href="#/">${UI.appIconSvg}<span class="logo-text">Hackathon Buddy</span></a>
          </div>
          <nav class="nav-center">
            <a href="#/" data-action="scroll-to" data-target="featured-builders">Builders</a>
            <a href="#/" data-action="scroll-to" data-target="featured-teams">Teams</a>
            <a href="#/" data-action="scroll-to" data-target="how">How it works</a>
          </nav>
          <div class="nav-right">
            ${UI.themeToggle()}
            <a class="login-btn" href="#/login">Login</a>
            <a class="button small cta-btn" href="#/signup">Create profile</a>
            <button class="icon-button mobile-menu-toggle" data-action="toggle-marketing-menu" aria-label="Open navigation"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
          </div>
        </header>

        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">Professional builder discovery</p>
            <h1>Build hackathon teams with evidence, not guesswork.</h1>
            <p>See what builders have shipped, what teams are missing, and who is actually ready to commit.</p>
            <div class="hero-actions">
              <a class="button large" href="#/signup">Create Profile</a>
              <a class="button secondary large" href="#/login">Browse Builders</a>
            </div>
          </div>
          <aside class="hero-panel live-profiles" aria-label="Featured builders">
            <div class="live-profiles-head">
              <span>Live builder board</span>
              <strong>${seededBuilders.length} active profiles</strong>
            </div>
            ${featuredBuilders.map((builder) => builderCard(builder, seededBuilders[0] || builder, "compact")).join("") || `<p class="empty-inline">Builder profiles appear here once onboarding is complete.</p>`}
          </aside>
        </section>

        <section class="section featured-section" id="featured-builders">
          <div class="section-header">
            <span class="section-kicker">Featured builders</span>
            <h2>Profiles built for fast trust decisions.</h2>
            <p>Every preview leads with role, availability, shipped work, proof links, and skills. No vague badges, no personality guessing.</p>
          </div>
          <div class="builder-showcase">
            ${featuredBuilders.map((builder) => builderCard(builder, seededBuilders[1] || builder, "featured")).join("") || `<p class="empty-inline">No featured builders yet.</p>`}
          </div>
        </section>

        <section class="section featured-section alternate" id="featured-teams">
          <div class="section-header">
            <span class="section-kicker">Featured teams</span>
            <h2>Recruiting briefs, not dead team cards.</h2>
            <p>See the mission, event context, committed members, needed roles, stack, and readiness before you ask to join.</p>
          </div>
          <div class="team-showcase">
            ${featuredTeams.map((team) => teamCard(team, "featured")).join("") || `<p class="empty-inline">No featured teams yet.</p>`}
          </div>
        </section>

        <section class="section how-section" id="how">
          <div class="section-header center">
            <span class="section-kicker">How it works</span>
            <h2>From profile to committed team.</h2>
          </div>
          <div class="steps">
            <article><b>1</b><h3>Build profile</h3><p>Add role, skills, projects, proof links, availability, and resume evidence.</p></article>
            <article><b>2</b><h3>Find builders</h3><p>Compare people by what they have shipped and whether they are ready to commit.</p></article>
            <article><b>3</b><h3>Form team</h3><p>Join teams with clear missions, open roles, stack, members, and readiness.</p></article>
          </div>
        </section>

        <section class="final-cta">
          <h2>Start with a profile builders can evaluate.</h2>
          <a class="button large" href="#/signup">Create Profile</a>
        </section>

        <footer>
          <span>Hackathon Buddy</span>
          <div class="footer-links">
            <a href="#/" data-action="scroll-to" data-target="featured-builders">Builders</a>
            <a href="#/" data-action="scroll-to" data-target="featured-teams">Teams</a>
            <a href="#/login">Login</a>
          </div>
        </footer>
      </div>
    `;
  },

  
  login() {
    return `<main class="auth-page"><section class="auth-context"><a class="brand brand-logo" href="#/">${UI.appIconSvg}<span class="logo-text">Hackathon Buddy</span></a><h1>Find serious builders. Join active hackathon teams.</h1><p>Sign in to review requests, compare proof links, and keep your team formation work moving.</p><div class="auth-proof"><span>Builder profiles</span><span>Open roles</span><span>Proof links</span></div></section><form class="auth-card" id="login-form"><div class="auth-title"><span class="section-kicker">Welcome back</span><h2>Log in</h2><p>Use your builder account to continue.</p></div>${field("Email", "email", "email", "", "required autocomplete='email'")}${field("Password", "password", "password", "", "required autocomplete='current-password'")}<button class="button full">Log in</button><p class="auth-footer">New here? <a href="#/signup">Create a profile</a></p></form></main>`;
  },

  
  signup() {
    return `<main class="auth-page"><section class="auth-context"><a class="brand brand-logo" href="#/">${UI.appIconSvg}<span class="logo-text">Hackathon Buddy</span></a><h1>Create a profile builders can evaluate.</h1><p>Add the signals teammates need before they commit: role, shipped work, proof links, availability, and resume evidence.</p><div class="auth-proof"><span>GitHub</span><span>LinkedIn</span><span>Projects</span></div></section><form class="auth-card" id="signup-form"><div class="auth-title"><span class="section-kicker">Builder onboarding</span><h2>Create profile</h2><p>Start with account basics. Your proof signals come next.</p></div>${field("Full Name", "fullName", "text", "", "required autocomplete='name'")}${field("Username", "username", "text", "", "required autocomplete='username'")}${field("Email", "email", "email", "", "required autocomplete='email'")}${field("Password", "password", "password", "", "required minlength='8' autocomplete='new-password'")}<button class="button full">Create profile</button><p class="auth-footer">Already have an account? <a href="#/login">Log in</a></p></form></main>`;
  },

  
  onboarding() {
    const user = current();
    // Persisted in sessionStorage instead of localStorage so incomplete onboarding drafts
    // survive browser refreshes but do not overwrite master user profile states prematurely.
    const draft = UserService.getOnboardingDraft(user) || user;
    const step = Number(UserService.getOnboardingStep());
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

  
  dashboard() {
    const user = current();
    const allUsers = users().filter((item) => item.id !== user.id);
    const sorted = allUsers.sort((a, b) => UserService.compatibility(user, b) - UserService.compatibility(user, a));
    const teams = TeamService.getTeams().slice(0, 2);
    const incoming = RequestService.received(user.id);
    const notes = NotificationService.list(user.id);
    const savedCount = (user.savedBuilders || []).length + (user.savedTeams || []).length;
    const team = activeTeam(user.id);
    const decisionItems = [
      incoming.length ? `<a href="#/requests/received"><strong>${incoming.length} request${incoming.length === 1 ? "" : "s"} waiting</strong><span>Review compatibility and sender evidence.</span></a>` : "",
      team ? `<a href="#/team/dashboard"><strong>${team.name} is ${team.readiness}% ready</strong><span>${team.missingRoles.length ? `Still needs ${team.missingRoles.join(", ")}.` : "Roster has no open role gaps."}</span></a>` : `<a href="#/teams"><strong>No active team yet</strong><span>Review recruiting teams with open roles.</span></a>`,
      savedCount ? `<a href="#/saved/builders"><strong>${savedCount} saved item${savedCount === 1 ? "" : "s"}</strong><span>Compare your shortlist before sending requests.</span></a>` : `<a href="#/builders"><strong>Shortlist builders</strong><span>Save people who match your role gaps.</span></a>`
    ].filter(Boolean).join("");
    return `
      ${UI.pageTitle("Team formation", "Your current decisions, strongest builder matches, and active recruiting teams.", `<a class="button" href="#/builders">Find builders</a>`)}
      <section class="decision-board">
        <div class="decision-panel">
          <span class="section-kicker">Decision queue</span>
          <h2>${incoming.length ? "People are waiting on your response." : "Find the role your team is missing."}</h2>
          <div class="decision-list">${decisionItems}</div>
        </div>
        <aside class="pulse-panel">
          <span>Network pulse</span>
          <strong>${allUsers.length}</strong>
          <p>available builders · ${teams.length} recruiting teams · ${notes.filter((note) => !note.read).length} unread updates</p>
        </aside>
      </section>
      <section class="workspace-columns">
        <div><div class="section-row"><h2>Builders worth reviewing</h2><a href="#/builders">View all</a></div><div class="stack">${sorted.slice(0, 2).map((u) => cardUser(u, user)).join("")}</div></div>
        <div><div class="section-row"><h2>Teams actively recruiting</h2><a href="#/teams">View teams</a></div><div class="stack">${teams.map(cardTeam).join("")}</div></div>
      </section>
      <section class="activity-panel"><div><h2>Recent activity</h2><p>Signals from requests, saves, team changes, and profile updates.</p></div><div>${NotificationService.activities().slice(0, 5).map((a) => `<p class="feed"><b>${a.type}</b><span>${a.text}</span></p>`).join("") || `<p class="feed"><b>No recent activity</b><span>Actions will appear here as builders and teams move.</span></p>`}</div></section>
    `;
  },

  
  builders() {
    const user = current();
    return `${UI.pageTitle("Builders", "Compare role, skills, availability, projects, and trust links.", `<button class="button secondary" data-action="clear-builder-filters">Clear filters</button>`)}
      <form class="filters" id="builder-filters">${field("Search", "query", "search")} ${select("Role", "role", ["", ...Data.roles])} ${select("Experience", "experience", ["", ...Data.experience])} ${select("Availability", "availability", ["", ...Data.availability])}<label class="field"><span>Skill</span><input name="skill" list="skill-list" /></label><datalist id="skill-list">${Data.skills.map((s) => `<option value="${s}">`).join("")}</datalist><label class="field"><span>Sort</span><select name="sort"><option value="compat">Compatibility</option><option value="name">Name</option><option value="experience">Experience</option></select></label></form>
      <section class="grid two" id="builders-results">${users().filter((item) => item.id !== user.id).map((u) => cardUser(u, user)).join("")}</section>`;
  },

  
  builderProfile(id) {
    const user = current();
    const builder = UserService.getUser(id);
    if (!builder) return UI.empty("Profile not found", "That builder is no longer available.", "#/builders", "Back to builders");
    const score = UserService.compatibility(user, builder);
    return `${UI.pageTitle(builder.fullName, `${builder.role} · ${builder.experience}`, `<button class="button" data-action="request-builder" data-id="${builder.id}">Send request</button>`)}
      <section class="profile-layout"><article class="profile-card"><div class="profile-hero"><span class="avatar">${initials(builder.fullName)}</span><div><span class="badge success">${builder.verified ? "Verified profile" : "Profile"}</span><h2>${score}% role fit</h2>${UI.progress(score)}</div></div><div class="section-block"><h3>Skills</h3>${UI.tags(builder.skills)}</div><div class="section-block"><h3>Evidence</h3>${trustLinks(builder)}<dl class="compact-list"><dt>Availability</dt><dd><span class="status-pill">${builder.availability}</span></dd><dt>Resume</dt><dd>${builder.resume?.name || "Not shared"}</dd><dt>Projects</dt><dd>${builder.projects?.join(", ") || "No projects listed"}</dd></dl></div><button class="ghost" data-action="save-builder" data-id="${builder.id}">Save builder</button></article><aside class="profile-note"><h3>How to read this fit</h3><p>The score combines complementary role coverage, shared skills, experience, and availability. Proof links remain the stronger signal.</p></aside></section>`;
  },

  
  teams() {
    return `${UI.pageTitle("Teams", "Review missions, members, missing roles, stack, and readiness.", `<a class="button" href="#/team/create">Create team</a>`)}<section class="grid two">${TeamService.getTeams().map(cardTeam).join("")}</section>`;
  },

  
  createTeam() {
    return `${UI.pageTitle("Create Team", "State the mission, open roles, and planned stack.")}<form class="panel form-grid" id="team-form">${field("Team Name", "name", "text", "", "required")}${field("Goal", "goal", "text", "", "required")}<label class="field"><span>Missing Roles (comma-separated)</span><textarea name="missingRoles" required>Frontend Developer, AI/ML Engineer</textarea></label><label class="field"><span>Tech Stack (comma-separated)</span><textarea name="techStack" required>React, Python, Figma</textarea></label><button class="button">Create team</button></form>`;
  },

  
  teamDashboard() {
    const team = activeTeam(current().id);
    if (!team) return UI.empty("No active team", "Create or join a team to unlock the team dashboard.", "#/team/create", "Create Team");
    return `${UI.pageTitle(team.name, team.goal, `<a class="button secondary" href="#/team/members">Manage members</a>`)}<section class="metrics">${UI.stat("Readiness", `${team.readiness}%`)}${UI.stat("Members", team.memberIds.length)}${UI.stat("Open roles", team.missingRoles.length)}${UI.stat("Stack", team.techStack.length)}</section><section class="panel team-readiness-panel"><h2>Readiness</h2>${UI.progress(team.readiness)}<dl class="compact-list"><dt>Missing roles</dt><dd>${team.missingRoles.join(", ") || "None"}</dd><dt>Stack</dt><dd>${team.techStack.join(", ")}</dd></dl>${UI.tags(team.techStack)}</section>`;
  },

  
  teamMembers() {
    const team = activeTeam(current().id);
    if (!team) return UI.empty("No members yet", "Join or create a team first.", "#/teams", "Explore Teams");
    return `${UI.pageTitle("Team Members", team.name)}<section class="stack">${team.memberIds.map((id) => { const u = UserService.getUser(id); return `<article class="card row"><div><h3>${u.fullName}</h3><p>${u.role} · ${u.experience}</p></div>${team.ownerId === current().id && id !== current().id ? `<button class="ghost" data-action="remove-member" data-team="${team.id}" data-id="${id}">Remove</button>` : `<span class="badge">${id === team.ownerId ? "Owner" : "Member"}</span>`}</article>`; }).join("")}</section>`;
  },

  
  teamRequests() {
    const team = activeTeam(current().id);
    const requests = RequestService.received(current().id).filter((r) => !team || r.teamId === team.id);
    return `${UI.pageTitle("Team Requests", "Requests related to your team.")}${requests.length ? `<section class="stack">${requests.map((r) => Pages.requestRow(r)).join("")}</section>` : UI.empty("No team requests", "Requests will appear here when builders ask to join.")}`;
  },

  
  teamSettings() {
    const team = activeTeam(current().id);
    if (!team) return UI.empty("No active team", "Create a team before editing team settings.", "#/team/create", "Create Team");
    return `${UI.pageTitle("Team Settings", team.name)}<form class="panel form-grid" id="team-settings-form" data-id="${team.id}">${field("Team Name", "name", "text", team.name, "required")}${field("Goal", "goal", "text", team.goal, "required")}<label class="field"><span>Missing Roles</span><textarea name="missingRoles">${team.missingRoles.join(", ")}</textarea></label><label class="field"><span>Tech Stack</span><textarea name="techStack">${team.techStack.join(", ")}</textarea></label><button class="button">Save Settings</button></form>`;
  },

  
  requestRow(request) {
    const from = UserService.getUser(request.fromUserId);
    const target = request.teamId ? TeamService.getTeam(request.teamId)?.name : UserService.getUser(request.toUserId)?.fullName;
    return `<article class="card row request-row"><div><h3>${from?.fullName || "Builder"} → ${target || "Builder"}</h3><p><span class="status-pill">${request.status}</span> ${request.compatibility}% compatibility</p></div><a class="button secondary" href="#/requests/${request.id}">Details</a></article>`;
  },

  
  requestsSent() {
    const items = RequestService.sent(current().id);
    return `${UI.pageTitle("Sent Requests", "Track your outbound team formation requests.", `<a href="#/requests/received">Received</a>`)}${items.length ? `<section class="stack">${items.map((r) => Pages.requestRow(r)).join("")}</section>` : UI.empty("No sent requests", "Send a request from a builder or team card.", "#/builders", "Find Builders")}`;
  },

  
  requestsReceived() {
    const items = RequestService.received(current().id);
    return `${UI.pageTitle("Received Requests", "Review inbound requests with compatibility context.", `<a href="#/requests/sent">Sent</a>`)}${items.length ? `<section class="stack">${items.map((r) => Pages.requestRow(r)).join("")}</section>` : UI.empty("No received requests", "New requests will appear here.")}`;
  },

  
  requestDetails(id) {
    const request = RequestService.getRequest(id);
    if (!request) return UI.empty("Request not found", "This request is unavailable.", "#/requests/received", "Back");
    const from = UserService.getUser(request.fromUserId);
    const to = UserService.getUser(request.toUserId);
    const skillMatch = (from.skills || []).filter((skill) => (to.skills || []).includes(skill));
    return `${UI.pageTitle("Request Details", `${request.status} · ${request.compatibility}% compatibility`)}<section class="panel request-detail"><div class="score hero-score"><strong>${request.compatibility}%</strong><span>compatibility</span>${UI.progress(request.compatibility)}</div><dl class="compact-list"><dt>From</dt><dd>${from.fullName} · ${from.role}</dd><dt>To</dt><dd>${to.fullName} · ${to.role}</dd><dt>Skills Match</dt><dd>${skillMatch.join(", ") || "Complementary skills"}</dd><dt>Role Match</dt><dd>${from.role === to.role ? "Role depth" : "Complementary roles"}</dd><dt>Message</dt><dd>${request.message}</dd><dt>Status</dt><dd><span class="status-pill">${request.status}</span></dd></dl>${request.status === "Pending" && request.toUserId === current().id ? `<div class="actions"><button class="button" data-action="request-status" data-id="${request.id}" data-status="Accepted">Accept</button><button class="ghost" data-action="request-status" data-id="${request.id}" data-status="Declined">Decline</button></div>` : ""}</section>`;
  },

  
  savedBuilders() {
    const items = (current().savedBuilders || []).map((id) => UserService.getUser(id)).filter(Boolean);
    return `${UI.pageTitle("Saved Builders", "Your teammate shortlist.", `<a href="#/saved/teams">Saved Teams</a>`)}${items.length ? `<section class="grid two">${items.map((u) => cardUser(u, current())).join("")}</section>` : UI.empty("No saved builders", "Save builders from discovery to compare later.", "#/builders", "Explore Builders")}`;
  },

  
  savedTeams() {
    const items = (current().savedTeams || []).map((id) => TeamService.getTeam(id)).filter(Boolean);
    return `${UI.pageTitle("Saved Teams", "Teams you are considering.", `<a href="#/saved/builders">Saved Builders</a>`)}${items.length ? `<section class="grid two">${items.map(cardTeam).join("")}</section>` : UI.empty("No saved teams", "Save teams from discovery.", "#/teams", "Explore Teams")}`;
  },

  
  notifications() {
    const notes = NotificationService.list(current().id);
    return `${UI.pageTitle("Notification Center", "Requests, invites, saves, and team updates.")}${notes.length ? `<section class="stack">${notes.map((n) => `<article class="card row ${n.read ? "" : "unread"}"><div><h3>${n.type}</h3><p>${n.text}</p></div><button class="ghost" data-action="mark-read" data-id="${n.id}">${n.read ? "Read" : "Mark Read"}</button></article>`).join("")}</section>` : UI.empty("No notifications", "You are caught up.")}`;
  },

  
  settingsTabs(active) {
    return `<nav class="tabs"><a class="${active === "account" ? "active" : ""}" href="#/settings/account">Account</a><a class="${active === "profile" ? "active" : ""}" href="#/settings/profile">Edit Profile</a><a class="${active === "privacy" ? "active" : ""}" href="#/settings/privacy">Privacy</a><a class="${active === "delete" ? "active" : ""}" href="#/settings/delete">Delete Account</a></nav>`;
  },

  
  accountSettings() {
    const u = current();
    return `${UI.pageTitle("Account Settings", "Manage account identity.")}${Pages.settingsTabs("account")}<form class="panel form-grid" id="account-form">${field("Full Name", "fullName", "text", u.fullName, "required")}${field("Username", "username", "text", u.username, "required")}${field("Email", "email", "email", u.email, "required")}<button class="button">Save Account</button></form>`;
  },

  
  editProfile() {
    const u = current();
    return `${UI.pageTitle("Edit Profile", "Keep trust and compatibility signals current.")}${Pages.settingsTabs("profile")}<form class="panel form-grid" id="profile-form">${select("Role", "role", Data.roles, u.role)}${select("Experience Level", "experience", Data.experience, u.experience)}${select("Availability", "availability", Data.availability, u.availability)}<label class="field"><span>Skills</span><textarea name="skills">${u.skills.join(", ")}</textarea></label>${field("GitHub URL", "github", "url", u.github)}${field("LinkedIn URL", "linkedin", "url", u.linkedin)}${field("Portfolio Website", "portfolio", "url", u.portfolio)}<button class="button">Save Profile</button></form>`;
  },

  
  privacySettings() {
    const u = current();
    return `${UI.pageTitle("Privacy Settings", "Choose what trust signals are visible.")}${Pages.settingsTabs("privacy")}<form class="panel form-grid" id="privacy-form"><label class="check"><input type="checkbox" name="showResume" ${u.privacy?.showResume !== false ? "checked" : ""} /> Show resume filename on profile</label><label class="check"><input type="checkbox" name="showEmail" ${u.privacy?.showEmail ? "checked" : ""} /> Show email to accepted teammates</label><button class="button">Save Privacy</button></form>`;
  },

  
  deleteAccount() {
    return `${UI.pageTitle("Delete Account", "Remove your local account data from this browser.")}${Pages.settingsTabs("delete")}<section class="panel danger"><h2>Delete local account</h2><p>This removes your user profile from LocalStorage and ends the current session.</p><button class="button danger" data-action="delete-account">Delete Account</button></section>`;
  },

  
  bind() {
    // Global Event Delegation: registers single event listeners on document.body instead
    // of binding events to dynamically rendered template elements on every route transition.
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
        if (action === "onboarding-prev") { UserService.setOnboardingStep(Math.max(1, Number(UserService.getOnboardingStep()) - 1)); location.reload(); }
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
    document.body.oninput = (event) => {
      if (event.target.closest("#builder-filters")) Pages.filterBuilders();
    };
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
          UserService.setOnboardingStep(1);
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

  
  submitOnboarding(form) {
    const user = current();
    const step = Number(UserService.getOnboardingStep());
    const draft = UserService.getOnboardingDraft(user);
    const data = UI.serialize(form);
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
    const next = { ...draft, ...data };
    delete next.project1;
    delete next.project2;
    UserService.setOnboardingDraft(next);
    if (step < 8) {
      UserService.setOnboardingStep(step + 1);
      location.reload();
      return;
    }
    if (!next.resume) throw new Error("A PDF resume is required.");
    UserService.completeOnboarding(user.id, next);
    UserService.clearOnboardingDraft();
    UI.toast("Onboarding complete.");
    location.hash = "#/dashboard";
  },

  
  filterBuilders() {
    const form = document.querySelector("#builder-filters");
    const result = document.querySelector("#builders-results");
    const data = UI.serialize(form);
    const viewer = current();
    let list = users().filter((user) => user.id !== viewer.id);
    if (data.query) list = list.filter((u) => `${u.fullName} ${u.role} ${u.skills.join(" ")}`.toLowerCase().includes(data.query.toLowerCase()));
    if (data.role) list = list.filter((u) => u.role === data.role);
    if (data.experience) list = list.filter((u) => u.experience === data.experience);
    if (data.availability) list = list.filter((u) => u.availability === data.availability);
    if (data.skill) list = list.filter((u) => u.skills.some((skill) => skill.toLowerCase().includes(data.skill.toLowerCase())));
    if (data.sort === "name") list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    else if (data.sort === "experience") list.sort((a, b) => a.experience.localeCompare(b.experience));
    else list.sort((a, b) => UserService.compatibility(viewer, b) - UserService.compatibility(viewer, a));
    result.innerHTML = list.length ? list.map((u) => cardUser(u, viewer)).join("") : UI.empty("No builders match", "Adjust filters to broaden discovery.");
  }
};

export default Pages;
