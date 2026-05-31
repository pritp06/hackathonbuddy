/*
File: auth.js

Purpose:
Handles the authentication flow including signup, login, session persistence,
and logout. Acts as the gatekeeper for protected routes by verifying the current session.

Dependencies:
- userService.js
- storage.js

Used By:
- pages.js
- router.js

====================================================
*/

import UserService from "./userService.js";
import Storage from "./storage.js";

const Auth = {
  /*
  Purpose: Creates a new user and logs them in by establishing a session.
  Parameters: payload (Object) - User details for registration.
  Returns: Object - The newly created user.
  Side Effects: 
    - Interacts with UserService to store the user in localStorage.
    - Sets a session in sessionStorage.
  */
  signup(payload) {
    const user = UserService.createUser(payload);
    this.setSession(user.id);
    return user;
  },

  /*
  Purpose: Authenticates an existing user and establishes a session.
  Parameters: 
    - email (String): The user's email address.
    - password (String): The user's password.
  Returns: Object - The authenticated user.
  Side Effects: 
    - Reads from localStorage (via UserService).
    - Sets a session in sessionStorage.
  */
  login(email, password) {
    // Locate a user matching both email and password for rudimentary auth
    const user = UserService.getRawUsers().find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
    if (!user) throw new Error("Invalid email or password.");
    this.setSession(user.id);
    return UserService.getUser(user.id);
  },

  /*
  Purpose: Logs the current user out and redirects to the landing page.
  Parameters: None
  Returns: undefined
  Side Effects: 
    - Removes the session from sessionStorage.
    - Updates window.location.hash to redirect.
  */
  logout() {
    Storage.sessionRemove("session");
    location.hash = "#/";
  },

  /*
  Purpose: Establishes a user session in sessionStorage.
  Parameters: userId (String) - The ID of the user to log in.
  Returns: undefined
  Side Effects: 
    - Stores session data in sessionStorage.
  */
  setSession(userId) {
    Storage.sessionSet("session", { userId, startedAt: new Date().toISOString() });
  },

  /*
  Purpose: Retrieves the currently logged-in user from the active session.
  Parameters: None
  Returns: Object|null - The user object, or null if no active session.
  Side Effects: Reads from sessionStorage.
  */
  currentUser() {
    const session = Storage.sessionGet("session");
    return session?.userId ? UserService.getUser(session.userId) : null;
  },

  /*
  Purpose: Ensures that a user is authenticated and has completed onboarding.
        Acts as a route guard for protected views.
  Parameters: None
  Returns: Object|null - The current user object if valid, otherwise null.
  Side Effects: 
    - Redirects to login if unauthenticated.
    - Redirects to onboarding if the user has not completed the flow.
  */
  requireUser() {
    const user = this.currentUser();
    // Prevent unauthenticated users from accessing protected views.
    if (!user) {
      location.hash = "#/login";
      return null;
    }
    // Prevent authenticated but incomplete users from accessing dashboard features.
    if (!user.onboardingComplete && location.hash !== "#/onboarding") {
      location.hash = "#/onboarding";
      return null;
    }
    return user;
  }
};

export default Auth;
