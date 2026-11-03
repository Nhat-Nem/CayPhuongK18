-- Cây Phượng K18 - bổ sung cột code bị thiếu trong bảng orders.
-- Trước khi chạy: sao lưu database và xác nhận SHOW COLUMNS FROM `orders` LIKE 'code'; trả về 0 dòng.
-- Chạy từng câu lệnh riêng lẻ trong MySQL Workbench. Không xóa index hoặc khóa ngoại hiện có.

ALTER TABLE `orders` ADD COLUMN `code` VARCHAR(50) NULL;

UPDATE `orders`
SET `code` = CONCAT('ORD-', `id`)
WHERE `code` IS NULL OR `code` = '';

ALTER TABLE `orders` MODIFY COLUMN `code` VARCHAR(50) NOT NULL;

ALTER TABLE `orders` ADD UNIQUE KEY `uq_orders_code` (`code`);
