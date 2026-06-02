

/**
 * 1. Purpose
 *    - Session authentication coordinator managing authentication logic and state checks.
 * 2. Responsibilities
 *    - Executes registration workflows using payload templates.
 *    - Authenticates user credentials against local mock user entries.
 *    - Generates user login sessions, and disposes of sessions upon logout commands.
 *    - Exposes current session authentication state to components.
 *    - Enforces page-access session requirements on restricted UI paths.
 * 3. Dependencies
 *    - js/userService.js (User account retrieval and storage insertions)
 *    - js/storage.js (Browser storage transactions wrapper)
 * 4. Important Functions
 *    - `signup(payload)`: Instantiates a user profile entry and sets the current session.
 *    - `login(email, password)`: Validates credentials, sets user session, and updates view.
 *    - `logout()`: Destroys user session markers and resets routing location to landing.
 *    - `setSession(userId)`: Writes session meta configuration objects to Storage.
 *    - `currentUser()`: Resolves logged-in user model or returns null context.
 *    - `requireUser()`: Routing guard ensuring authenticated, onboarding-complete context.
 * 5. Data Flow
 *    - Form submit -> login/signup validation -> UserService write -> session registration in Storage -> Router redirections.
 */

import UserService from "./userService.js";
import UserRepository from "./userRepository.js";

const Auth = {
  signup(payload) {
    const user = UserService.createUser(payload);
    UserService.clearOnboardingDraft();
    this.setSession(user.id);
    return user;
  },

  
  login(email, password) {
    const user = UserService.getRawUsers().find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
    if (!user) throw new Error("Invalid email or password.");
    UserService.clearOnboardingDraft();
    this.setSession(user.id);
    return UserService.getUser(user.id);
  },

  
  logout() {
    UserRepository.removeSession();
    UserService.clearOnboardingDraft();
    location.hash = "#/";
  },

  
  setSession(userId) {
    UserRepository.setSession({ userId, startedAt: new Date().toISOString() });
  },

  
  currentUser() {
    const session = UserRepository.getSession();
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
