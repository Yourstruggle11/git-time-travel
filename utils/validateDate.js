/**
 * Validates if a string is a valid Git date format
 * Supports ISO 8601 format and Git's default format
 * @param {string} dateString - The date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidGitDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const trimmedDate = dateString.trim();

  // ISO 8601 format: 2023-02-20T15:30:00+05:30 or 2023-02-20T15:30:00Z
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/;

  // Git default format: 2023-02-20 15:30:00 +0530
  const gitDefaultRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4}$/;

  if (iso8601Regex.test(trimmedDate) || gitDefaultRegex.test(trimmedDate)) {
    // Additional validation: check if it's a valid date
    const date = new Date(trimmedDate);
    return !isNaN(date.getTime());
  }

  return false;
};

/**
 * Sanitizes a date string to prevent shell injection
 * @param {string} dateString - The date string to sanitize
 * @returns {string} Sanitized date string
 */
export const sanitizeDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Invalid date string provided');
  }

  const trimmedDate = dateString.trim();

  // Only allow alphanumeric, spaces, hyphens, colons, plus/minus signs, and T/Z
  const sanitized = trimmedDate.replace(/[^0-9a-zA-Z\s:+\-TZ]/g, '');

  if (!isValidGitDate(sanitized)) {
    throw new Error(`Invalid date format: "${trimmedDate}". Expected format: YYYY-MM-DDTHH:MM:SS+HH:MM or YYYY-MM-DD HH:MM:SS +HHMM`);
  }

  return sanitized;
};

/**
 * Validates a Git commit hash
 * @param {string} hash - The commit hash to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidCommitHash = (hash) => {
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  const trimmedHash = hash.trim();
  // Git commit hashes are 40 characters (SHA-1) or 64 characters (SHA-256)
  const hashRegex = /^[a-f0-9]{7,64}$/i;

  return hashRegex.test(trimmedHash);
};
