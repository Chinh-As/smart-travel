-- Seed sample ratings into the Supabase database
-- Ensure mock users exist before seeding ratings to avoid foreign key violations
INSERT INTO users (id, email, name, is_active, created_at, updated_at)
VALUES 
  ('00248698-1df8-455e-95c7-ff4ae6a856d0', 'mock.user@smarttravel.com', 'Mock User', true, now(), now()),
  ('5e7e5c78-f6a7-417c-9901-5ed0b6a51701', 'mock.admin@smarttravel.com', 'Mock Admin', true, now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO ratings (id, place_id, user_id, rating_point, review_content, status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'bc5bfbe8-3080-4a0e-9669-2c7e7605e897', '00248698-1df8-455e-95c7-ff4ae6a856d0', 5.0, 'Hidden Gem Coffee rất đẹp, đồ uống ngon và không gian mang đậm nét hoài cổ cực kỳ ấn tượng!', 'APPROVED', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), '596a087e-4be2-446b-8bcc-5331dba936df', '00248698-1df8-455e-95c7-ff4ae6a856d0', 4.0, 'Xofa Café & Bistro ấm cúng, thích hợp để học tập và làm việc. Đồ ăn nhẹ khá ngon.', 'PENDING', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
  (gen_random_uuid(), '7e652d8a-2d8a-48cb-9b84-eaaa57799014', '00248698-1df8-455e-95c7-ff4ae6a856d0', 4.5, 'Không gian Hanoi Coffee Culture thoáng mát, nhạc nhẹ dễ chịu, phục vụ chu đáo.', 'APPROVED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (user_id, place_id) DO NOTHING;

