/*
=============================================
BCDE224 - PHP
Assignment 2 Sem 2 2025

Author:			Trek Ellwood
Date:			20.09.2025
Modified:		<>
Description:	ecommerce trigger
=============================================
*/

DELIMITER //

-- DROP TRIGGER IF EXISTS carts_one_open_before_insert;
CREATE TRIGGER carts_one_open_before_insert
BEFORE INSERT ON carts
FOR EACH ROW
BEGIN
  IF NEW.status = 'open' THEN
    IF EXISTS (SELECT 1 FROM carts WHERE buyer_id = NEW.buyer_id AND status = 'open') THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Buyer already has an open cart';
    END IF;
  END IF;
END//

-- DROP TRIGGER IF EXISTS carts_one_open_before_update;
CREATE TRIGGER carts_one_open_before_update
BEFORE UPDATE ON carts
FOR EACH ROW
BEGIN
  IF NEW.status = 'open' AND OLD.status <> 'open' THEN
    IF EXISTS (SELECT 1 FROM carts WHERE buyer_id = NEW.buyer_id AND status = 'open' AND cart_id <> OLD.cart_id) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Buyer already has an open cart';
    END IF;
  END IF;
END//

DELIMITER ;
