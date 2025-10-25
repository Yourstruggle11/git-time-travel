import { platform } from 'os';

/**
 * Determines the appropriate text editor to use
 * Priority: --editor flag > VISUAL env > EDITOR env > platform default
 * @param {string} flagEditor - Editor specified via CLI flag
 * @returns {string} The editor command to use
 */
export const getEditor = (flagEditor) => {
  // If explicitly set via flag, use that
  if (flagEditor) {
    return flagEditor;
  }

  // Check environment variables
  if (process.env.VISUAL) {
    return process.env.VISUAL;
  }

  if (process.env.EDITOR) {
    return process.env.EDITOR;
  }

  // Platform-specific defaults
  const currentPlatform = platform();

  switch (currentPlatform) {
    case 'win32':
      return 'notepad';
    case 'darwin':
      return 'open -e'; // TextEdit on macOS
    default:
      return 'vi'; // Unix/Linux default
  }
};

/**
 * Gets the appropriate shell for the current platform
 * @returns {string} The shell command to use
 */
export const getShell = () => {
  const currentPlatform = platform();

  if (currentPlatform === 'win32') {
    // Check if Git Bash is available, otherwise use cmd
    if (process.env.SHELL && process.env.SHELL.includes('bash')) {
      return 'bash';
    }
    return 'bash'; // Assume Git Bash is installed (prerequisite)
  }

  return 'bash'; // Unix/Linux/macOS
};
