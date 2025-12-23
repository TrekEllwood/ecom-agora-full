/*
=============================================
BCDE224 - PHP
Assignment 2 Sem 2 2025

Author:      Trek Ellwood
Date:        20.09.2025
Modified:    <>
Description: ecommerce views
=============================================
*/

-- View: products with dollars for display
-- DROP VIEW IF EXISTS products_price_display;

CREATE OR REPLACE VIEW products_price_display AS
SELECT 
  products.product_id,
  products.sku,
  products.name,
  categories.name AS category,
  products.stock,
  products.status,
  ROUND(products.price_cents / 100, 2) AS price_dollars
FROM products
JOIN categories ON categories.category_id = products.category_id;

SELECT * FROM products_price_display;
