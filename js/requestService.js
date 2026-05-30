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
