/*
=============================================
BCDE224 - PHP
Assignment 2 Sem 2 2025

Author:			Trek Ellwood
Date:			20.09.2025
Modified:		11.11.2025
Description:	create ecommerce database
=============================================
*/

-- DROP DATABASE ecommerce;
CREATE DATABASE IF NOT EXISTS ecommerce
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

/*
0900 = unicode 9.0 (MySQL 8.0.0)
ai = accent insensitive
ci = case insensitive
*/

USE ecommerce;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(64)  NOT NULL,
  email         VARCHAR(255) NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  first_name 	VARCHAR(100) NULL,
  last_name  	VARCHAR(100) NULL,
  phone      	VARCHAR(50)  NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  role_code VARCHAR(16) NOT NULL,
  PRIMARY KEY (role_code)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS user_roles;
CREATE TABLE user_roles (
  user_id   INT UNSIGNED NOT NULL,
  role_code VARCHAR(16)  NOT NULL,
  PRIMARY KEY (user_id, role_code),
  CONSTRAINT fk_ur_user  FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
  CONSTRAINT fk_ur_role  FOREIGN KEY (role_code) REFERENCES roles(role_code) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
  
DROP TABLE IF EXISTS addresses;
CREATE TABLE addresses (
  address_id  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  label       VARCHAR(32)  NOT NULL,
  line1       VARCHAR(255) NOT NULL,
  line2       VARCHAR(255) NULL,
  city        VARCHAR(120) NOT NULL,
  region      VARCHAR(120) NULL,
  postal_code VARCHAR(32)  NULL,
  country     VARCHAR(2)   NOT NULL DEFAULT 'NZ',
  is_default  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (address_id),
  KEY idx_addresses_user (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
  
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  category_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(64)  NOT NULL,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
  
  DROP TABLE IF EXISTS products;
  CREATE TABLE products (
  product_id  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku         VARCHAR(64)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  price_cents INT UNSIGNED NOT NULL,
  seller_id   INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  description TEXT NULL,
  stock       INT UNSIGNED NOT NULL DEFAULT 0,
  status      ENUM('active','archived','pending') NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  UNIQUE KEY uq_products_sku (sku),
  KEY idx_products_seller   (seller_id),
  KEY idx_products_category (category_id),
  KEY idx_products_status   (status),
  CONSTRAINT fk_products_seller   FOREIGN KEY (seller_id)   REFERENCES users(user_id)      ON DELETE RESTRICT,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS product_images;
CREATE TABLE product_images (
  image_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED NOT NULL,
  url         TEXT NOT NULL,          -- store S3/HTTP URL (or Data URL for mocks)
  sort_order  INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (image_id),
  UNIQUE KEY uq_product_images_main (product_id, sort_order),
  KEY idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS carts;
CREATE TABLE carts (
  cart_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  buyer_id   INT UNSIGNED NOT NULL,
  status     ENUM('open','converted','abandoned') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_id),
  KEY idx_carts_buyer (buyer_id),
  CONSTRAINT fk_carts_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS cart_items;
CREATE TABLE cart_items (
  cart_id     INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  qty         INT UNSIGNED NOT NULL,
  price_cents_snapshot INT UNSIGNED NOT NULL,
  PRIMARY KEY (cart_id, product_id),
  KEY idx_cart_items_product (product_id),
  CONSTRAINT fk_ci_cart    FOREIGN KEY (cart_id)    REFERENCES carts(cart_id)       ON DELETE CASCADE,
  CONSTRAINT fk_ci_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  order_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  buyer_id     INT UNSIGNED NOT NULL,
  cart_id      INT UNSIGNED NULL,
  address_id   INT UNSIGNED NULL,
  status       ENUM('created','paid','shipped','cancelled') NOT NULL DEFAULT 'created',
  total_cents  INT UNSIGNED NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  UNIQUE KEY uq_orders_cart (cart_id),
  KEY idx_orders_buyer (buyer_id),
  CONSTRAINT fk_orders_buyer   FOREIGN KEY (buyer_id)   REFERENCES users(user_id)       ON DELETE RESTRICT,
  CONSTRAINT fk_orders_cart    FOREIGN KEY (cart_id)    REFERENCES carts(cart_id)       ON DELETE SET NULL,
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  order_id    INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  qty         INT UNSIGNED NOT NULL,
  price_cents INT UNSIGNED NOT NULL,
  PRIMARY KEY (order_id, product_id),
  KEY idx_oi_product (product_id),
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)   REFERENCES orders(order_id)   ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
