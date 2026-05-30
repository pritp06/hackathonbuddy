import Storage from "./storage.js";
import NotificationService from "./notificationService.js";

const publicUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

const UserService = {
  getUsers() {
    return Storage.get("users", []).map(publicUser);
  },
  getRawUsers() {
    return Storage.get("users", []);
  },
  saveUsers(users) {
    Storage.set("users", users);
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
  compatibility(a, b) {
    if (!a || !b) return 0;
    const sharedSkills = (a.skills || []).filter((skill) => (b.skills || []).includes(skill)).length;
    const roleFit = a.role && b.role && a.role !== b.role ? 24 : 10;
    const availability = ["Available", "Looking For Team"].includes(b.availability) ? 20 : 6;
    const experience = a.experience === b.experience ? 12 : 18;
    return Math.min(98, 35 + sharedSkills * 7 + roleFit + availability + experience);
  }
};

export default UserService;
