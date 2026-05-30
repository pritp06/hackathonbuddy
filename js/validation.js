const Validation = {
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  },
  url(value) {
    if (!value) return false;
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  },
  optionalUrl(value) {
    return !value || this.url(value);
  },
  github(value) {
    return this.url(value) && new URL(value).hostname.includes("github.com");
  },
  linkedin(value) {
    return this.url(value) && new URL(value).hostname.includes("linkedin.com");
  },
  pdf(file) {
    return file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
  },
  required(value) {
    return String(value || "").trim().length > 0;
  }
};

export default Validation;
