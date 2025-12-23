<?php
require_once __DIR__ . '/../interfaces/DatabaseInterface.php';

class MySQLDatabase implements DatabaseInterface
{
  private $host = 'localhost';
  private $db_name = 'ecommerce';
  private $username = 'root';
  private $password = '';
  private $conn;

  public function getConnection()
  {
    $this->conn = null;

    try {
      $this->conn = new mysqli(
        $this->host,
        $this->username,
        $this->password,
        $this->db_name
      );

      if ($this->conn->connect_error) {
        throw new Exception("Connection failed: " . $this->conn->connect_error);
      }

      // always set UTF-8 for safety
      $this->conn->set_charset('utf8mb4');
    } catch (Exception $e) {
      // return clean JSON instead of HTML
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode([
        'error' => 'Database connection failed',
        'details' => $e->getMessage()
      ]);
      exit;
    }

    return $this->conn;
  }
}
