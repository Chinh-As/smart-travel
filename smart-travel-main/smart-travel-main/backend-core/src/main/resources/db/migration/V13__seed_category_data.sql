-- Seed default travel categories
INSERT INTO categories (name, display_name) VALUES
('SIGHTSEEING', 'Cảnh quan'),
('HISTORY_CULTURE', 'Lịch sử - Văn hóa'),
('BEACH_RESORT', 'Nghỉ dưỡng biển'),
('CULINARY', 'Ẩm thực'),
('ENTERTAINMENT', 'Giải trí'),
('SHOPPING', 'Mua sắm'),
('NATURE', 'Thiên nhiên'),
('SPIRITUAL', 'Tâm linh')
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name;
