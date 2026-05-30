import Storage from "./storage.js";
import UserService from "./userService.js";
import NotificationService from "./notificationService.js";

const TeamService = {
  getTeams() {
    return Storage.get("teams", []);
  },
  saveTeams(teams) {
    Storage.set("teams", teams);
  },
  getTeam(id) {
    return this.getTeams().find((team) => team.id === id) || null;
  },
  createTeam(ownerId, payload) {
    const team = {
      id: Storage.id("team"),
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
    return Math.min(98, Math.round(members * 18 + stack * 8 + Math.max(0, 40 - missing * 7)));
  }
};

export default TeamService;
