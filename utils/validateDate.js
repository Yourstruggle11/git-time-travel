/**
 * Validates if a string is a valid Git date format
 * Supports multiple formats: ISO 8601, Git default, RFC 2822, Unix timestamp
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

  // RFC 2822 format: Mon, 20 Feb 2023 15:30:00 +0530
  const rfc2822Regex = /^[A-Z][a-z]{2}, \d{1,2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/;

  // Unix timestamp (seconds since epoch)
  const unixTimestampRegex = /^\d{10}$/;

  if (
    iso8601Regex.test(trimmedDate) ||
    gitDefaultRegex.test(trimmedDate) ||
    rfc2822Regex.test(trimmedDate)
  ) {
    // Additional validation: check if it's a valid date
    const date = new Date(trimmedDate);
    return !isNaN(date.getTime());
  }

  // Unix timestamp validation
  if (unixTimestampRegex.test(trimmedDate)) {
    const timestamp = parseInt(trimmedDate, 10);
    const date = new Date(timestamp * 1000);
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

  // Only allow alphanumeric, spaces, hyphens, colons, plus/minus signs, comma, and T/Z
  const sanitized = trimmedDate.replace(/[^0-9a-zA-Z\s:+\-TZ,]/g, '');

  if (!isValidGitDate(sanitized)) {
    throw new Error(`Invalid date format: "${trimmedDate}". Supported formats:
    - ISO 8601: YYYY-MM-DDTHH:MM:SS+HH:MM
    - Git default: YYYY-MM-DD HH:MM:SS +HHMM
    - RFC 2822: Mon, 20 Feb 2023 15:30:00 +0530
    - Unix timestamp: 1234567890`);
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
