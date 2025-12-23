<?php
function json_ok($payload = [], int $code = 200): void
{
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($payload);
  exit;
}


function json_error(string $message, int $code = 400, array $extra = []): void
{
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode(array_merge(['error' => $message], $extra));
  exit;
}
