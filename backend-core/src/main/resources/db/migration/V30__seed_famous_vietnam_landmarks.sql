-- V30: Seed famous landmarks in Ho Chi Minh City and Da Nang

-- ==========================================
-- 1. Insert places
-- ==========================================

-- Chợ Bến Thành (HCMC)
INSERT INTO places (id, name, description, address, geom, main_image_url, wheelchair_access, raw_opening_hours)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Chợ Bến Thành',
  'Chợ Bến Thành là một trong những biểu tượng lịch sử và văn hóa nổi tiếng nhất của Thành phố Hồ Chí Minh, nơi du khách có thể mua sắm đặc sản và trải nghiệm ẩm thực đường phố độc đáo.',
  'Chợ Bến Thành, Đường Lê Lợi, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
  ST_SetSRID(ST_Point(106.6980, 10.7725), 4326),
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
  TRUE,
  '06:00 - 22:00'
) ON CONFLICT (id) DO NOTHING;

-- Nhà thờ Đức Bà Sài Gòn (HCMC)
INSERT INTO places (id, name, description, address, geom, main_image_url, wheelchair_access, raw_opening_hours)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Nhà thờ Đức Bà Sài Gòn',
  'Nhà thờ chính tòa Đức Bà Sài Gòn là nhà thờ cổ kính mang phong cách kiến trúc Gothic và Roman tinh tế, xây dựng từ thời Pháp thuộc, nằm ngay trung tâm Quận 1.',
  '01 Công xã Paris, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
  ST_SetSRID(ST_Point(106.6990, 10.7798), 4326),
  'https://images.unsplash.com/photo-1596489370716-e5779c16fc0d?auto=format&fit=crop&w=800&q=80',
  FALSE,
  '08:00 - 17:00'
) ON CONFLICT (id) DO NOTHING;

-- Bưu điện Trung tâm Sài Gòn (HCMC)
INSERT INTO places (id, name, description, address, geom, main_image_url, wheelchair_access, raw_opening_hours)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Bưu điện Trung tâm Sài Gòn',
  'Bưu điện Trung tâm Sài Gòn là một công trình kiến trúc tuyệt đẹp kết hợp giữa phong cách phương Tây và nét Á Đông cổ kính, được thiết kế bởi kiến trúc sư Gustave Eiffel.',
  '02 Công xã Paris, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
  ST_SetSRID(ST_Point(106.7001, 10.7799), 4326),
  'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=800&q=80',
  TRUE,
  '07:30 - 18:00'
) ON CONFLICT (id) DO NOTHING;

-- Dinh Độc Lập (HCMC)
INSERT INTO places (id, name, description, address, geom, main_image_url, wheelchair_access, raw_opening_hours)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Dinh Độc Lập',
  'Dinh Độc Lập (Dinh Thống Nhất) là di tích quốc gia đặc biệt, nơi chứng kiến sự kiện lịch sử giải phóng miền Nam thống nhất đất nước ngày 30 tháng 4 năm 1975.',
  '135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
  ST_SetSRID(ST_Point(106.6953, 10.7770), 4326),
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
  TRUE,
  '08:00 - 16:30'
) ON CONFLICT (id) DO NOTHING;

-- Cầu Rồng Đà Nẵng (Da Nang)
INSERT INTO places (id, name, description, address, geom, main_image_url, wheelchair_access, raw_opening_hours)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Cầu Rồng Đà Nẵng',
  'Cầu Rồng là cây cầu biểu tượng độc đáo của thành phố Đà Nẵng, có khả năng phun lửa và phun nước vào mỗi dịp cuối tuần, thu hút đông đảo du khách trong và ngoài nước.',
  'Cầu Rồng, Phường Phước Ninh, Quận Hải Châu, Đà Nẵng, Việt Nam',
  ST_SetSRID(ST_Point(108.2268, 16.0612), 4326),
  'https://images.unsplash.com/photo-1555529731-118a55684826?auto=format&fit=crop&w=800&q=80',
  TRUE,
  'Mở cửa cả ngày'
) ON CONFLICT (id) DO NOTHING;

-- Bán đảo Sơn Trà (Da Nang)
INSERT INTO places (id, name, description, address, geom, main_image_url, wheelchair_access, raw_opening_hours)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'Bán đảo Sơn Trà',
  'Bán đảo Sơn Trà được mệnh danh là lá phổi xanh của Đà Nẵng, nổi tiếng với hệ sinh thái động thực vật phong phú, chùa Linh Ứng linh thiêng và cảnh quan biển thơ mộng.',
  'Thọ Quang, Sơn Trà, Đà Nẵng, Việt Nam',
  ST_SetSRID(ST_Point(108.2818, 16.1202), 4326),
  'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=800&q=80',
  FALSE,
  'Mở cửa cả ngày'
) ON CONFLICT (id) DO NOTHING;

