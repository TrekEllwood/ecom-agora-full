<?php
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../config/MySQLDatabase.php';
require_once __DIR__ . '/../models/Category.php';

$db = (new MySQLDatabase())->getConnection();
$categoryModel = new Category($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  try {
    $items = $categoryModel->all();
    json_ok(['items' => $items]);
  } catch (Throwable $t) {
    json_error('Failed to fetch categories', 500, ['detail' => $t->getMessage()]);
  }
}

json_error('Method not allowed', 405);
