import Storage from "./storage.js";

const NotificationService = {
  list(userId) {
    return Storage.get("notifications", [])
      .filter((item) => !userId || item.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  create(userId, type, text) {
    const items = Storage.get("notifications", []);
    const notification = { id: Storage.id("note"), userId, type, text, read: false, createdAt: new Date().toISOString() };
    Storage.set("notifications", [notification, ...items]);
    return notification;
  },
  markRead(id) {
    const items = Storage.get("notifications", []).map((item) => (item.id === id ? { ...item, read: true } : item));
    Storage.set("notifications", items);
  },
  addActivity(type, text) {
    const items = Storage.get("activities", []);
    Storage.set("activities", [{ id: Storage.id("act"), type, text, createdAt: new Date().toISOString() }, ...items]);
  },
  activities() {
    return Storage.get("activities", []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export default NotificationService;
