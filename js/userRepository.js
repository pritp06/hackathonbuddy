import Storage from "./storage.js";

const UserRepository = {
  getAll() {
    return Storage.get("users", []);
  },

  getById(id) {
    return this.getAll().find((user) => user.id === id) || null;
  },

  saveAll(users) {
    Storage.set("users", users);
  },

  save(user) {
    const users = this.getAll();
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.saveAll(users);
    return user;
  },

  delete(id) {
    const users = this.getAll().filter((u) => u.id !== id);
    this.saveAll(users);
  },

  getOnboardingDraft(user) {
    const draft = Storage.sessionGet("onboarding");
    if (draft && draft.id === user.id) {
      return draft;
    }
    if (draft) {
      this.clearOnboardingDraft();
    }
    return user;
  },

  setOnboardingDraft(draft) {
    return Storage.sessionSet("onboarding", draft);
  },

  clearOnboardingDraft() {
    Storage.sessionRemove("onboarding");
  },

  getOnboardingStep() {
    return Number(Storage.sessionGet("onboardingStep", 1));
  },

  setOnboardingStep(step) {
    return Storage.sessionSet("onboardingStep", Number(step));
  },

  clearOnboardingStep() {
    Storage.sessionRemove("onboardingStep");
  },

  getSession() {
    return Storage.get("session");
  },

  setSession(session) {
    return Storage.set("session", session);
  },

  removeSession() {
    Storage.remove("session");
  },

  generateId() {
    return Storage.id("user");
  },

  isInitialized() {
    return Storage.get("initialized");
  },

  setInitialized(value) {
    Storage.set("initialized", value);
  }
};

export default UserRepository;
