

/**
 * 1. Purpose
 *    - Data validation helper validating inputs and formats on profiles and forms.
 * 2. Responsibilities
 *    - Matches inputs against format regular expressions (e.g. emails).
 *    - Parses and checks URL structure and HTTP/HTTPS protocol constraints.
 *    - Verifies domain hostnames on profile links (restricting to Github or LinkedIn domains).
 *    - Validates file MIME types and file extensions (restricting uploads to PDFs).
 *    - Checks for the presence of required input text parameters.
 * 3. Dependencies
 *    - Browser DOM APIs: URL, File.
 * 4. Important Functions
 *    - `email(value)`: Standard regular expression validation for email addresses.
 *    - `url(value)`: Parses URL objects to confirm correct formatting and protocols.
 *    - `github(value)` / `linkedin(value)`: Verifies matching domain hostnames in links.
 *    - `pdf(file)`: Validates uploaded file types match applications/pdf or end with `.pdf`.
 *    - `required(value)`: Validates non-empty inputs.
 * 5. Data Flow
 *    - Input form values -> validation check -> return true/false -> raise errors or proceed.
 */

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
