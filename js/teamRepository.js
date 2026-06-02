import Storage from "./storage.js";

const TeamRepository = {
  getAll() {
    return Storage.get("teams", []);
  },

  getById(id) {
    return this.getAll().find((team) => team.id === id) || null;
  },

  saveAll(teams) {
    Storage.set("teams", teams);
  },

  generateId() {
    return Storage.id("team");
  }
};

export default TeamRepository;
