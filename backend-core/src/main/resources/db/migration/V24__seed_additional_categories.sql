-- Seed new categories added by the user
INSERT INTO categories (name, display_name)
VALUES 
  ('SPORT', 'Thể thao'),
  ('ART_MUSEUM', 'Nghệ thuật - Bảo tàng'),
  ('WILDLIFE', 'Động vật hoang dã'),
  ('FESTIVAL', 'Lễ hội'),
  ('ADVENTURE', 'Mạo hiểm'),
  ('FAMILY_FRIENDLY', 'Gia đình'),
  ('ROMANTIC', 'Lãng mạn'),
  ('LUXURY', 'Sang trọng'),
  ('BUDGET', 'Tiết kiệm'),
  ('ECO_TOURISM', 'Du lịch sinh thái'),
  ('VOLUNTEERING', 'Tình nguyện'),
  ('HEALTH', 'Sức khỏe'),
  ('EDUCATION', 'Giáo dục'),
  ('NIGHTLIFE', 'Cuộc sống về đêm'),
  ('WEDDING', 'Đám cưới'),
  ('BUSINESS', 'Công tác')
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name;
