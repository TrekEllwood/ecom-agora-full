<?php
require_once __DIR__ . '/config/MySQLDatabase.php';
$db = (new MySQLDatabase())->getConnection();
echo json_encode(['ok' => 'Connected successfully']);
