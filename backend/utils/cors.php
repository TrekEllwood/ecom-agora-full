<?php
// CORS for local dev (tighten for production)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed = [
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:5173',
  'http://localhost',
];

if (in_array($origin, $allowed)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header('Vary: Origin');
  header('Access-Control-Allow-Credentials: true');
} else {
  header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// --- OWASP security headers ---
header('X-Content-Type-Options: nosniff');              // Prevent MIME-type sniffing
header('X-Frame-Options: DENY');                        // Prevent clickjacking
header('Referrer-Policy: no-referrer');                 // Hide referrer info
header('Permissions-Policy: geolocation=(), camera=(), microphone=()'); // Disable sensitive APIs
header('Cross-Origin-Opener-Policy: same-origin');      // Prevent cross-origin window access
header('Cross-Origin-Resource-Policy: same-origin');    // Limit resource sharing
header('X-XSS-Protection: 1; mode=block');              // Legacy browser XSS filter

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}