-- Cầu Vàng (Da Nang)
INSERT INTO places (id, name, description, address, geom, main_image_url, wheelchair_access, raw_opening_hours)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'Cầu Vàng Bà Nà Hills',
  'Cầu Vàng là cây cầu đi bộ nổi tiếng thế giới nằm ở độ cao hơn 1400m trên đỉnh Bà Nà Hills, được nâng đỡ bởi đôi bàn tay khổng lồ rêu phong, mang lại tầm nhìn tuyệt mỹ ra mây trời.',
  'Khu du lịch Bà Nà Hills, Hòa Phú, Hòa Vang, Đà Nẵng, Việt Nam',
  ST_SetSRID(ST_Point(107.9944, 15.9950), 4326),
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  TRUE,
  '08:00 - 17:00'
) ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- 2. Insert place categories
-- ==========================================

-- Chợ Bến Thành: SHOPPING + HISTORY_CULTURE
INSERT INTO place_categories (place_id, category_id)
SELECT '11111111-1111-1111-1111-111111111111', id FROM categories WHERE name IN ('SHOPPING', 'HISTORY_CULTURE')
ON CONFLICT DO NOTHING;

-- Nhà thờ Đức Bà Sài Gòn: SPIRITUAL + HISTORY_CULTURE
INSERT INTO place_categories (place_id, category_id)
SELECT '22222222-2222-2222-2222-222222222222', id FROM categories WHERE name IN ('SPIRITUAL', 'HISTORY_CULTURE')
ON CONFLICT DO NOTHING;

-- Bưu điện Trung tâm Sài Gòn: SIGHTSEEING + HISTORY_CULTURE
INSERT INTO place_categories (place_id, category_id)
SELECT '33333333-3333-3333-3333-333333333333', id FROM categories WHERE name IN ('SIGHTSEEING', 'HISTORY_CULTURE')
ON CONFLICT DO NOTHING;

-- Dinh Độc Lập: SIGHTSEEING + HISTORY_CULTURE
INSERT INTO place_categories (place_id, category_id)
SELECT '44444444-4444-4444-4444-444444444444', id FROM categories WHERE name IN ('SIGHTSEEING', 'HISTORY_CULTURE')
ON CONFLICT DO NOTHING;

-- Cầu Rồng Đà Nẵng: SIGHTSEEING + HISTORY_CULTURE
INSERT INTO place_categories (place_id, category_id)
SELECT '55555555-5555-5555-5555-555555555555', id FROM categories WHERE name IN ('SIGHTSEEING', 'HISTORY_CULTURE')
ON CONFLICT DO NOTHING;

-- Bán đảo Sơn Trà: NATURE + SIGHTSEEING
INSERT INTO place_categories (place_id, category_id)
SELECT '66666666-6666-6666-6666-666666666666', id FROM categories WHERE name IN ('NATURE', 'SIGHTSEEING')
ON CONFLICT DO NOTHING;

-- Cầu Vàng: SIGHTSEEING
INSERT INTO place_categories (place_id, category_id)
SELECT '77777777-7777-7777-7777-777777777777', id FROM categories WHERE name IN ('SIGHTSEEING')
ON CONFLICT DO NOTHING;


-- ==========================================
-- 3. Insert place external stats (for star ratings)
-- ==========================================
INSERT INTO place_external_stats (place_id, source_name, rating, review_count, price_level, raw_match_reason)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'MANUAL', 4.2, 5420, 'low', 'Biểu tượng mua sắm Sài Gòn'),
  ('22222222-2222-2222-2222-222222222222', 'MANUAL', 4.6, 3210, 'free', 'Biểu tượng kiến trúc Gothic Pháp'),
  ('33333333-3333-3333-3333-333333333333', 'MANUAL', 4.5, 4120, 'free', 'Bưu điện cổ đẹp nhất Việt Nam'),
  ('44444444-4444-4444-4444-444444444444', 'MANUAL', 4.4, 2890, 'low', 'Di tích lịch sử Dinh Thống Nhất'),
  ('55555555-5555-5555-5555-555555555555', 'MANUAL', 4.7, 7250, 'free', 'Cầu phun lửa phun nước độc đáo'),
  ('66666666-6666-6666-6666-666666666666', 'MANUAL', 4.8, 1540, 'free', 'Lá phổi xanh Đà Nẵng'),
  ('77777777-7777-7777-7777-777777777777', 'MANUAL', 4.6, 9150, 'medium', 'Cây cầu nâng đỡ bởi bàn tay khổng lồ')
ON CONFLICT (place_id, source_name) DO NOTHING;
