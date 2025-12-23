/*
=============================================
BCDE224 - PHP
Assignment 2 Sem 2 2025

Author:      Trek Ellwood
Date:        20.09.2025
Modified:    <>
Description: ecommerce mock data
=============================================
*/

-- Roles
INSERT INTO roles (role_code)
VALUES ('buyer'), ('seller'), ('admin') AS new
ON DUPLICATE KEY UPDATE role_code = new.role_code;

-- Users
INSERT INTO users (username, email, password_hash)
VALUES
  ('admin',    'admin@example.com',    'admin'),
  ('buyer01',  'buyer01@example.com',  'buyer123'),
  ('seller01', 'seller01@example.com', 'seller123'),
  ('both01',   'both01@example.com',   'both123') AS new
ON DUPLICATE KEY UPDATE
  email = new.email;

-- User roles
INSERT IGNORE INTO user_roles (user_id, role_code)
SELECT user_id, 'admin'  FROM users WHERE username='admin';

INSERT IGNORE INTO user_roles (user_id, role_code)
SELECT user_id, 'buyer'  FROM users WHERE username='buyer01';

INSERT IGNORE INTO user_roles (user_id, role_code)
SELECT user_id, 'seller' FROM users WHERE username='seller01';

INSERT IGNORE INTO user_roles (user_id, role_code)
SELECT user_id, 'buyer'  FROM users WHERE username='both01';
INSERT IGNORE INTO user_roles (user_id, role_code)
SELECT user_id, 'seller' FROM users WHERE username='both01';

-- Categories
INSERT INTO categories (name)
VALUES ('Electronics'), ('Clothing'), ('Books'), ('Misc') AS new
ON DUPLICATE KEY UPDATE name = new.name;

-- Products owned by sellers
-- CAM-7000
INSERT INTO products (sku, name, price_cents, seller_id, category_id, description, stock, status)
SELECT * FROM (
  SELECT
    'CAM-7000' AS sku,
    '4K Action Camera' AS name,
    34900 AS price_cents,
    u.user_id AS seller_id,
    c.category_id AS category_id,
    'Rugged 4K/60fps sports camera.' AS description,
    12 AS stock,
    'active' AS status
  FROM users u
  JOIN categories c ON c.name='Electronics'
  WHERE u.username='seller01'
) AS new
ON DUPLICATE KEY UPDATE
  name        = new.name,
  price_cents = new.price_cents,
  stock       = new.stock,
  seller_id   = new.seller_id,
  category_id = new.category_id,
  description = new.description,
  status      = new.status;

-- BK-3000
INSERT INTO products (sku, name, price_cents, seller_id, category_id, description, stock, status)
SELECT * FROM (
  SELECT
    'BK-3000' AS sku,
    'Clean Code (Book)' AS name,
    6900 AS price_cents,
    u.user_id AS seller_id,
    c.category_id AS category_id,
    'Agile craftsmanship handbook.' AS description,
    20 AS stock,
    'active' AS status
  FROM users u
  JOIN categories c ON c.name='Books'
  WHERE u.username='both01'
) AS new
ON DUPLICATE KEY UPDATE
  name        = new.name,
  price_cents = new.price_cents,
  stock       = new.stock,
  seller_id   = new.seller_id,
  category_id = new.category_id,
  description = new.description,
  status      = new.status;

-- HDP-1100
INSERT INTO products (sku, name, price_cents, seller_id, category_id, description, stock, status)
SELECT * FROM (
  SELECT
    'HDP-1100' AS sku,
    'Noise-Cancel Headphones' AS name,
    19900 AS price_cents,
    u.user_id AS seller_id,
    c.category_id AS category_id,
    'Over-ear ANC, 30h battery.' AS description,
    8 AS stock,
    'active' AS status
  FROM users u
  JOIN categories c ON c.name='Electronics'
  WHERE u.username='seller01'
) AS new
ON DUPLICATE KEY UPDATE
  name        = new.name,
  price_cents = new.price_cents,
  stock       = new.stock,
  seller_id   = new.seller_id,
  category_id = new.category_id,
  description = new.description,
  status      = new.status;

