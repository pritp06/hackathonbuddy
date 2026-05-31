/*
File: userService.js

Purpose:
Manages all user-related data operations, including profile creation, 
updating, onboarding state, saving builders, and querying the user database.

Dependencies:
- storage.js
- notificationService.js

Used By:
- auth.js
- pages.js
- teamService.js
- requestService.js

====================================================
*/

import Storage from "./storage.js";
import NotificationService from "./notificationService.js";

/*
Purpose: Sanitizes a user object by removing sensitive data (e.g., passwords) before returning it.
Parameters: user (Object) - The raw user object from storage.
Returns: Object - The sanitized user.
Side Effects: None
*/
const publicUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

const UserService = {
  /*
  Purpose: Retrieves all registered users from storage securely.
  Parameters: None
  Returns: Array - List of sanitized user objects.
  Side Effects: Reads from localStorage.
  */
  getUsers() {
    return Storage.get("users", []).map(publicUser);
  },

  /*
  Purpose: Retrieves all users including sensitive data (for internal logic).
  Parameters: None
  Returns: Array - List of raw user objects.
  Side Effects: Reads from localStorage.
  */
  getRawUsers() {
    return Storage.get("users", []);
  },

  /*
  Purpose: Replaces the entire users list in storage.
  Parameters: users (Array) - The new list of raw user objects.
  Returns: undefined
  Side Effects: Updates localStorage.
  */
  saveUsers(users) {
    Storage.set("users", users);
  },

  /*
  Purpose: Retrieves a single sanitized user by ID.
  Parameters: id (String) - The user's ID.
  Returns: Object|null - Sanitized user object or null if not found.
  Side Effects: Reads from localStorage.
  */
  getUser(id) {
    const user = this.getRawUsers().find((item) => item.id === id);
    return user ? publicUser(user) : null;
  },

  /*
  Purpose: Retrieves a single raw user by ID.
  Parameters: id (String) - The user's ID.
  Returns: Object|null - Raw user object or null if not found.
  Side Effects: Reads from localStorage.
  */
  getRawUser(id) {
    return this.getRawUsers().find((item) => item.id === id) || null;
  },

  /*
  Purpose: Creates a new user record in the database.
  Parameters: payload (Object) - Contains registration fields (email, username, etc).
  Returns: Object - The newly created sanitized user.
  Side Effects: 
    - Validates uniqueness of email and username.
    - Updates localStorage with the new user record.
  */
  createUser(payload) {
    const users = this.getRawUsers();
    
    // Check if the provided email or username already exists
    const emailTaken = users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    const usernameTaken = users.some((user) => user.username.toLowerCase() === payload.username.toLowerCase());
    if (emailTaken) throw new Error("Email is already registered.");
    if (usernameTaken) throw new Error("Username is already taken.");
    
    // Construct the new user schema
    const user = {
      id: Storage.id("user"),
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      password: payload.password,
      role: "",
      experience: "",
      skills: [],
      github: "",
      linkedin: "",
      portfolio: "",
      projects: [],
      resume: null,
      availability: "",
      onboardingComplete: false,
      verified: false,
      savedBuilders: [],
      savedTeams: [],
      privacy: { showResume: true, showEmail: false },
      createdAt: new Date().toISOString()
    };
    
    this.saveUsers([user, ...users]);
    return publicUser(user);
  },

  /*
  Purpose: Updates specific fields for an existing user.
  Parameters: 
    - id (String): The ID of the user to update.
    - patch (Object): An object containing fields to update.
  Returns: Object - The updated sanitized user.
  Side Effects: 
    - Updates localStorage.
    - Generates an activity notification.
  */
  updateUser(id, patch) {
    const users = this.getRawUsers();
    const existing = users.find((user) => user.id === id);
    if (!existing) throw new Error("User not found.");
    
    // Merge the existing user data with the patch
    const next = users.map((user) => (user.id === id ? { ...user, ...patch } : user));
    this.saveUsers(next);
    
    NotificationService.addActivity("Profile Updated", `${patch.fullName || existing.fullName} updated their profile.`);
    return publicUser(next.find((user) => user.id === id));
  },

  /*
  Purpose: Marks the user as fully onboarded, unlocking platform access.
  Parameters: 
    - id (String): The ID of the user.
    - profile (Object): Final profile data collected during onboarding.
  Returns: Object - The updated user object.
  Side Effects: Calls updateUser which triggers localStorage writes.
  */
  completeOnboarding(id, profile) {
    return this.updateUser(id, { ...profile, onboardingComplete: true, verified: true });
  },

  /*
  Purpose: Saves a specific builder to the current user's saved list.
  Parameters: 
    - currentUserId (String): ID of the user performing the save.
    - builderId (String): ID of the builder being saved.
  Returns: Array - The updated array of saved builder IDs.
  Side Effects: 
    - Updates localStorage.
    - Creates a notification for the current user.
  */
  saveBuilder(currentUserId, builderId) {
    if (currentUserId === builderId) throw new Error("You cannot save your own profile.");
    const user = this.getRawUser(currentUserId);
    
    // Use Set to ensure no duplicates are added to the list
    const savedBuilders = Array.from(new Set([...(user.savedBuilders || []), builderId]));
    
    this.updateUser(currentUserId, { savedBuilders });
    NotificationService.create(currentUserId, "Profile Saved", "Builder saved to your shortlist.");
    return savedBuilders;
  },

  /*
  Purpose: Removes a specific builder from the current user's saved list.
  Parameters: 
    - currentUserId (String): ID of the user.
    - builderId (String): ID of the builder to remove.
  Returns: Object - The updated user object.
  Side Effects: Updates localStorage.
  */
  removeSavedBuilder(currentUserId, builderId) {
    const user = this.getRawUser(currentUserId);
    return this.updateUser(currentUserId, { savedBuilders: (user.savedBuilders || []).filter((id) => id !== builderId) });
  },

  /*
  Purpose: Calculates an arbitrary compatibility score between two users.
  Parameters: 
    - a (Object): First user object.
    - b (Object): Second user object.
  Returns: Number - The compatibility score (0-98).
  Side Effects: None.
  */
  compatibility(a, b) {
    if (!a || !b) return 0;
    
    // Calculates how many skills both users have in common.
    const sharedSkills = (a.skills || []).filter((skill) => (b.skills || []).includes(skill)).length;
    
    // Awards more points if they have different roles (complementary fit).
    const roleFit = a.role && b.role && a.role !== b.role ? 24 : 10;
    
    // Awards more points if the target user is actively looking for a team.
    const availability = ["Available", "Looking For Team"].includes(b.availability) ? 20 : 6;
    
    // Calculates points based on matching experience levels.
    const experience = a.experience === b.experience ? 12 : 18;
    
    return Math.min(98, 35 + sharedSkills * 7 + roleFit + availability + experience);
  }
};

export default UserService;
