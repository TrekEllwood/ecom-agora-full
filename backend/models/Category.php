<?php
class Category
{
  private mysqli $db;

  public function __construct(mysqli $db)
  {
    $this->db = $db;
  }

  /**
   * Get all categories ordered by name
   */
  public function all(): array
  {
    $sql = "SELECT category_id, name FROM categories ORDER BY name";
    $result = $this->db->query($sql);
    if (!$result) {
      throw new Exception("Query failed: " . $this->db->error);
    }

    $rows = [];
    while ($row = $result->fetch_assoc()) {
      $rows[] = $row;
    }
    return $rows;
  }

  /**
   * Get single category by ID
   */
  public function getById(int $id): ?array
  {
    $stmt = $this->db->prepare("SELECT category_id, name FROM categories WHERE category_id = ?");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    return $row ?: null;
  }

  /**
   * Add a new category (admin only in real app)
   */
  public function create(string $name): int
  {
    $stmt = $this->db->prepare("INSERT INTO categories (name) VALUES (?)");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
    $stmt->bind_param('s', $name);
    $stmt->execute();
    return $this->db->insert_id;
  }
}
