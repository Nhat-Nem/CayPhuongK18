USE cayphuong_k18;

-- Chuẩn hóa dữ liệu cũ nếu trước đây frontend từng lưu nhãn tiếng Việt.
UPDATE rooms
SET status = 'AVAILABLE'
WHERE status IN ('Đang hoạt động', 'DANG_HOAT_DONG', 'available');

UPDATE rooms
SET status = 'UNAVAILABLE'
WHERE status IN ('Tạm ngưng', 'TAM_NGUNG', 'unavailable');

-- Giá trị mới từ frontend sẽ luôn là AVAILABLE / UNAVAILABLE.
