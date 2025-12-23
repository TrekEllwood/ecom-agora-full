<?php
// Simple health check endpoint
header('Content-Type: application/json');
echo json_encode([
  'status' => 'ok',
  'service' => 'ecom-api',
  'time' => date('c'),
]);
