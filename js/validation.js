/*
File: validation.js

Purpose:
Provides utility functions for validating various forms of user input, 
including emails, URLs, specific platform links, and files.

Dependencies:
None

Used By:
- pages.js (Form validations during onboarding, profile creation, and team creation)

====================================================
*/

const Validation = {
  /*
  Purpose: Validates that a string is a properly formatted email address.
  Parameters: value (String) - The email string to validate.
  Returns: Boolean - True if valid, false otherwise.
  Side Effects: None.
  */
  email(value) {
    // Uses regex to enforce basic email structure: non-space chars + @ + non-space chars + . + non-space chars.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  },

  /*
  Purpose: Validates that a string is a valid HTTP or HTTPS URL.
  Parameters: value (String) - The URL string to validate.
  Returns: Boolean - True if valid, false otherwise.
  Side Effects: None.
  */
  url(value) {
    if (!value) return false;
    try {
      // Parses URL using the built-in URL object to ensure strict structure
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  },

  /*
  Purpose: Validates a URL, but allows empty values.
  Parameters: value (String) - The URL string.
  Returns: Boolean - True if empty or valid URL.
  Side Effects: None.
  */
  optionalUrl(value) {
    return !value || this.url(value);
  },

  /*
  Purpose: Validates that a string is a valid GitHub profile URL.
  Parameters: value (String) - The URL string to validate.
  Returns: Boolean - True if valid GitHub URL, false otherwise.
  Side Effects: None.
  */
  github(value) {
    return this.url(value) && new URL(value).hostname.includes("github.com");
  },

  /*
  Purpose: Validates that a string is a valid LinkedIn profile URL.
  Parameters: value (String) - The URL string to validate.
  Returns: Boolean - True if valid LinkedIn URL, false otherwise.
  Side Effects: None.
  */
  linkedin(value) {
    return this.url(value) && new URL(value).hostname.includes("linkedin.com");
  },

  /*
  Purpose: Validates that an uploaded file is a PDF.
  Parameters: file (File object) - The file to validate.
  Returns: Boolean - True if the file is a PDF, false otherwise.
  Side Effects: None.
  */
  pdf(file) {
    // Check both mime type and file extension as a fallback.
    return file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
  },

  /*
  Purpose: Validates that a value is provided and not empty after trimming whitespace.
  Parameters: value (String|Any) - The value to check.
  Returns: Boolean - True if it contains characters, false otherwise.
  Side Effects: None.
  */
  required(value) {
    return String(value || "").trim().length > 0;
  }
};

export default Validation;
