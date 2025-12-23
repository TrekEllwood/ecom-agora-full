<?php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../config/MySQLDatabase.php';
require_once __DIR__ . '/../models/Cart.php';

// connect to DB (MySQLi)
$db = (new MySQLDatabase())->getConnection();
$cartModel = new Cart($db);

$method = $_SERVER['REQUEST_METHOD'];

// --- ADD ITEM ---
if ($method === 'POST' && ($_GET['action'] ?? '') === 'add') {
  require_login();

  $body = json_decode(file_get_contents('php://input'), true);
  foreach (['product_id', 'qty'] as $f) {
    if (empty($body[$f])) json_error("Missing field: {$f}", 422);
  }

  $uid = current_user_id();
  try {
    $cartId = $cartModel->getOrCreateOpenCart($uid);
    $cartModel->addItem($cartId, (int)$body['product_id'], (int)$body['qty']);
    json_ok(['cart_id' => $cartId]);
  } catch (Exception $e) {
    json_error($e->getMessage(), 500);
  }
}

// --- GET CART ---
if ($method === 'GET') {
  require_login();
  $uid = current_user_id();

  // find open cart
  $stmt = $db->prepare("SELECT cart_id FROM carts WHERE buyer_id = ? AND status = 'open' ORDER BY cart_id DESC LIMIT 1");
  if (!$stmt) json_error("DB prepare failed: " . $db->error, 500);
  $stmt->bind_param('i', $uid);
  $stmt->execute();
  $result = $stmt->get_result();
  $row = $result->fetch_assoc();

  $cid = (int)($row['cart_id'] ?? 0);
  if (!$cid) json_ok(['cart' => null]);

  try {
    $cart = $cartModel->getCart($cid);
    json_ok(['cart' => $cart]);
  } catch (Exception $e) {
    json_error($e->getMessage(), 500);
  }
}

// --- METHOD NOT ALLOWED ---
json_error('Method not allowed', 405);
