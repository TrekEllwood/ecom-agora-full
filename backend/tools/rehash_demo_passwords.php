<?php
// DEV ONLY — Run once in browser or CLI to convert mock plaintext passwords to bcrypt hashes
// Usage (CLI): php tools/hash_passwords.php
// Usage (browser): http://localhost/ecom-api/tools/hash_passwords.php

require_once __DIR__ . '/../config/MySQLDatabase.php';

$db = (new MySQLDatabase())->getConnection();
if (!$db) {
  http_response_code(500);
  echo "Database connection failed\n";
  exit;
}

$map = [
  'admin'    => 'admin',
  'buyer01'  => 'buyer123',
  'seller01' => 'seller123',
  'both01'   => 'both123',
];

$updated = 0;
$errors = [];

$stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE username = ?");
if (!$stmt) {
  http_response_code(500);
  echo "Prepare failed: " . $db->error . PHP_EOL;
  exit;
}

foreach ($map as $user => $plain) {
  $hash = password_hash($plain, PASSWORD_DEFAULT);

  // bind and execute
  $ok = $stmt->bind_param('ss', $hash, $user) && $stmt->execute();

  if ($ok && $stmt->affected_rows >= 0) {
    $updated++;
    echo "Updated: {$user}\n";
  } else {
    $errors[] = [
      'user' => $user,
      'error' => $db->error ?: 'unknown',
    ];
    echo "Failed: {$user} -> " . ($db->error ?: 'unknown') . "\n";
  }
}

// cleanup
$stmt->close();

echo PHP_EOL . "Done: {$updated} users processed." . PHP_EOL;
if ($errors) {
  echo "Errors:" . PHP_EOL;
  foreach ($errors as $e) {
    echo "{$e['user']}: {$e['error']}" . PHP_EOL;
  }
}

// Important: delete or move this file after running it in a real environment.
