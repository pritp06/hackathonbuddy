import Storage from "./storage.js";

const NotificationRepository = {
  getNotifications() {
    return Storage.get("notifications", []);
  },

  saveNotifications(notifications) {
    Storage.set("notifications", notifications);
  },

  getActivities() {
    return Storage.get("activities", []);
  },

  saveActivities(activities) {
    Storage.set("activities", activities);
  },

  generateId(prefix) {
    return Storage.id(prefix);
  }
};

export default NotificationRepository;
