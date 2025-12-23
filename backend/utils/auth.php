<?php
// --- Secure session setup (OWASP) ---
ini_set('session.use_strict_mode', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid', 0);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);      // requires HTTPS
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.gc_maxlifetime', 1800);  // 30 minutes inactivity

// Start the secure session once
if (session_status() !== PHP_SESSION_ACTIVE) {
  session_start();
}

/**
 * Require that the user is logged in.
 * Responds with 401 if no valid session exists.
 */
function require_login(): void
{
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
  }
  if (empty($_SESSION['user_id'])) {
    json_error('Unauthorized', 401);
  }
}

/**
 * Get the current logged-in user ID, or null if not authenticated.
 */
function current_user_id(): ?int
{
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
  }
  return $_SESSION['user_id'] ?? null;
}
