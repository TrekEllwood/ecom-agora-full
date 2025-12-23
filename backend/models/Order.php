<?php
class Order
{
  private mysqli $db;

  public function __construct(mysqli $db)
  {
    $this->db = $db;
  }

  /**
   * Checkout and create an order from a given cart.
   */
  public function checkoutFromCart(int $cartId, int $buyerId, ?int $addressId): int
  {
    $this->db->begin_transaction();

    try {
      // --- Calculate total ---
      $sumStmt = $this->db->prepare("SELECT SUM(qty * price_cents_snapshot) AS total FROM cart_items WHERE cart_id = ?");
      if (!$sumStmt) throw new Exception("Prepare failed: " . $this->db->error);
      $sumStmt->bind_param('i', $cartId);
      $sumStmt->execute();
      $result = $sumStmt->get_result();
      $row = $result->fetch_assoc();
      $total = (int)($row['total'] ?? 0);

      // --- Create order ---
      $stmt = $this->db->prepare("INSERT INTO orders (buyer_id, cart_id, address_id, status, total_cents) VALUES (?, ?, ?, 'created', ?)");
      if (!$stmt) throw new Exception("Prepare failed: " . $this->db->error);
      $stmt->bind_param('iiii', $buyerId, $cartId, $addressId, $total);
      $stmt->execute();
      $orderId = $this->db->insert_id;

      // --- Copy cart items into order_items ---
      $itemsStmt = $this->db->prepare("SELECT product_id, qty, price_cents_snapshot FROM cart_items WHERE cart_id = ?");
      if (!$itemsStmt) throw new Exception("Prepare failed: " . $this->db->error);
      $itemsStmt->bind_param('i', $cartId);
      $itemsStmt->execute();
      $result = $itemsStmt->get_result();

      $ins = $this->db->prepare("INSERT INTO order_items (order_id, product_id, qty, price_cents) VALUES (?, ?, ?, ?)");
      if (!$ins) throw new Exception("Prepare failed: " . $this->db->error);

      $upd = $this->db->prepare("UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?");
      if (!$upd) throw new Exception("Prepare failed: " . $this->db->error);

      while ($row = $result->fetch_assoc()) {
        $pid = $row['product_id'];
        $qty = $row['qty'];
        $price = $row['price_cents_snapshot'];

        $ins->bind_param('iiii', $orderId, $pid, $qty, $price);
        $ins->execute();

        $upd->bind_param('iii', $qty, $pid, $qty);
        $upd->execute();
      }

      // --- Close cart ---
      $close = $this->db->prepare("UPDATE carts SET status = 'converted' WHERE cart_id = ?");
      if (!$close) throw new Exception("Prepare failed: " . $this->db->error);
      $close->bind_param('i', $cartId);
      $close->execute();

      // --- Commit ---
      $this->db->commit();
      return $orderId;
    } catch (Throwable $t) {
      $this->db->rollback();
      throw $t;
    }
  }
}
