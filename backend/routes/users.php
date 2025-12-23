<?php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../config/MySQLDatabase.php';
require_once __DIR__ . '/../models/User.php';

// --- Force all PHP errors to be returned as JSON --- // DEBUG
// set_error_handler(function ($errno, $errstr, $errfile, $errline) {
//   http_response_code(500);
//   header('Content-Type: application/json; charset=utf-8');
//   echo json_encode([
//     'error' => "PHP error: $errstr",
//     'file' => basename($errfile),
//     'line' => $errline
//   ]);
//   exit;
// });

// set_exception_handler(function ($ex) {
//   http_response_code(500);
//   header('Content-Type: application/json; charset=utf-8');
//   echo json_encode([
//     'error' => $ex->getMessage(),
//     'trace' => $ex->getTraceAsString()
//   ]);
//   exit;
// });

// --- DB connection (MySQLi) ---
$db = (new MySQLDatabase())->getConnection();
$user = new User($db);
$method = $_SERVER['REQUEST_METHOD'];

// --- Security headers (no caching of authenticated data) ---
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// --- REGISTER ---
if ($method === 'POST' && ($_GET['action'] ?? '') === 'register') {
  $b = json_decode(file_get_contents('php://input'), true);
  foreach (['username', 'email', 'password'] as $f) {
    if (empty($b[$f])) json_error("Missing field: {$f}", 422);
  }

  // --- Basic input validation (OWASP ASVS 2.1) ---
  if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) {
    json_error('Invalid email address', 422);
  }
  if (strlen($b['password']) < 12) {
    json_error('Password too short (minimum 12 characters)', 422);
  }

  $roles = $b['roles'] ?? ['buyer'];

  try {
    $uid = $user->create($b['username'], $b['email'], $b['password'], $roles, $b);

    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    session_regenerate_id(true); // OWASP: new session ID after registration

    $_SESSION['user_id'] = $uid;
    json_ok(['user_id' => $uid, 'roles' => $roles], 201);
  } catch (Throwable $t) {
    json_error('Registration failed', 400, ['detail' => $t->getMessage()]);
  }
}

// --- LOGIN ---
if ($method === 'POST' && ($_GET['action'] ?? '') === 'login') {
  $b = json_decode(file_get_contents('php://input'), true);
  foreach (['username', 'password'] as $f) {
    if (empty($b[$f])) json_error("Missing field: {$f}", 422);
  }

  $row = $user->findByUsername($b['username']);

  // --- Verify password securely ---
  if (!$row || !password_verify($b['password'], $row['password_hash'])) {
    usleep(300000); // 0.3s delay against brute-force
    json_error('Invalid credentials', 401);
  }

  if (session_status() !== PHP_SESSION_ACTIVE) session_start();
  session_regenerate_id(true);  // OWASP: prevent session fixation

  $_SESSION['user_id'] = (int)$row['user_id'];
  $roles = $user->rolesOf((int)$row['user_id']);

  json_ok([
    'user_id'  => (int)$row['user_id'],
    'username' => $row['username'],
    'roles'    => $roles
  ]);
}

// --- LOGOUT ---
if ($method === 'POST' && ($_GET['action'] ?? '') === 'logout') {
  if (session_status() !== PHP_SESSION_ACTIVE) session_start();

  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
      session_name(),
      '',
      time() - 42000,
      $params['path'],
      $params['domain'],
      $params['secure'],
      $params['httponly']
    );
  }

  session_destroy();
  session_regenerate_id(true); // OWASP: rotate session ID even after logout
  json_ok(['ok' => true]);
}

// --- SESSION CHECK ---
if ($method === 'GET' && ($_GET['action'] ?? '') === 'me') {
  require_login();
  $uid = current_user_id();

  $row = $user->findById($uid);
  if (!$row) json_error('User not found', 404);

  $roles = $user->rolesOf($uid);

  json_ok([
    'user_id'  => (int)$row['user_id'],
    'username' => $row['username'],
    'email'    => $row['email'] ?? null,
    'roles'    => $roles,
  ]);
}

// --- LIST ALL USERS (for admin only) ---
if ($method === 'GET' && ($_GET['action'] ?? '') === 'list') {
  require_login();
  $uid = current_user_id();
  $roles = $user->rolesOf($uid);
  if (!in_array('admin', array_map('strtolower', $roles))) {
    json_error('Forbidden: admin only', 403);
  }

  // JOIN query
  $sql = "
    SELECT u.user_id, u.username, u.email, ur.role_code AS role
    FROM users u
    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
    ORDER BY u.username
  ";
  $result = $db->query($sql);
  if (!$result) json_error('Database error: ' . $db->error, 500);

  // --- Group roles per user
  $users = [];
  while ($row = $result->fetch_assoc()) {
    $id = (int)$row['user_id'];
    if (!isset($users[$id])) {
      $users[$id] = [
        'user_id' => $id,
        'username' => $row['username'],
        'email' => $row['email'],
        'roles' => [],
      ];
    }
    if (!empty($row['role'])) {
      $users[$id]['roles'][] = $row['role'];
    }
  }

  // reset indexes
  $users = array_values($users);
  json_ok(['items' => $users]);
}

// --- FALLBACK ---
json_error('Method not allowed', 405);
