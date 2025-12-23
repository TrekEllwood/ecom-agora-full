<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method not allowed', 405);
}

if (empty($_FILES['file'])) {
  json_error('No file uploaded', 400);
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
  json_error('Upload error: ' . $file['error'], 400);
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($ext, $allowed)) {
  json_error('Invalid file type', 415);
}

$filename = uniqid('img_', true) . '.' . $ext;
$target = $uploadDir . $filename;
if (!move_uploaded_file($file['tmp_name'], $target)) {
  json_error('Failed to move uploaded file', 500);
}

$url = sprintf(
  '%s://%s/ecom-api/uploads/%s',
  isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http',
  $_SERVER['HTTP_HOST'],
  $filename
);

json_ok(['url' => $url]);
