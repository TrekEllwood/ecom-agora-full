<?php
class Profile
{
  private mysqli $db;

  public function __construct(mysqli $db)
  {
    $this->db = $db;
  }

  /**
   * Get current user's profile
   */
  public function get(int $userId): ?array
  {
    $sql = "
      SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, u.phone,
             a.address_id, a.line1 AS street, a.city, a.postal_code AS postal, a.country
      FROM users u
      LEFT JOIN addresses a ON u.user_id = a.user_id AND a.is_default = 1
      WHERE u.user_id = ?
      LIMIT 1
    ";
    $stmt = $this->db->prepare($sql);
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);

    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();

    return $row ?: null;
  }

  /**
   * Update user's profile and address in one transaction
   */
  public function update(int $userId, array $data): bool
  {
    $this->db->begin_transaction();
    try {
      // --- Update users ---
      $stmt = $this->db->prepare("
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?, phone = ?
        WHERE user_id = ?
      ");
      if (!$stmt) throw new Exception("User update failed: " . $this->db->error);
      $stmt->bind_param(
        'ssssi',
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $data['phone'],
        $userId
      );
      $stmt->execute();

      // --- Ensure default address exists ---
      $check = $this->db->prepare("
        SELECT address_id FROM addresses WHERE user_id = ? AND is_default = 1 LIMIT 1
      ");
      $check->bind_param('i', $userId);
      $check->execute();
      $res = $check->get_result();
      $hasAddress = $res->num_rows > 0;

      if ($hasAddress) {
        $stmt = $this->db->prepare("
          UPDATE addresses
          SET line1 = ?, city = ?, postal_code = ?, country = ?
          WHERE user_id = ? AND is_default = 1
        ");
        $stmt->bind_param(
          'ssssi',
          $data['street'],
          $data['city'],
          $data['postal'],
          $data['country'],
          $userId
        );
        $stmt->execute();
      } else {
        $stmt = $this->db->prepare("
          INSERT INTO addresses (user_id, label, line1, city, postal_code, country, is_default)
          VALUES (?, 'Home', ?, ?, ?, ?, 1)
        ");
        $stmt->bind_param(
          'issss',
          $userId,
          $data['street'],
          $data['city'],
          $data['postal'],
          $data['country']
        );
        $stmt->execute();
      }

      $this->db->commit();
      return true;
    } catch (Throwable $t) {
      $this->db->rollback();
      throw $t;
    }
  }
}
