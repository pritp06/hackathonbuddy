

/**
 * 1. Purpose
 *    - Connection request service handling invitations, join requests, status updates, and notifications.
 * 2. Responsibilities
 *    - Queries, filters, and stores connection request records.
 *    - Supports sending a request from builder to builder or builder to team (and vice versa).
 *    - Assesses compatibility metrics when creating builder-to-builder request records.
 *    - Manages request status state machine updates (Pending -> Accepted/Declined).
 *    - Verifies that only authorized actors (recipients or owners) can update request statuses.
 *    - Dispatches notifications and registers feed activities on request actions.
 * 3. Dependencies
 *    - js/storage.js (Managing reads and writes for request collections)
 *    - js/userService.js (Resolving user details and calculating compatibility scores)
 *    - js/teamService.js (Resolving team ownership and member details)
 *    - js/notificationService.js (Raising alerts and publishing feed updates)
 * 4. Important Functions
 *    - `sendRequest(fromUserId, target, message)`: Initiates a connection request and logs to database.
 *    - `updateStatus(id, status, actorId)`: Enforces security checks and processes transitions.
 *    - `sent(userId)` / `received(userId)`: Filters collections based on caller's identity roles.
 * 5. Data Flow
 *    - Builder request -> target validation -> record creation -> LocalStorage write -> notification dispatch.
 */

import Storage from "./storage.js";
import UserService from "./userService.js";
import TeamService from "./teamService.js";
import NotificationService from "./notificationService.js";

const RequestService = {
  
  getRequests() {
    return Storage.get("requests", []);
  },

  
  saveRequests(requests) {
    Storage.set("requests", requests);
  },

  
  getRequest(id) {
    return this.getRequests().find((request) => request.id === id) || null;
  },

  
  sent(userId) {
    return this.getRequests().filter((request) => request.fromUserId === userId);
  },

  
  received(userId) {
    return this.getRequests().filter((request) => request.toUserId === userId || request.teamOwnerId === userId);
  },

  
  sendRequest(fromUserId, target, message) {
    const current = UserService.getUser(fromUserId);
    const toUserId = target.type === "builder" ? target.id : TeamService.getTeam(target.id)?.ownerId;
    if (!toUserId) throw new Error("Request target not found.");
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
      compatibility: target.type === "builder" ? UserService.compatibility(current, UserService.getUser(target.id)) : 78,
      createdAt: new Date().toISOString()
    };
    
    this.saveRequests([request, ...this.getRequests()]);
    NotificationService.create(toUserId, "New Request", `${current.fullName} sent a team formation request.`);
    NotificationService.addActivity("Request Sent", `${current.fullName} sent a team request.`);
    return request;
  },

  
  updateStatus(id, status, actorId) {
    const request = this.getRequest(id);
    if (!request) throw new Error("Request not found.");
    if (request.toUserId !== actorId && request.teamOwnerId !== actorId) throw new Error("You cannot update this request.");
    
    const requests = this.getRequests().map((item) => (item.id === id ? { ...item, status } : item));
    this.saveRequests(requests);
    if (status === "Accepted") {
      NotificationService.create(request.fromUserId, "Request Accepted", "Your team formation request was accepted.");
      NotificationService.addActivity("Request Accepted", "A team formation request was accepted.");
    }
    return this.getRequest(id);
  }
};

export default RequestService;
