<?php
class User
{
  private mysqli $db;

  public function __construct(mysqli $db)
  {
    $this->db = $db;
  }

  /**
   * Create a new user with full details and assign roles.
   */
  public function create(string $username, string $email, string $password, array $roles = ['buyer'], ?array $extra = null): int
  {
    $this->db->begin_transaction();

    try {
      // --- Extract optional data ---
      $firstName = $extra['firstName'] ?? null;
      $lastName  = $extra['lastName'] ?? null;
      $phone     = $extra['phone'] ?? null;
      $street    = $extra['street'] ?? null;
      $city      = $extra['city'] ?? null;
      $postal    = $extra['postal'] ?? null;
      $country   = $extra['country'] ?? 'NZ';

      // --- Insert user ---
      $stmt = $this->db->prepare("
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      ");
      if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);

      $hash = password_hash($password, PASSWORD_DEFAULT);
      $stmt->bind_param('ssssss', $username, $email, $hash, $firstName, $lastName, $phone);
      $stmt->execute();
      $uid = $this->db->insert_id;

      // --- Add default address if provided ---
      if ($street && $city) {
        try {
          $addr = $this->db->prepare("
      INSERT INTO addresses (user_id, label, line1, city, postal_code, country, is_default)
      VALUES (?, 'Home', ?, ?, ?, ?, 1)
    ");
          if ($addr) {
            $addr->bind_param('issss', $uid, $street, $city, $postal, $country);
            $addr->execute();
          }
        } catch (Throwable $e) {
          // just log instead of failing the transaction
          error_log('Address insert skipped: ' . $e->getMessage());
        }
      }

      // --- Ensure roles exist + assign ---
      $roleInsert = $this->db->prepare("INSERT IGNORE INTO roles (role_code) VALUES (?)");
      $userRoleInsert = $this->db->prepare("INSERT INTO user_roles (user_id, role_code) VALUES (?, ?)");

      if (!$roleInsert || !$userRoleInsert)
        throw new Exception("Role prepare failed: " . $this->db->error);

      foreach ($roles as $role) {
        $roleInsert->bind_param('s', $role);
        $roleInsert->execute();

        $userRoleInsert->bind_param('is', $uid, $role);
        $userRoleInsert->execute();
      }

      $this->db->commit();
      return $uid;
    } catch (Throwable $t) {
      $this->db->rollback();
      throw $t;
    }
  }

  /**
   * Find user by username.
   */
  public function findByUsername(string $username): ?array
  {
    $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);

    $stmt->bind_param('s', $username);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    return $row ?: null;
  }

  /**
   * Get all roles for a given user.
   */
  public function rolesOf(int $userId): array
  {
    $stmt = $this->db->prepare("SELECT role_code FROM user_roles WHERE user_id = ?");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    $result = $stmt->get_result();
    $roles = [];
    while ($row = $result->fetch_assoc()) {
      $roles[] = $row['role_code'];
    }
    return $roles;
  }

  public function findById(int $id): ?array
  {
    $stmt = $this->db->prepare("SELECT * FROM users WHERE user_id = ? LIMIT 1");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    return $row ?: null;
  }
}
