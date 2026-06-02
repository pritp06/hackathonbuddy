

/**
 * 1. Purpose
 *    - Alerting and activity tracking service managing user alerts and network-wide feeds.
 * 2. Responsibilities
 *    - Logs user-specific notification alerts and marks them read upon request.
 *    - Compiles network-wide activity feed event logs (e.g. team creation, member additions).
 *    - Filters and sorts notification and activity collections in chronological order.
 * 3. Dependencies
 *    - js/storage.js (Reading and writing arrays in localStorage)
 * 4. Important Functions
 *    - `list(userId)`: Returns descending chronological notifications matching user.
 *    - `create(userId, type, text)`: Appends an alert to the notifications database.
 *    - `markRead(id)`: Changes the `read` flag of a notification to true.
 *    - `addActivity(type, text)`: Appends a public action log entry to the activity database.
 *    - `activities()`: Retrieves all public activity events chronologically.
 * 5. Data Flow
 *    - Operations -> invoke create/addActivity -> save to LocalStorage collections -> dynamic pages query -> UI displays.
 */

import NotificationRepository from "./notificationRepository.js";

const NotificationService = {
  
  list(userId) {
    return NotificationRepository.getNotifications()
      .filter((item) => !userId || item.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  
  create(userId, type, text) {
    const items = NotificationRepository.getNotifications();
    const notification = { id: NotificationRepository.generateId("note"), userId, type, text, read: false, createdAt: new Date().toISOString() };
    NotificationRepository.saveNotifications([notification, ...items]);
    return notification;
  },

  
  markRead(id) {
    const items = NotificationRepository.getNotifications().map((item) => (item.id === id ? { ...item, read: true } : item));
    NotificationRepository.saveNotifications(items);
  },

  
  addActivity(type, text) {
    const items = NotificationRepository.getActivities();
    NotificationRepository.saveActivities([{ id: NotificationRepository.generateId("act"), type, text, createdAt: new Date().toISOString() }, ...items]);
  },

  
  activities() {
    return NotificationRepository.getActivities().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export default NotificationService;
