<?php
class Product
{
  private mysqli $db;

  public function __construct(mysqli $db)
  {
    $this->db = $db;
  }

  /**
   * List all active products, optionally filtered by search, category, or seller username.
   */
  public function listActive(
    ?int $limit = null,
    ?int $offset = null,
    ?string $search = null,
    ?int $categoryId = null,
    ?string $sellerUsername = null
  ): array {
    $sql = "SELECT
              p.product_id,
              p.sku,
              p.name,
              p.category,
              p.stock,
              p.status,
              p.price_dollars,
              u.username AS seller,
              (
                SELECT url
                FROM product_images
                WHERE product_id = p.product_id
                ORDER BY sort_order ASC
                LIMIT 1
              ) AS image_url
            FROM products_price_display p
            JOIN products pr ON p.product_id = pr.product_id
            JOIN users u ON pr.seller_id = u.user_id
            WHERE pr.status = 'active'";

    $params = [];
    $types = '';

    if ($search) {
      $sql .= " AND (p.name LIKE ? OR p.sku LIKE ?)";
      $searchLike = "%{$search}%";
      $params[] = $searchLike;
      $params[] = $searchLike;
      $types .= 'ss';
    }

    if ($categoryId) {
      $sql .= " AND pr.category_id = ?";
      $params[] = $categoryId;
      $types .= 'i';
    }

    if ($sellerUsername) {
      $sql .= " AND u.username = ?";
      $params[] = $sellerUsername;
      $types .= 's';
    }

    $sql .= " ORDER BY p.product_id DESC";

    if ($limit !== null) {
      $sql .= " LIMIT ?";
      $params[] = $limit;
      $types .= 'i';
      if ($offset !== null) {
        $sql .= " OFFSET ?";
        $params[] = $offset;
        $types .= 'i';
      }
    }

    $stmt = $this->db->prepare($sql);
    if (!$stmt) {
      throw new Exception("SQL prepare error: " . $this->db->error);
    }

    if (!empty($params)) {
      $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
  }

  /**
   * Get single product with seller name and images.
   */
  public function getById(int $id): ?array
  {
    $sql = "SELECT
              p.product_id,
              p.sku,
              p.name,
              p.category,
              p.stock,
              p.status,
              p.price_dollars,
              pr.price_cents,
              pr.description,
              pr.seller_id,
              u.username AS seller,
              (
                SELECT JSON_ARRAYAGG(url)
                FROM product_images
                WHERE product_id = p.product_id
                ORDER BY sort_order
              ) AS images
            FROM products_price_display p
            JOIN products pr ON p.product_id = pr.product_id
            JOIN users u ON pr.seller_id = u.user_id
            WHERE p.product_id = ?";

    $stmt = $this->db->prepare($sql);
    if (!$stmt) {
      throw new Exception("SQL prepare error: " . $this->db->error);
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc() ?: null;
  }

  /**
   * Create a new product
   */
  public function create(array $data): int
  {
    $this->db->begin_transaction();
    try {
      if (isset($data['imageUrl']) && !isset($data['image_urls'])) {
        $data['image_urls'] = [$data['imageUrl']];
      }

      $sql = "INSERT INTO products
                (sku, name, price_cents, seller_id, category_id, description, stock, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $this->db->prepare($sql);
      if (!$stmt) throw new Exception("SQL prepare error: " . $this->db->error);

      $description = $data['description'] ?? '';
      $stock = $data['stock'] ?? 0;
      $status = $data['status'] ?? 'active';

      $stmt->bind_param(
        'ssiiisis',
        $data['sku'],
        $data['name'],
        $data['price_cents'],
        $data['seller_id'],
        $data['category_id'],
        $description,
        $stock,
        $status
      );
      $stmt->execute();
      $productId = $this->db->insert_id;

      // Save product images if provided
      if (!empty($data['image_urls']) && is_array($data['image_urls'])) {
        $this->saveImages($productId, $data['image_urls']);
      }

      $this->db->commit();
      return $productId;
    } catch (Throwable $t) {
      $this->db->rollback();
      throw $t;
    }
  }

  /**
   * Update product
   */
  public function update(int $productId, array $data): bool
  {
    $this->db->begin_transaction();
    try {
      if (isset($data['imageUrl']) && !isset($data['image_urls'])) {
        $data['image_urls'] = [$data['imageUrl']];
      }

      $sql = "UPDATE products
              SET sku = ?, name = ?, price_cents = ?, category_id = ?, description = ?, stock = ?, status = ?
              WHERE product_id = ?";
      $stmt = $this->db->prepare($sql);
      if (!$stmt) throw new Exception("SQL prepare error: " . $this->db->error);

      $description = $data['description'] ?? '';
      $stock = $data['stock'] ?? 0;
      $status = $data['status'] ?? 'active';

      $stmt->bind_param(
        'ssiiisii',
        $data['sku'],
        $data['name'],
        $data['price_cents'],
        $data['category_id'],
        $description,
        $stock,
        $status,
        $id
      );
      $stmt->execute();

      if (!empty($data['image_urls']) && is_array($data['image_urls'])) {
        $this->saveImages($productId, $data['image_urls'], true);
      }

      $this->db->commit();
      return true;
    } catch (Throwable $t) {
      $this->db->rollback();
      throw $t;
    }
  }

  /**
   * Save image URLs for a product
   * If $replace is true, old images are deleted first
   */
  private function saveImages(int $productId, array $urls, bool $replace = false): void
  {
    if ($replace) {
      $this->db->query("DELETE FROM product_images WHERE product_id = " . (int)$productId);
    }

    $stmt = $this->db->prepare("
      INSERT INTO product_images (product_id, url, sort_order)
      VALUES (?, ?, ?)
    ");
    if (!$stmt) throw new Exception("Image insert prepare failed: " . $this->db->error);

    $order = 1;
    foreach ($urls as $url) {
      $stmt->bind_param('isi', $productId, $url, $order);
      $stmt->execute();
      $order++;
    }
  }

  /**
   * Delete product
   */
  public function delete(int $id): bool
  {
    $stmt = $this->db->prepare("DELETE FROM products WHERE product_id = ?");
    if (!$stmt) throw new Exception("SQL prepare error: " . $this->db->error);
    $stmt->bind_param('i', $id);
    return $stmt->execute();
  }
}
