-- V26: Seed reviews for all places in the database
INSERT INTO ratings (id, place_id, user_id, rating_point, review_content, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  '00248698-1df8-455e-95c7-ff4ae6a856d0'::UUID,
  (3.0 + (random() * 2.0))::numeric(2,1),
  CASE (abs(hashtext(p.id::text)) % 5)
    WHEN 0 THEN 'Địa điểm rất tuyệt vời, không gian thoáng đãng và dịch vụ rất tốt!'
    WHEN 1 THEN 'Trải nghiệm thú vị, đồ ăn thức uống ngon miệng và giá cả hợp lý.'
    WHEN 2 THEN 'Điểm đến lý tưởng cho gia đình và bạn bè vào dịp cuối tuần.'
    WHEN 3 THEN 'Không gian trang trí đẹp mắt, nhân viên nhiệt tình, phục vụ nhanh nhẹn.'
    ELSE 'Địa điểm đẹp, chất lượng phục vụ tốt, tôi sẽ quay lại lần sau.'
  END,
  'APPROVED',
  NOW() - (random() * INTERVAL '10 days'),
  NOW() - (random() * INTERVAL '10 days')
FROM places p
ON CONFLICT (user_id, place_id) DO NOTHING;
