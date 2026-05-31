/*
File: requestService.js

Purpose:
Manages sending, receiving, and updating the status of team formation 
requests between individual builders and team owners.

Dependencies:
- storage.js
- userService.js
- teamService.js
- notificationService.js

Used By:
- pages.js

====================================================
*/

import Storage from "./storage.js";
import UserService from "./userService.js";
import TeamService from "./teamService.js";
import NotificationService from "./notificationService.js";

const RequestService = {
  /*
  Purpose: Retrieves all connection requests currently stored.
  Parameters: None
  Returns: Array - List of request objects.
  Side Effects: Reads from localStorage.
  */
  getRequests() {
    return Storage.get("requests", []);
  },

  /*
  Purpose: Replaces the entire requests list in storage.
  Parameters: requests (Array) - The new list of request objects.
  Returns: undefined
  Side Effects: Updates localStorage.
  */
  saveRequests(requests) {
    Storage.set("requests", requests);
  },

  /*
  Purpose: Retrieves a specific request by its ID.
  Parameters: id (String) - The request ID.
  Returns: Object|null - Request object or null.
  Side Effects: Reads from localStorage.
  */
  getRequest(id) {
    return this.getRequests().find((request) => request.id === id) || null;
  },

  /*
  Purpose: Gets all requests sent by a specific user.
  Parameters: userId (String) - The sender's user ID.
  Returns: Array - Filtered list of requests.
  Side Effects: Reads from localStorage.
  */
  sent(userId) {
    return this.getRequests().filter((request) => request.fromUserId === userId);
  },

  /*
  Purpose: Gets all requests received by a specific user or a team owned by them.
  Parameters: userId (String) - The receiver's user ID.
  Returns: Array - Filtered list of requests.
  Side Effects: Reads from localStorage.
  */
  received(userId) {
    return this.getRequests().filter((request) => request.toUserId === userId || request.teamOwnerId === userId);
  },

  /*
  Purpose: Sends a new formation request to a builder or a team.
  Parameters: 
    - fromUserId (String): ID of the user sending the request.
    - target (Object): Contains the target id and type ("builder" or "team").
    - message (String): Optional personal message.
  Returns: Object - The generated request object.
  Side Effects: 
    - Updates localStorage.
    - Generates notifications and activity logs.
  */
  sendRequest(fromUserId, target, message) {
    const current = UserService.getUser(fromUserId);
    
    // Resolve the destination user ID depending on if the target is a direct builder or a team
    const toUserId = target.type === "builder" ? target.id : TeamService.getTeam(target.id)?.ownerId;
    if (!toUserId) throw new Error("Request target not found.");
    
    // Prevent self-requests
    if (fromUserId === toUserId) throw new Error("You cannot send a request to yourself.");
    
    const request = {
      id: Storage.id("req"),
      fromUserId,
      toUserId,
      teamId: target.type === "team" ? target.id : null,
      teamOwnerId: target.type === "team" ? toUserId : null,
      type: target.type,
      message: message || `I think our skills line up for a strong hackathon team.`,
      status: "Pending",
      // Calculate compatibility if it's builder-to-builder, otherwise default to 78 for teams
      compatibility: target.type === "builder" ? UserService.compatibility(current, UserService.getUser(target.id)) : 78,
      createdAt: new Date().toISOString()
    };
    
    this.saveRequests([request, ...this.getRequests()]);
    NotificationService.create(toUserId, "New Request", `${current.fullName} sent a team formation request.`);
    NotificationService.addActivity("Request Sent", `${current.fullName} sent a team request.`);
    return request;
  },

  /*
  Purpose: Updates the status of an existing request (e.g., Accepted, Rejected).
  Parameters: 
    - id (String): The request ID.
    - status (String): The new status.
    - actorId (String): The ID of the user attempting the update.
  Returns: Object - The updated request object.
  Side Effects: 
    - Updates localStorage.
    - Triggers notifications if accepted.
  */
  updateStatus(id, status, actorId) {
    const request = this.getRequest(id);
    if (!request) throw new Error("Request not found.");
    
    // Enforce business rule: Only the receiver or team owner can update the status
    if (request.toUserId !== actorId && request.teamOwnerId !== actorId) throw new Error("You cannot update this request.");
    
    const requests = this.getRequests().map((item) => (item.id === id ? { ...item, status } : item));
    this.saveRequests(requests);
    
    // If accepted, notify the original sender
    if (status === "Accepted") {
      NotificationService.create(request.fromUserId, "Request Accepted", "Your team formation request was accepted.");
      NotificationService.addActivity("Request Accepted", "A team formation request was accepted.");
    }
    return this.getRequest(id);
  }
};

export default RequestService;
