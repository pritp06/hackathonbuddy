

/**
 * 1. Purpose
 *    - Team management service coordinating creation, updates, membership, and team readiness tracking.
 * 2. Responsibilities
 *    - Reads and saves teams array collections within browser storage.
 *    - Instantiates teams with descriptive properties (missing roles, stacks, readiness indices).
 *    - Appends/removes members on team rosters, recalculates readiness, and publishes notifications.
 *    - Handles teams shortlisting and removal on user profile settings.
 * 3. Dependencies
 *    - js/storage.js (LocalStorage interactions for target collections)
 *    - js/userService.js (Retrieving and patching user profile records)
 *    - js/notificationService.js (Creating and pushing notifications and public logs)
 * 4. Important Functions
 *    - `createTeam(ownerId, payload)`: Generates team record, logs creator as owner, updates activity.
 *    - `joinTeam(teamId, userId)`: Commits user to team and recalculates readiness.
 *    - `removeMember(teamId, memberId, actorId)`: Removes specified member (owner restricted).
 *    - `calculateReadiness(team)`: Readiness score computed based on size, stack coverage, and gaps.
 * 5. Data Flow
 *    - Team creation -> gathers form parameters -> invokes service -> updates storage -> re-renders viewport.
 */

import TeamRepository from "./teamRepository.js";
import UserService from "./userService.js";
import NotificationService from "./notificationService.js";

const TeamService = {
  
  getTeams() {
    return TeamRepository.getAll();
  },

  
  saveTeams(teams) {
    TeamRepository.saveAll(teams);
  },

  
  getTeam(id) {
    return this.getTeams().find((team) => team.id === id) || null;
  },

  
  createTeam(ownerId, payload) {
    const team = {
      id: TeamRepository.generateId(),
      name: payload.name,
      goal: payload.goal,
      ownerId,
      memberIds: [ownerId],
      missingRoles: payload.missingRoles,
      techStack: payload.techStack,
      readiness: this.calculateReadiness({ memberIds: [ownerId], missingRoles: payload.missingRoles, techStack: payload.techStack }),
      requests: [],
      createdAt: new Date().toISOString()
    };
    
    this.saveTeams([team, ...this.getTeams()]);
    NotificationService.addActivity("Team Created", `${UserService.getUser(ownerId).fullName} created ${team.name}.`);
    return team;
  },

  
  updateTeam(id, patch) {
    const teams = this.getTeams().map((team) => (team.id === id ? { ...team, ...patch } : team));
    this.saveTeams(teams);
    return this.getTeam(id);
  },

  
  joinTeam(teamId, userId) {
    const team = this.getTeam(teamId);
    if (!team) throw new Error("Team not found.");
    if (team.memberIds.includes(userId)) throw new Error("You are already on this team.");
    
    const memberIds = [...team.memberIds, userId];
    const readiness = this.calculateReadiness({ ...team, memberIds });
    this.updateTeam(teamId, { memberIds, readiness });
    
    NotificationService.create(userId, "Team Joined", `You joined ${team.name}.`);
    NotificationService.addActivity("Team Joined", `${UserService.getUser(userId).fullName} joined ${team.name}.`);
  },

  
  removeMember(teamId, memberId, actorId) {
    const team = this.getTeam(teamId);
    if (!team || team.ownerId !== actorId) throw new Error("Only the owner can remove members.");
    
    const memberIds = team.memberIds.filter((id) => id !== memberId);
    this.updateTeam(teamId, { memberIds, readiness: this.calculateReadiness({ ...team, memberIds }) });
  },

  
  saveTeam(userId, teamId) {
    const user = UserService.getRawUser(userId);
    const savedTeams = Array.from(new Set([...(user.savedTeams || []), teamId]));
    UserService.updateUser(userId, { savedTeams });
    NotificationService.create(userId, "Profile Saved", "Team saved to your shortlist.");
  },

  
  removeSavedTeam(userId, teamId) {
    const user = UserService.getRawUser(userId);
    UserService.updateUser(userId, { savedTeams: (user.savedTeams || []).filter((id) => id !== teamId) });
  },

  
  calculateReadiness(team) {
    const members = team.memberIds?.length || 0;
    const missing = team.missingRoles?.length || 0;
    const stack = team.techStack?.length || 0;
    // Readiness is calculated as a composite score of committed team members (+18 points each),
    // tech stack size (+8 points each), and penalty offsets for missing roles (-7 points each from a base of 40).
    // The final score is capped at 98%.
    return Math.min(98, Math.round(members * 18 + stack * 8 + Math.max(0, 40 - missing * 7)));
  }
};

export default TeamService;
