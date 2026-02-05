/**
 * Development mode utilities.
 * 
 * DEV_BYPASS_AUTH enables bypassing authentication during local development.
 * This uses multiple checks for defense-in-depth:
 * 1. Vite's import.meta.env.DEV flag (set at build time)
 * 2. Hostname check to ensure we're on localhost
 * 
 * This prevents accidental auth bypass if production build is misconfigured.
 */

const isLocalhost = 
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname === '[::1]'
  );

/**
 * Only bypass auth if BOTH conditions are true:
 * 1. Vite DEV mode is enabled (build-time check)
 * 2. Running on localhost (runtime check)
 */
export const DEV_BYPASS_AUTH = import.meta.env.DEV && isLocalhost;

/**
 * Check if we're in development mode (for UI purposes, not auth bypass)
 */
export const IS_DEV_MODE = import.meta.env.DEV;
