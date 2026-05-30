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
