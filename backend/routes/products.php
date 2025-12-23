<?php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/MySQLDatabase.php';
require_once __DIR__ . '/../models/Product.php';

$db = (new MySQLDatabase())->getConnection();
$product = new Product($db);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $row = $product->getById($id);
    if (!$row) json_error('Product not found', 404);
    json_ok($row);
  }

  $limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
  $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : null;
  $search = $_GET['q'] ?? null;
  $catId  = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
  $seller = $_GET['seller'] ?? null;

  $items = $product->listActive($limit, $offset, $search, $catId, $seller);
  json_ok(['items' => $items]);
}

/**
 * CREATE PRODUCT (seller posts a new listing)
 */
if ($method === 'POST') {
  $body = json_decode(file_get_contents('php://input'), true);
  if (!$body) json_error('Invalid JSON body', 400);

  // --- Convert seller username to seller_id ---
  if (isset($body['seller']) && !isset($body['seller_id'])) {
    $stmt = $db->prepare("SELECT user_id FROM users WHERE username = ?");
    $stmt->bind_param('s', $body['seller']);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    if ($res) {
      $body['seller_id'] = (int)$res['user_id'];
    } else {
      json_error('Invalid seller username', 422);
    }
  }

  // --- Convert category name to category_id ---
  if (isset($body['category']) && !isset($body['category_id'])) {
    $stmt = $db->prepare("SELECT category_id FROM categories WHERE name = ?");
    $stmt->bind_param('s', $body['category']);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    if ($res) {
      $body['category_id'] = (int)$res['category_id'];
    } else {
      json_error('Invalid category name', 422);
    }
  }

  // --- Validate required fields ---
  foreach (['sku', 'name', 'price_cents', 'seller_id', 'category_id'] as $f) {
    if (!isset($body[$f])) json_error("Missing field: {$f}", 422);
  }

  // --- Normalize image data ---
  if (isset($body['imageUrl']) && !isset($body['image_urls'])) {
    $body['image_urls'] = [$body['imageUrl']];
  }

  // --- Create ---
  $id = $product->create($body);
  json_ok(['product_id' => $id], 201);
}

/**
 * UPDATE PRODUCT
 */
if ($method === 'PUT') {
  parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);
  if (!isset($qs['id'])) json_error('Missing id', 422);
  $id = (int)$qs['id'];

  $body = json_decode(file_get_contents('php://input'), true);
  if (!$body) json_error('Invalid JSON body', 400);

  // --- Normalize image data ---
  if (isset($body['imageUrl']) && !isset($body['image_urls'])) {
    $body['image_urls'] = [$body['imageUrl']];
  }

  $ok = $product->update($id, $body);
  json_ok(['updated' => $ok]);
}

/**
 * DELETE PRODUCT
 */
if ($method === 'DELETE') {
  parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);
  if (!isset($qs['id'])) json_error('Missing id', 422);
  $ok = $product->delete((int)$qs['id']);
  json_ok(['deleted' => $ok]);
}

json_error('Method not allowed', 405);
