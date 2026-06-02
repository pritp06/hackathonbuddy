import Storage from "./storage.js";

const RequestRepository = {
  getAll() {
    return Storage.get("requests", []);
  },

  getById(id) {
    return this.getAll().find((request) => request.id === id) || null;
  },

  saveAll(requests) {
    Storage.set("requests", requests);
  },

  generateId() {
    return Storage.id("req");
  }
};

export default RequestRepository;
