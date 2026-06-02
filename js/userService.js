

/**
 * 1. Purpose
 *    - User profile service managing account records, onboarding state, and builder matching logic.
 * 2. Responsibilities
 *    - Queries, filters, and sanitizes developer records to strip sensitive values (e.g. passwords).
 *    - Creates new inactive builder records with unique username and email constraints.
 *    - Saves profile customizations and triggers global activity updates.
 *    - Manages builder saving shortcuts for user shortcuts portfolios.
 *    - Evaluates compatibility matchmaking percentages between developers.
 * 3. Dependencies
 *    - js/storage.js (Managing reads and writes for "users" collections)
 *    - js/notificationService.js (Registering profile activities and alerts)
 * 4. Important Functions
 *    - `getUsers()`: Returns list of public, sanitized user profiles.
 *    - `createUser(payload)`: Instantiates a default, inactive user skeleton.
 *    - `updateUser(id, patch)`: Merges user changes and raises activity notifications.
 *    - `compatibility(a, b)`: Mathematical matchmaking weighting function.
 * 5. Data Flow
 *    - Read Users: LocalStorage -> JSON parse -> strip password fields -> return array.
 *    - Register: form values -> email/username unique checks -> add default object -> write to LocalStorage.
 */

import UserRepository from "./userRepository.js";
import NotificationService from "./notificationService.js";


const publicUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

const UserService = {
  
  getUsers() {
    return UserRepository.getAll().map(publicUser);
  },

  
  getRawUsers() {
    return UserRepository.getAll();
  },

  
  saveUsers(users) {
    UserRepository.saveAll(users);
  },

  
  getUser(id) {
    const user = this.getRawUsers().find((item) => item.id === id);
    return user ? publicUser(user) : null;
  },

  
  getRawUser(id) {
    return this.getRawUsers().find((item) => item.id === id) || null;
  },

  
  createUser(payload) {
    const users = this.getRawUsers();
    const emailTaken = users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    const usernameTaken = users.some((user) => user.username.toLowerCase() === payload.username.toLowerCase());
    if (emailTaken) throw new Error("Email is already registered.");
    if (usernameTaken) throw new Error("Username is already taken.");
    const user = {
      id: UserRepository.generateId(),
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

  
  updateUser(id, patch) {
    const users = this.getRawUsers();
    const existing = users.find((user) => user.id === id);
    if (!existing) throw new Error("User not found.");
    const next = users.map((user) => (user.id === id ? { ...user, ...patch } : user));
    this.saveUsers(next);
    
    NotificationService.addActivity("Profile Updated", `${patch.fullName || existing.fullName} updated their profile.`);
    return publicUser(next.find((user) => user.id === id));
  },

  
  completeOnboarding(id, profile) {
    return this.updateUser(id, { ...profile, onboardingComplete: true, verified: true });
  },

  
  saveBuilder(currentUserId, builderId) {
    if (currentUserId === builderId) throw new Error("You cannot save your own profile.");
    const user = this.getRawUser(currentUserId);
    const savedBuilders = Array.from(new Set([...(user.savedBuilders || []), builderId]));
    
    this.updateUser(currentUserId, { savedBuilders });
    NotificationService.create(currentUserId, "Profile Saved", "Builder saved to your shortlist.");
    return savedBuilders;
  },

  
  removeSavedBuilder(currentUserId, builderId) {
    const user = this.getRawUser(currentUserId);
    return this.updateUser(currentUserId, { savedBuilders: (user.savedBuilders || []).filter((id) => id !== builderId) });
  },

  
  getOnboardingDraft(user) {
    return UserRepository.getOnboardingDraft(user);
  },

  setOnboardingDraft(draft) {
    return UserRepository.setOnboardingDraft(draft);
  },

  getOnboardingStep() {
    return UserRepository.getOnboardingStep();
  },

  setOnboardingStep(step) {
    return UserRepository.setOnboardingStep(step);
  },

  clearOnboardingDraft() {
    UserRepository.clearOnboardingDraft();
    UserRepository.clearOnboardingStep();
  },

  
  compatibility(a, b) {
    if (!a || !b) return 0;
    const sharedSkills = (a.skills || []).filter((skill) => (b.skills || []).includes(skill)).length;
    const roleFit = a.role && b.role && a.role !== b.role ? 24 : 10;
    const availability = ["Available", "Looking For Team"].includes(b.availability) ? 20 : 6;
    const experience = a.experience === b.experience ? 12 : 18;
    
    // Compatibility score is weighted toward complimentary roles (different roles get +24 vs +10),
    // shared skills (+7 per match), active availability (+20 vs +6), and experience level differences
    // to drive optimal team construction decisions. The final score is capped at 98%.
    return Math.min(98, 35 + sharedSkills * 7 + roleFit + availability + experience);
  }
};

export default UserService;
