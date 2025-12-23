<?php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../config/MySQLDatabase.php';
require_once __DIR__ . '/../models/Profile.php';

// --- DB Connection ---
$db = (new MySQLDatabase())->getConnection();
$profile = new Profile($db);
$method = $_SERVER['REQUEST_METHOD'];
$userId = current_user_id();

// --- AUTH CHECK ---
if (!$userId) {
  json_error('Unauthorized', 401);
}

// --- GET PROFILE ---
if ($method === 'GET') {
  try {
    $data = $profile->get($userId);
    if (!$data) json_error('Profile not found', 404);
    json_ok($data);
  } catch (Throwable $t) {
    json_error('Failed to load profile', 500, ['detail' => $t->getMessage()]);
  }
}

// --- UPDATE PROFILE ---
if ($method === 'PUT' || $method === 'PATCH') {
  $b = json_decode(file_get_contents('php://input'), true);

  foreach (['email', 'first_name', 'last_name', 'phone', 'street', 'city', 'postal', 'country'] as $f) {
    if (!isset($b[$f])) $b[$f] = null;
  }

  try {
    $ok = $profile->update($userId, $b);
    json_ok(['updated' => $ok]);
  } catch (Throwable $t) {
    json_error('Profile update failed', 400, ['detail' => $t->getMessage()]);
  }
}

// --- FALLBACK ---
json_error('Method not allowed', 405);
