<?php
class Cart
{
  private mysqli $db;

  public function __construct(mysqli $db)
  {
    $this->db = $db;
  }

  /**
   * Get an existing open cart or create a new one for the buyer.
   */
  public function getOrCreateOpenCart(int $buyerId): int
  {
    // Try to find an open cart
    $stmt = $this->db->prepare("SELECT cart_id FROM carts WHERE buyer_id = ? AND status = 'open' ORDER BY cart_id DESC LIMIT 1");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
    $stmt->bind_param('i', $buyerId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row) {
      return (int)$row['cart_id'];
    }

    // Create a new one
    $stmt = $this->db->prepare("INSERT INTO carts (buyer_id, status) VALUES (?, 'open')");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
    $stmt->bind_param('i', $buyerId);
    $stmt->execute();

    return $this->db->insert_id;
  }

  /**
   * Add or update an item in the cart.
   */
  public function addItem(int $cartId, int $productId, int $qty): void
  {
    // Get product price snapshot
    $stmt = $this->db->prepare("SELECT price_cents FROM products WHERE product_id = ?");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
    $stmt->bind_param('i', $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if (!$row) {
      throw new Exception("Product not found: ID {$productId}");
    }

    $price = (int)$row['price_cents'];

    // Insert or update cart item
    $sql = "INSERT INTO cart_items (cart_id, product_id, qty, price_cents_snapshot)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)";
    $stmt = $this->db->prepare($sql);
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
    $stmt->bind_param('iiii', $cartId, $productId, $qty, $price);
    $stmt->execute();
  }

  /**
   * Retrieve full cart with items.
   */
  public function getCart(int $cartId): array
  {
    // Get cart metadata
    $stmt = $this->db->prepare("SELECT cart_id, buyer_id, status, created_at FROM carts WHERE cart_id = ?");
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
    $stmt->bind_param('i', $cartId);
    $stmt->execute();
    $result = $stmt->get_result();
    $cart = $result->fetch_assoc();

    if (!$cart) {
      throw new Exception("Cart not found: ID {$cartId}");
    }

    // Get cart items
    $sql = "SELECT ci.product_id, ci.qty, ci.price_cents_snapshot, p.sku, p.name
            FROM cart_items ci
            JOIN products p ON p.product_id = ci.product_id
            WHERE ci.cart_id = ?";
    $stmt = $this->db->prepare($sql);
    if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
    $stmt->bind_param('i', $cartId);
    $stmt->execute();
    $result = $stmt->get_result();
    $cart['items'] = $result->fetch_all(MYSQLI_ASSOC);

    return $cart;
  }
}
