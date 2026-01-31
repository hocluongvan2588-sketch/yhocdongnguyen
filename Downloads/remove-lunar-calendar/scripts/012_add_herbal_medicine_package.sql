-- =====================================================
-- Script 012: Thêm gói dịch vụ Bài thuốc Đông y
-- =====================================================

-- Thêm gói dịch vụ Bài thuốc Đông y vào bảng service_packages
INSERT INTO public.service_packages (
  name,
  slug,
  description,
  service_type,
  price,
  original_price,
  currency,
  features,
  is_active,
  is_featured,
  sort_order
) VALUES (
  'Bài thuốc Đông y',
  'bai-thuoc-dong-y',
  'Gợi ý bài thuốc Đông y phù hợp dựa trên kết quả phân tích quẻ và tình trạng sức khỏe',
  'premium',
  99000,
  149000,
  'VND',
  '["Phân tích tình trạng sức khỏe theo ngũ hành", "Gợi ý 1-3 bài thuốc phù hợp", "Chi tiết thành phần và liều lượng", "Hướng dẫn cách dùng", "Lưu ý và kiêng kỵ", "Giải thích y lý Đông y"]',
  true,
  false,
  3
)
ON CONFLICT (slug) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
