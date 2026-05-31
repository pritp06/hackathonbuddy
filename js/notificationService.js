/*
File: notificationService.js

Purpose:
Handles the creation, retrieval, and management of both private user notifications 
and global platform activity feeds.

Dependencies:
- storage.js

Used By:
- userService.js
- teamService.js
- requestService.js
- pages.js
- ui.js

====================================================
*/

import Storage from "./storage.js";

const NotificationService = {
  /*
  Purpose: Retrieves a sorted list of private notifications for a specific user.
  Parameters: userId (String) - The ID of the user.
  Returns: Array - List of notifications sorted newest first.
  Side Effects: Reads from localStorage.
  */
  list(userId) {
    return Storage.get("notifications", [])
      .filter((item) => !userId || item.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /*
  Purpose: Creates a new private notification for a user.
  Parameters: 
    - userId (String): Target user ID.
    - type (String): Notification category/title.
    - text (String): The notification body.
  Returns: Object - The generated notification object.
  Side Effects: Updates localStorage.
  */
  create(userId, type, text) {
    const items = Storage.get("notifications", []);
    const notification = { id: Storage.id("note"), userId, type, text, read: false, createdAt: new Date().toISOString() };
    Storage.set("notifications", [notification, ...items]);
    return notification;
  },

  /*
  Purpose: Marks a specific notification as read.
  Parameters: id (String) - Notification ID.
  Returns: undefined
  Side Effects: Updates localStorage.
  */
  markRead(id) {
    const items = Storage.get("notifications", []).map((item) => (item.id === id ? { ...item, read: true } : item));
    Storage.set("notifications", items);
  },

  /*
  Purpose: Appends an event to the global public activity feed.
  Parameters: 
    - type (String): Activity category.
    - text (String): Activity description.
  Returns: undefined
  Side Effects: Updates localStorage.
  */
  addActivity(type, text) {
    const items = Storage.get("activities", []);
    Storage.set("activities", [{ id: Storage.id("act"), type, text, createdAt: new Date().toISOString() }, ...items]);
  },

  /*
  Purpose: Retrieves a sorted list of all global platform activities.
  Parameters: None
  Returns: Array - List of activities sorted newest first.
  Side Effects: Reads from localStorage.
  */
  activities() {
    return Storage.get("activities", []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export default NotificationService;
