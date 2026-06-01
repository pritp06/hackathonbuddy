

/**
 * 1. Purpose
 *    - Data persistence utility managing localStorage, sessionStorage, and unique ID generation.
 * 2. Responsibilities
 *    - Wraps low-level browser web storage APIs with JSON serialization/deserialization.
 *    - Enforces a unified key naming convention by automatically prepending the `"hb_"` namespace prefix.
 *    - Provides error-resilient wrappers that catch parsing exceptions and return fallback values.
 *    - Exposes separate localStorage (persistent) and sessionStorage (session-scoped) functions.
 *    - Generates pseudo-random, unique database key string identifiers (e.g. `user_`, `team_`, `req_`).
 * 3. Dependencies
 *    - Browser DOM APIs: localStorage, sessionStorage, Date, Math.
 * 4. Important Functions
 *    - `get(key, fallback)`: Recovers JSON value from localStorage or returns fallback on parse errors.
 *    - `set(key, value)`: Writes serialized value to localStorage.
 *    - `sessionGet(key, fallback)`: Recovers JSON value from sessionStorage (used for temporary drafts).
 *    - `sessionSet(key, value)`: Writes serialized value to sessionStorage.
 *    - `id(prefix)`: Generates unique ID string using a timestamp base-36 representation and a random substring.
 * 5. Data Flow
 *    - Called by all data-manipulating services.
 *    - JS memory object -> JSON.stringify() -> LocalStorage / SessionStorage -> JSON.parse() -> JS memory object.
 */

const Storage = {
  prefix: "hb_",

  
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  
  set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
    return value;
  },

  
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },

  
  sessionGet(key, fallback = null) {
    try {
      const value = sessionStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  
  sessionSet(key, value) {
    sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
    return value;
  },

  
  sessionRemove(key) {
    sessionStorage.removeItem(this.prefix + key);
  },

  
  id(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
};

export default Storage;
