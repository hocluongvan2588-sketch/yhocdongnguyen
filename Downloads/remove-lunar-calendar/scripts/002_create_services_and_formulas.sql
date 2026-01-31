-- =====================================================
-- SERVICE PACKAGES TABLE
-- =====================================================

-- Create enum for service types
DO $$ BEGIN
  CREATE TYPE service_type AS ENUM ('basic', 'tuong_so', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create service_packages table
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  service_type service_type NOT NULL,
  price DECIMAL(12, 0) NOT NULL DEFAULT 0,
  original_price DECIMAL(12, 0), -- For showing discount
  currency TEXT DEFAULT 'VND',
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature strings
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active packages
CREATE POLICY "service_packages_select_public" ON public.service_packages 
  FOR SELECT USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "service_packages_admin_all" ON public.service_packages 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_service_packages_updated ON public.service_packages;
CREATE TRIGGER on_service_packages_updated
  BEFORE UPDATE ON public.service_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FORMULA TEMPLATES TABLE (Tượng Số Bát Quái)
-- =====================================================

-- Create enum for elements (Ngũ Hành)
DO $$ BEGIN
  CREATE TYPE element_type AS ENUM ('Kim', 'Moc', 'Thuy', 'Hoa', 'Tho');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create formula_templates table
CREATE TABLE IF NOT EXISTS public.formula_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gua_id INTEGER NOT NULL CHECK (gua_id BETWEEN 1 AND 8),
  gua_name TEXT NOT NULL,
  element element_type NOT NULL,
  primary_organ TEXT NOT NULL,
  secondary_organ TEXT,
  formula_string TEXT NOT NULL,
  element_relation TEXT, -- e.g., 'Thuy-Moc', 'Kim-Thuy'
  explanation TEXT,
  treatment_guidance TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.formula_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view active formulas
CREATE POLICY "formula_templates_select_auth" ON public.formula_templates 
  FOR SELECT TO authenticated USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "formula_templates_admin_all" ON public.formula_templates 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_formula_templates_updated ON public.formula_templates;
CREATE TRIGGER on_formula_templates_updated
  BEFORE UPDATE ON public.formula_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- INSERT DEFAULT SERVICE PACKAGES
-- =====================================================

INSERT INTO public.service_packages (name, slug, description, service_type, price, original_price, features, is_active, is_featured, sort_order)
VALUES 
  (
    'Gói Cơ bản',
    'basic',
    'Phân tích Mai Hoa cơ bản với AI',
    'basic',
    0,
    NULL,
    '["Gieo quẻ tự động theo thời gian", "Phân tích cơ bản bằng AI", "Giải thích ý nghĩa các quẻ", "Lưu lịch sử 7 ngày gần nhất"]'::jsonb,
    true,
    false,
    1
  ),
  (
    'Liệu pháp Tượng Số Bát Quái',
    'tuong-so-bat-quai',
    'Liệu pháp số học kết hợp Bát Quái và Ngũ Hành để cân bằng năng lượng cơ thể',
    'tuong_so',
    299000,
    399000,
    '["Tất cả tính năng gói Cơ bản", "Công thức Tượng Số cá nhân hóa", "Phân tích Ngũ Hành chi tiết", "Ánh xạ Bát Quái - Cơ quan", "Hướng dẫn điều hòa Âm Dương", "Lưu trữ không giới hạn", "Hỗ trợ qua email"]'::jsonb,
    true,
    true,
    2
  ),
  (
    'Gói Chuyên sâu',
    'premium',
    'Tư vấn chuyên sâu với chuyên gia Mai Hoa',
    'premium',
    599000,
    799000,
    '["Tất cả tính năng Tượng Số Bát Quái", "Tư vấn 1-1 với chuyên gia", "Phân tích đa quẻ phức hợp", "Báo cáo PDF chi tiết", "Theo dõi tiến trình điều trị", "Hỗ trợ ưu tiên 24/7"]'::jsonb,
    true,
    false,
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- INSERT DEFAULT FORMULA TEMPLATES (8 Quẻ Bát Quái)
-- =====================================================

INSERT INTO public.formula_templates (gua_id, gua_name, element, primary_organ, secondary_organ, formula_string, element_relation, explanation, treatment_guidance)
VALUES
  (1, 'Càn', 'Kim', 'Đại tràng', 'Đầu', '10.60', 'Kim-Thuy', 
   'Quẻ Càn thuộc Kim, chủ về Đại tràng và vùng Đầu. Số 1 đại diện cho Càn, số 6 cho Khảm (Thủy) tạo quan hệ Kim sinh Thủy.',
   'Sử dụng chuỗi số 10.60 để điều hòa. Số 0 ở giữa giúp cân bằng âm dương giữa Kim và Thủy.'),
  
  (2, 'Đoài', 'Kim', 'Phế', 'Miệng', '20.60', 'Kim-Thuy',
   'Quẻ Đoài thuộc Kim, chủ về Phế (Phổi) và Miệng. Số 2 đại diện cho Đoài, kết hợp với Thủy để sinh dưỡng.',
   'Chuỗi 20.60 hỗ trợ hệ hô hấp, điều hòa khí phế. Thích hợp cho các vấn đề về phổi, da, mũi họng.'),
  
  (3, 'Ly', 'Hoa', 'Tâm', 'Mắt', '30.820', 'Hoa-Tho',
   'Quẻ Ly thuộc Hỏa, chủ về Tâm (Tim) và Mắt. Hỏa sinh Thổ, nên kết hợp với số 8 (Khôn-Thổ).',
   'Chuỗi 30.820 giúp điều hòa tâm hỏa, tốt cho tim mạch, huyết áp, thị lực. Số 0 đôi tạo dương khí.'),
  
  (4, 'Chấn', 'Moc', 'Can', 'Chân', '40.30', 'Moc-Hoa',
   'Quẻ Chấn thuộc Mộc, chủ về Can (Gan) và Chân. Mộc sinh Hỏa, kết hợp với số 3 (Ly).',
   'Chuỗi 40.30 hỗ trợ chức năng gan, gân cơ, khớp chân. Điều hòa can khí uất kết.'),
  
  (5, 'Tốn', 'Moc', 'Đởm', 'Đùi', '50.30', 'Moc-Hoa',
   'Quẻ Tốn thuộc Mộc, chủ về Đởm (Mật) và Đùi. Tương tự Chấn, Mộc sinh Hỏa.',
   'Chuỗi 50.30 hỗ trợ túi mật, tiêu hóa chất béo, vùng đùi háng. Giải tỏa can đởm thấp nhiệt.'),
  
  (6, 'Khảm', 'Thuy', 'Thận', 'Tai', '60.40', 'Thuy-Moc',
   'Quẻ Khảm thuộc Thủy, chủ về Thận và Tai. Thủy sinh Mộc, kết hợp với số 4 (Chấn).',
   'Chuỗi 60.40 bổ thận, tăng cường chức năng thính giác, xương khớp. Điều hòa thận thủy.'),
  
  (7, 'Cấn', 'Tho', 'Vị', 'Tay', '70.20', 'Tho-Kim',
   'Quẻ Cấn thuộc Thổ, chủ về Vị (Dạ dày) và Tay. Thổ sinh Kim, kết hợp với số 2 (Đoài).',
   'Chuỗi 70.20 hỗ trợ tiêu hóa, dạ dày, cánh tay. Kiện tỳ hòa vị, tăng cường hấp thu.'),
  
  (8, 'Khôn', 'Tho', 'Tỳ', 'Bụng', '80.20', 'Tho-Kim',
   'Quẻ Khôn thuộc Thổ, chủ về Tỳ (Lách) và Bụng. Thổ sinh Kim, âm thổ nhu hòa.',
   'Chuỗi 80.20 bổ tỳ, điều hòa tiêu hóa, vùng bụng. Tốt cho người tỳ hư, chán ăn, mệt mỏi.')
ON CONFLICT DO NOTHING;
