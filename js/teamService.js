/*
File: teamService.js

Purpose:
Manages operations related to team creation, member management, and computing 
the readiness score of a team based on its members and tech stack.

Dependencies:
- storage.js
- userService.js
- notificationService.js

Used By:
- pages.js
- requestService.js

====================================================
*/

import Storage from "./storage.js";
import UserService from "./userService.js";
import NotificationService from "./notificationService.js";

const TeamService = {
  /*
  Purpose: Retrieves all teams currently stored in localStorage.
  Parameters: None
  Returns: Array - List of team objects.
  Side Effects: Reads from localStorage.
  */
  getTeams() {
    return Storage.get("teams", []);
  },

  /*
  Purpose: Replaces the entire teams list in storage.
  Parameters: teams (Array) - The new list of team objects.
  Returns: undefined
  Side Effects: Updates localStorage.
  */
  saveTeams(teams) {
    Storage.set("teams", teams);
  },

  /*
  Purpose: Retrieves a specific team by its ID.
  Parameters: id (String) - The ID of the team.
  Returns: Object|null - Team object or null if not found.
  Side Effects: Reads from localStorage.
  */
  getTeam(id) {
    return this.getTeams().find((team) => team.id === id) || null;
  },

  /*
  Purpose: Creates a new team with the current user as the owner.
  Parameters: 
    - ownerId (String): The ID of the user creating the team.
    - payload (Object): Team details (name, goal, techStack, etc).
  Returns: Object - The created team object.
  Side Effects: 
    - Generates a new unique ID.
    - Updates localStorage.
    - Creates an activity notification.
  */
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

  /*
  Purpose: Updates specific fields on an existing team.
  Parameters: 
    - id (String): The team ID.
    - patch (Object): An object containing fields to update.
  Returns: Object - The updated team object.
  Side Effects: Updates localStorage.
  */
  updateTeam(id, patch) {
    const teams = this.getTeams().map((team) => (team.id === id ? { ...team, ...patch } : team));
    this.saveTeams(teams);
    return this.getTeam(id);
  },

  /*
  Purpose: Adds a user to an existing team.
  Parameters: 
    - teamId (String): The ID of the team.
    - userId (String): The ID of the user joining.
  Returns: undefined
  Side Effects: 
    - Updates localStorage.
    - Creates personal and global activity notifications.
  */
  joinTeam(teamId, userId) {
    const team = this.getTeam(teamId);
    if (!team) throw new Error("Team not found.");
    
    // Prevent duplicate team memberships
    if (team.memberIds.includes(userId)) throw new Error("You are already on this team.");
    
    const memberIds = [...team.memberIds, userId];
    
    // Recalculate readiness since member composition changed
    const readiness = this.calculateReadiness({ ...team, memberIds });
    this.updateTeam(teamId, { memberIds, readiness });
    
    NotificationService.create(userId, "Team Joined", `You joined ${team.name}.`);
    NotificationService.addActivity("Team Joined", `${UserService.getUser(userId).fullName} joined ${team.name}.`);
  },

  /*
  Purpose: Removes a member from a team. Only permitted if the actor is the team owner.
  Parameters: 
    - teamId (String): The ID of the team.
    - memberId (String): The ID of the user to remove.
    - actorId (String): The ID of the user performing the removal.
  Returns: undefined
  Side Effects: Updates localStorage.
  */
  removeMember(teamId, memberId, actorId) {
    const team = this.getTeam(teamId);
    
    // Enforce business rule: Only team owners can kick members
    if (!team || team.ownerId !== actorId) throw new Error("Only the owner can remove members.");
    
    const memberIds = team.memberIds.filter((id) => id !== memberId);
    
    // Recalculate readiness since the team size decreased
    this.updateTeam(teamId, { memberIds, readiness: this.calculateReadiness({ ...team, memberIds }) });
  },

  /*
  Purpose: Adds a team to a user's saved shortlist.
  Parameters: 
    - userId (String): ID of the user saving the team.
    - teamId (String): ID of the team to save.
  Returns: undefined
  Side Effects: 
    - Updates user in localStorage.
    - Generates a personal notification.
  */
  saveTeam(userId, teamId) {
    const user = UserService.getRawUser(userId);
    
    // Ensure uniqueness by leveraging a Set
    const savedTeams = Array.from(new Set([...(user.savedTeams || []), teamId]));
    UserService.updateUser(userId, { savedTeams });
    NotificationService.create(userId, "Profile Saved", "Team saved to your shortlist.");
  },

  /*
  Purpose: Removes a team from a user's saved shortlist.
  Parameters: 
    - userId (String): ID of the user.
    - teamId (String): ID of the team to remove.
  Returns: undefined
  Side Effects: Updates user in localStorage.
  */
  removeSavedTeam(userId, teamId) {
    const user = UserService.getRawUser(userId);
    UserService.updateUser(userId, { savedTeams: (user.savedTeams || []).filter((id) => id !== teamId) });
  },

  /*
  Purpose: Calculates a team's readiness score based on its composition and details.
  Parameters: team (Object) - The team object to evaluate.
  Returns: Number - A readiness score (0-98).
  Side Effects: None.
  */
  calculateReadiness(team) {
    const members = team.memberIds?.length || 0;
    const missing = team.missingRoles?.length || 0;
    const stack = team.techStack?.length || 0;
    
    // Algorithm: Awards points for members and tech stack, deducts for missing roles
    return Math.min(98, Math.round(members * 18 + stack * 8 + Math.max(0, 40 - missing * 7)));
  }
};

export default TeamService;
