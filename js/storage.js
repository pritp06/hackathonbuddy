/*
File: storage.js

Purpose:
A wrapper around the browser's localStorage and sessionStorage APIs. 
Provides a consistent way to read, write, and delete data with a standard 
prefix ('hb_') to avoid naming collisions with other applications. 
Automatically parses and stringifies JSON data.

Dependencies:
None

Used By:
- auth.js
- userService.js
- teamService.js
- requestService.js
- notificationService.js
- data.js

====================================================
*/

const Storage = {
  // Prefix added to all keys to namespace the application data
  prefix: "hb_",

  /*
  Purpose: Retrieves a value from localStorage and parses it from JSON.
  Parameters: 
    - key (String): The key to retrieve (without prefix).
    - fallback (Any): The default value to return if parsing fails or key doesn't exist.
  Returns: Any
  Side Effects: Reads from localStorage.
  */
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  /*
  Purpose: Serializes a value to JSON and stores it in localStorage.
  Parameters: 
    - key (String): The key to store the data under (without prefix).
    - value (Any): The data to store.
  Returns: Any (returns the original value)
  Side Effects: Updates localStorage.
  */
  set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
    return value;
  },

  /*
  Purpose: Removes a specific key from localStorage.
  Parameters: 
    - key (String): The key to remove (without prefix).
  Returns: undefined
  Side Effects: Deletes from localStorage.
  */
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },

  /*
  Purpose: Retrieves a value from sessionStorage and parses it from JSON.
  Parameters: 
    - key (String): The key to retrieve (without prefix).
    - fallback (Any): The default value to return if parsing fails or key doesn't exist.
  Returns: Any
  Side Effects: Reads from sessionStorage.
  */
  sessionGet(key, fallback = null) {
    try {
      const value = sessionStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  /*
  Purpose: Serializes a value to JSON and stores it in sessionStorage.
  Parameters: 
    - key (String): The key to store the data under (without prefix).
    - value (Any): The data to store.
  Returns: Any (returns the original value)
  Side Effects: Updates sessionStorage.
  */
  sessionSet(key, value) {
    sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
    return value;
  },

  /*
  Purpose: Removes a specific key from sessionStorage.
  Parameters: 
    - key (String): The key to remove (without prefix).
  Returns: undefined
  Side Effects: Deletes from sessionStorage.
  */
  sessionRemove(key) {
    sessionStorage.removeItem(this.prefix + key);
  },

  /*
  Purpose: Generates a unique identifier string.
  Parameters: 
    - prefix (String): A string to prepend to the generated ID.
  Returns: String (The generated ID)
  Side Effects: None
  */
  id(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
};

export default Storage;