-- TSH-500
INSERT INTO products (sku, name, price_cents, seller_id, category_id, description, stock, status)
SELECT * FROM (
  SELECT
    'TSH-500' AS sku,
    'Graphic T-Shirt' AS name,
    2500 AS price_cents,
    u.user_id AS seller_id,
    c.category_id AS category_id,
    '100% cotton tee.' AS description,
    50 AS stock,
    'active' AS status
  FROM users u
  JOIN categories c ON c.name='Clothing'
  WHERE u.username='seller01'
) AS new
ON DUPLICATE KEY UPDATE
  name        = new.name,
  price_cents = new.price_cents,
  stock       = new.stock,
  seller_id   = new.seller_id,
  category_id = new.category_id,
  description = new.description,
  status      = new.status;

-- MUG-101
INSERT INTO products (sku, name, price_cents, seller_id, category_id, description, stock, status)
SELECT * FROM (
  SELECT
    'MUG-101' AS sku,
    'Coffee Mug' AS name,
    1500 AS price_cents,
    u.user_id AS seller_id,
    c.category_id AS category_id,
    'Ceramic mug with logo.' AS description,
    30 AS stock,
    'active' AS status
  FROM users u
  JOIN categories c ON c.name='Misc'
  WHERE u.username='both01'
) AS new
ON DUPLICATE KEY UPDATE
  name        = new.name,
  price_cents = new.price_cents,
  stock       = new.stock,
  seller_id   = new.seller_id,
  category_id = new.category_id,
  description = new.description,
  status      = new.status;

-- Images (use derived table alias so we can reference new.url)
INSERT INTO product_images (product_id, url, sort_order)
SELECT * FROM (
  SELECT p.product_id AS product_id,
         'https://picsum.photos/seed/camera/300/300' AS url,
         1 AS sort_order
  FROM products p WHERE p.sku='CAM-7000'
) AS new
ON DUPLICATE KEY UPDATE url = new.url;

INSERT INTO product_images (product_id, url, sort_order)
SELECT * FROM (
  SELECT p.product_id AS product_id,
         'https://picsum.photos/seed/book/300/300' AS url,
         1 AS sort_order
  FROM products p WHERE p.sku='BK-3000'
) AS new
ON DUPLICATE KEY UPDATE url = new.url;

INSERT INTO product_images (product_id, url, sort_order)
SELECT * FROM (
  SELECT p.product_id AS product_id,
         'https://picsum.photos/seed/headphone/300/300' AS url,
         1 AS sort_order
  FROM products p WHERE p.sku='HDP-1100'
) AS new
ON DUPLICATE KEY UPDATE url = new.url;

INSERT INTO product_images (product_id, url, sort_order)
SELECT * FROM (
  SELECT p.product_id AS product_id,
         'https://picsum.photos/seed/t-shirt/300/300' AS url,
         1 AS sort_order
  FROM products p WHERE p.sku='TSH-500'
) AS new
ON DUPLICATE KEY UPDATE url = new.url;

INSERT INTO product_images (product_id, url, sort_order)
SELECT * FROM (
  SELECT p.product_id AS product_id,
         'https://picsum.photos/seed/mug/300/300' AS url,
         1 AS sort_order
  FROM products p WHERE p.sku='MUG-101'
) AS new
ON DUPLICATE KEY UPDATE url = new.url;

-- Order 1
INSERT INTO orders (buyer_id, cart_id, status, total_cents)
SELECT u.user_id, NULL, 'created', 37400
FROM users u WHERE u.username='buyer01';

SET @order1 = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_id, qty, price_cents)
SELECT @order1, p.product_id, 1, p.price_cents
FROM products p WHERE p.sku='CAM-7000';

INSERT INTO order_items (order_id, product_id, qty, price_cents)
SELECT @order1, p.product_id, 1, p.price_cents
FROM products p WHERE p.sku='TSH-500';

-- Order 2
INSERT INTO orders (buyer_id, cart_id, status, total_cents)
SELECT u.user_id, NULL, 'created', 9900
FROM users u WHERE u.username='buyer01';

SET @order2 = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_id, qty, price_cents)
SELECT @order2, p.product_id, 1, p.price_cents
FROM products p WHERE p.sku='BK-3000';

INSERT INTO order_items (order_id, product_id, qty, price_cents)
SELECT @order2, p.product_id, 2, p.price_cents
FROM products p WHERE p.sku='MUG-101';
