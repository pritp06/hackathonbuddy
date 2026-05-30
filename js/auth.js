import UserService from "./userService.js";
import Storage from "./storage.js";

const Auth = {
  signup(payload) {
    const user = UserService.createUser(payload);
    this.setSession(user.id);
    return user;
  },
  login(email, password) {
    const user = UserService.getRawUsers().find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
    if (!user) throw new Error("Invalid email or password.");
    this.setSession(user.id);
    return UserService.getUser(user.id);
  },
  logout() {
    Storage.sessionRemove("session");
    location.hash = "#/";
  },
  setSession(userId) {
    Storage.sessionSet("session", { userId, startedAt: new Date().toISOString() });
  },
  currentUser() {
    const session = Storage.sessionGet("session");
    return session?.userId ? UserService.getUser(session.userId) : null;
  },
  requireUser() {
    const user = this.currentUser();
    if (!user) {
      location.hash = "#/login";
      return null;
    }
    if (!user.onboardingComplete && location.hash !== "#/onboarding") {
      location.hash = "#/onboarding";
      return null;
    }
    return user;
  }
};

export default Auth;
