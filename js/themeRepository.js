const ThemeRepository = {
  getTheme() {
    return localStorage.getItem("hb_theme") || "dark";
  },

  setTheme(theme) {
    localStorage.setItem("hb_theme", theme);
  }
};

export default ThemeRepository;
