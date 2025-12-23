<?php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../config/MySQLDatabase.php';
require_once __DIR__ . '/../models/Order.php';

// --- DB connection (MySQLi) ---
$db = (new MySQLDatabase())->getConnection();
$order = new Order($db);

$method = $_SERVER['REQUEST_METHOD'];

// --- CHECKOUT ---
if ($method === 'POST' && ($_GET['action'] ?? '') === 'checkout') {
  require_login();

  $body = json_decode(file_get_contents('php://input'), true);
  $addressId = $body['address_id'] ?? null;

  $uid = current_user_id();

  // --- Find open cart for this user ---
  $stmt = $db->prepare("SELECT cart_id FROM carts WHERE buyer_id = ? AND status = 'open' ORDER BY cart_id DESC LIMIT 1");
  if (!$stmt) json_error("DB prepare failed: " . $db->error, 500);

  $stmt->bind_param('i', $uid);
  $stmt->execute();
  $result = $stmt->get_result();
  $row = $result->fetch_assoc();

  $cartId = (int)($row['cart_id'] ?? 0);
  if (!$cartId) json_error('No open cart', 400);

  // --- Process checkout ---
  try {
    $orderId = $order->checkoutFromCart($cartId, $uid, $addressId ? (int)$addressId : null);
    json_ok(['order_id' => $orderId], 201);
  } catch (Throwable $t) {
    json_error('Checkout failed', 400, ['detail' => $t->getMessage()]);
  }
}

// --- DEFAULT ---
json_error('Method not allowed', 405);
