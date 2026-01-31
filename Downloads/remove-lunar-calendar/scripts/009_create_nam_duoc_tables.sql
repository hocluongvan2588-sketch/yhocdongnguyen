-- =====================================================
-- NAM DƯỢC THẦN HIỆU - Database Schema
-- Dựa trên tác phẩm của Đại Danh Y Tuệ Tĩnh
-- =====================================================

-- Bảng 10 Khoa theo Nam Dược Thần Hiệu
CREATE TABLE IF NOT EXISTS public.nam_duoc_khoa (
  id SERIAL PRIMARY KEY,
  ten_khoa TEXT NOT NULL,                -- Tên khoa (VD: Nội khoa, Ngoại khoa...)
  ten_han TEXT,                          -- Tên Hán Việt
  mo_ta TEXT,                            -- Mô tả chi tiết
  thu_tu INTEGER NOT NULL,               -- Thứ tự trong sách
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Vị Thuốc Nam (khoảng 580 vị)
CREATE TABLE IF NOT EXISTS public.nam_duoc_vi_thuoc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ten_thuoc TEXT NOT NULL,               -- Tên thường gọi
  ten_khoa_hoc TEXT,                     -- Tên khoa học (Latin)
  ten_khac TEXT[],                       -- Tên gọi khác
  tho_nom TEXT,                          -- Thơ Nôm mô tả (theo lối Đường luật của Tuệ Tĩnh)
  
  -- Phân loại theo Ngũ Hành & Bát Quái
  ngu_hanh TEXT CHECK (ngu_hanh IN ('kim', 'moc', 'thuy', 'hoa', 'tho')),
  gua_tuong_ung INTEGER[],               -- Quẻ Bát Quái tương ứng
  tang_phu TEXT[],                       -- Tạng phủ tác động
  
  -- Tính vị quy kinh
  tinh TEXT CHECK (tinh IN ('han', 'luong', 'on', 'nhiet', 'binh')), -- Hàn, Lương, Ôn, Nhiệt, Bình
  vi TEXT[],                             -- Vị: cay, ngọt, chua, đắng, mặn
  quy_kinh TEXT[],                       -- Quy kinh: Tâm, Can, Tỳ, Phế, Thận...
  
  -- Công dụng
  cong_dung TEXT,                        -- Công dụng chính
  chu_tri TEXT[],                        -- Chủ trị các bệnh
  cach_dung TEXT,                        -- Cách dùng
  lieu_luong TEXT,                       -- Liều lượng
  kieng_ky TEXT[],                       -- Kiêng kỵ
  
  -- Bộ phận dùng & Chế biến
  bo_phan_dung TEXT[],                   -- Rễ, lá, thân, hoa, quả...
  cach_che_bien TEXT,                    -- Cách chế biến
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Bài Thuốc / Phương Thuốc (khoảng 3873 bài)
CREATE TABLE IF NOT EXISTS public.nam_duoc_phuong_thuoc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ten_phuong TEXT NOT NULL,              -- Tên bài thuốc
  ten_han TEXT,                          -- Tên Hán Việt
  xuat_xu TEXT DEFAULT 'Nam Dược Thần Hiệu', -- Xuất xứ
  
  -- Phân loại
  khoa_id INTEGER REFERENCES public.nam_duoc_khoa(id),
  loai_benh TEXT[],                      -- Loại bệnh điều trị
  
  -- Ánh xạ với hệ thống Mai Hoa
  gua_ap_dung INTEGER[],                 -- Quẻ Bát Quái áp dụng
  ngu_hanh_chinh TEXT CHECK (ngu_hanh_chinh IN ('kim', 'moc', 'thuy', 'hoa', 'tho')),
  tang_phu_chinh TEXT[],                 -- Tạng phủ chính tác động
  
  -- Thành phần
  thanh_phan JSONB NOT NULL,             -- [{vi_thuoc_id, ten, lieu_luong, vai_tro: 'quan'|'than'|'ta'|'su'}]
  
  -- Hướng dẫn
  cach_bao_che TEXT,                     -- Cách bào chế
  cach_dung TEXT,                        -- Cách dùng
  lieu_trinh TEXT,                       -- Liệu trình
  
  -- Chỉ định & Chống chỉ định
  chi_dinh TEXT[],                       -- Chỉ định
  chong_chi_dinh TEXT[],                 -- Chống chỉ định
  luu_y TEXT,                            -- Lưu ý khi dùng
  
  -- Phân loại theo mức độ bệnh
  muc_do_benh TEXT[] DEFAULT ARRAY['nhe', 'trung-binh'], -- nhe, trung-binh, nang
  
  -- Phân loại theo đối tượng
  do_tuoi_phu_hop INT4RANGE DEFAULT '[18,100)',
  gioi_tinh TEXT DEFAULT 'all' CHECK (gioi_tinh IN ('all', 'nam', 'nu')),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  do_uu_tien INTEGER DEFAULT 5,          -- 1-10, càng cao càng ưu tiên
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng ánh xạ Quẻ - Bệnh - Phương Thuốc
CREATE TABLE IF NOT EXISTS public.nam_duoc_gua_mapping (
  id SERIAL PRIMARY KEY,
  gua_so INTEGER NOT NULL CHECK (gua_so BETWEEN 1 AND 8),
  gua_ten TEXT NOT NULL,
  tang_phu TEXT[] NOT NULL,              -- Tạng phủ tương ứng
  benh_ly_pho_bien TEXT[],               -- Bệnh lý phổ biến
  phuong_thuoc_ids UUID[],               -- Các phương thuốc phù hợp
  vi_thuoc_uu_tien UUID[],               -- Các vị thuốc ưu tiên
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSERT 10 KHOA THEO NAM DƯỢC THẦN HIỆU
-- =====================================================
INSERT INTO public.nam_duoc_khoa (ten_khoa, ten_han, mo_ta, thu_tu) VALUES
('Nội khoa', '內科', 'Các bệnh nội tạng, phủ tạng bên trong cơ thể', 1),
('Ngoại khoa', '外科', 'Các bệnh ngoài da, mụn nhọt, ung thư ngoài', 2),
('Phụ khoa', '婦科', 'Các bệnh phụ nữ, kinh nguyệt, thai sản', 3),
('Nhi khoa', '兒科', 'Các bệnh trẻ em', 4),
('Nhãn khoa', '眼科', 'Các bệnh về mắt', 5),
('Thương khoa', '傷科', 'Các bệnh do chấn thương, té ngã', 6),
('Châm cứu', '針灸', 'Điều trị bằng châm cứu, huyệt đạo', 7),
('Dưỡng sinh', '養生', 'Phương pháp dưỡng sinh, phòng bệnh', 8),
('Cấp cứu', '急救', 'Các phương pháp cấp cứu, trúng độc', 9),
('Thuốc bổ', '補藥', 'Các bài thuốc bổ dưỡng, tăng cường sức khỏe', 10)
ON CONFLICT DO NOTHING;

-- =====================================================
-- BẢNG ÁNH XẠ QUẺ - TẠNG PHỦ - BỆNH LÝ
-- =====================================================
INSERT INTO public.nam_duoc_gua_mapping (gua_so, gua_ten, tang_phu, benh_ly_pho_bien) VALUES
(1, 'Càn', ARRAY['Đại tràng', 'Đầu', 'Phổi'], 
   ARRAY['Đau đầu', 'Táo bón', 'Ho khan', 'Viêm phổi', 'Huyết áp cao']),
(2, 'Đoài', ARRAY['Phế', 'Miệng', 'Da'], 
   ARRAY['Viêm họng', 'Hen suyễn', 'Mụn nhọt', 'Viêm da', 'Khô da']),
(3, 'Ly', ARRAY['Tâm', 'Mắt', 'Tiểu tràng'], 
   ARRAY['Tim đập nhanh', 'Mất ngủ', 'Đau mắt đỏ', 'Lo âu', 'Cao huyết áp']),
(4, 'Chấn', ARRAY['Can', 'Chân', 'Gân'], 
   ARRAY['Viêm gan', 'Đau chân', 'Co cơ', 'Stress', 'Đau đầu migraine']),
(5, 'Tốn', ARRAY['Đởm', 'Đùi', 'Túi mật'], 
   ARRAY['Sỏi mật', 'Đau hông sườn', 'Tiêu hóa kém', 'Buồn nôn']),
(6, 'Khảm', ARRAY['Thận', 'Tai', 'Xương'], 
   ARRAY['Suy thận', 'Ù tai', 'Đau lưng', 'Tiểu đêm', 'Loãng xương']),
(7, 'Cấn', ARRAY['Vị', 'Tay', 'Cơ'], 
   ARRAY['Đau dạ dày', 'Viêm loét', 'Đau khớp tay', 'Tê bì']),
(8, 'Khôn', ARRAY['Tỳ', 'Bụng', 'Cơ nhục'], 
   ARRAY['Tiêu chảy', 'Chướng bụng', 'Chán ăn', 'Mệt mỏi', 'Phù thũng'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- MỘT SỐ VỊ THUỐC NAM CƠ BẢN (MẪU)
-- =====================================================
INSERT INTO public.nam_duoc_vi_thuoc (
  ten_thuoc, ten_khoa_hoc, ten_khac, tho_nom,
  ngu_hanh, tang_phu, tinh, vi, quy_kinh,
  cong_dung, chu_tri, cach_dung, lieu_luong, kieng_ky, bo_phan_dung
) VALUES
-- Vị thuốc Kim (Phế, Đại tràng)
(
  'Cam thảo', 'Glycyrrhiza uralensis', ARRAY['Cam thảo bắc', 'Quốc lão'],
  'Cam thảo vị ngọt tính bình hòa, Bổ tỳ ích khí giải độc qua, Điều hòa các vị trong bài thuốc, Chữa ho long đờm hiệu nghiệm a.',
  'tho', ARRAY['Tỳ', 'Phế', 'Vị'], 'binh', ARRAY['ngọt'], ARRAY['Tỳ', 'Phế', 'Vị', 'Tâm'],
  'Bổ tỳ ích khí, thanh nhiệt giải độc, chỉ ho hóa đờm, điều hòa các vị thuốc',
  ARRAY['Ho khan', 'Đau họng', 'Mệt mỏi', 'Tiêu hóa kém'],
  'Sắc uống hoặc ngậm', '4-12g/ngày', ARRAY['Không dùng lâu dài', 'Người phù thũng hạn chế'],
  ARRAY['Rễ']
),
(
  'Gừng tươi', 'Zingiber officinale', ARRAY['Sinh khương', 'Khương'],
  'Gừng tươi cay ấm giải biểu hàn, Ôn trung chỉ nôn hiệu năng ngàn, Hóa đờm chỉ ho tiêu thực tốt, Giải độc ngư tôm cũng kê vàng.',
  'kim', ARRAY['Phế', 'Tỳ', 'Vị'], 'on', ARRAY['cay'], ARRAY['Phế', 'Tỳ', 'Vị'],
  'Giải biểu tán hàn, ôn trung chỉ nôn, hóa đờm chỉ ho',
  ARRAY['Cảm lạnh', 'Buồn nôn', 'Ho có đờm', 'Đầy bụng'],
  'Sắc uống, giã đắp, hoặc làm gia vị', '3-10g/ngày', ARRAY['Người âm hư hỏa vượng', 'Ra mồ hôi nhiều'],
  ARRAY['Thân rễ']
),
-- Vị thuốc Mộc (Can, Đởm)
(
  'Nghệ vàng', 'Curcuma longa', ARRAY['Khương hoàng', 'Uất kim'],
  'Nghệ vàng cay đắng tính ôn hòa, Hành khí hoạt huyết chữa đau da, Giải độc tiêu viêm gan mật khỏe, Làm lành vết thương sắc tươi ra.',
  'moc', ARRAY['Can', 'Tỳ'], 'on', ARRAY['cay', 'đắng'], ARRAY['Can', 'Tỳ'],
  'Hành khí hoạt huyết, thông kinh chỉ thống, giải độc tiêu viêm',
  ARRAY['Đau dạ dày', 'Viêm gan', 'Vết thương', 'Đau bụng kinh'],
  'Sắc uống hoặc bôi ngoài', '3-10g/ngày', ARRAY['Người có thai', 'Đang chảy máu'],
  ARRAY['Thân rễ']
),
-- Vị thuốc Thủy (Thận, Bàng quang)
(
  'Rau má', 'Centella asiatica', ARRAY['Tích tuyết thảo', 'Lôi công thảo'],
  'Rau má vị đắng tính hàn mát, Thanh nhiệt giải độc rất là hay, Lợi tiểu tiêu thũng lành vết thương, Làm sáng da mặt đẹp từng ngày.',
  'thuy', ARRAY['Can', 'Thận', 'Tỳ'], 'han', ARRAY['đắng', 'ngọt'], ARRAY['Can', 'Thận', 'Tỳ'],
  'Thanh nhiệt giải độc, lợi tiểu tiêu thũng, sinh tân chỉ khát',
  ARRAY['Mụn nhọt', 'Sốt', 'Tiểu khó', 'Vàng da'],
  'Giã lấy nước uống hoặc sắc uống', '15-30g/ngày tươi', ARRAY['Người tỳ vị hư hàn', 'Tiêu chảy'],
  ARRAY['Toàn cây']
),
-- Vị thuốc Hỏa (Tâm, Tiểu tràng)
(
  'Tâm sen', 'Nelumbo nucifera', ARRAY['Liên tâm', 'Tim sen'],
  'Tâm sen vị đắng tính hàn thanh, Thanh tâm an thần giấc ngủ lành, Trừ phiền chỉ khát lòng thanh tịnh, Hạ hỏa giải nhiệt bệnh tiêu nhanh.',
  'hoa', ARRAY['Tâm', 'Thận'], 'han', ARRAY['đắng'], ARRAY['Tâm', 'Thận'],
  'Thanh tâm an thần, chỉ huyết, liễm tinh',
  ARRAY['Mất ngủ', 'Hồi hộp', 'Sốt cao', 'Khát nước'],
  'Hãm trà hoặc sắc uống', '2-5g/ngày', ARRAY['Người đại tiện lỏng', 'Tỳ vị hư hàn'],
  ARRAY['Tim hạt sen']
),
-- Vị thuốc Thổ (Tỳ, Vị)
(
  'Hoài sơn', 'Dioscorea persimilis', ARRAY['Sơn dược', 'Củ mài'],
  'Hoài sơn ngọt bình bổ tỳ hay, Ích thận cố tinh sức khỏe đầy, Sinh tân chỉ khát lành phế yếu, Tiêu khát thận hư dùng thuốc này.',
  'tho', ARRAY['Tỳ', 'Phế', 'Thận'], 'binh', ARRAY['ngọt'], ARRAY['Tỳ', 'Phế', 'Thận'],
  'Bổ tỳ dưỡng vị, ích phế sinh tân, bổ thận sáp tinh',
  ARRAY['Tiêu chảy', 'Mệt mỏi', 'Tiểu đêm', 'Ra mồ hôi trộm'],
  'Nấu cháo, hầm canh hoặc sắc uống', '10-30g/ngày', ARRAY['Thực tích', 'Thấp nhiệt'],
  ARRAY['Củ']
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- MỘT SỐ BÀI THUỐC NAM CƠ BẢN (MẪU)
-- =====================================================
INSERT INTO public.nam_duoc_phuong_thuoc (
  ten_phuong, ten_han, khoa_id, loai_benh,
  gua_ap_dung, ngu_hanh_chinh, tang_phu_chinh,
  thanh_phan, cach_bao_che, cach_dung, lieu_trinh,
  chi_dinh, chong_chi_dinh, luu_y, muc_do_benh, do_uu_tien
) VALUES
-- Bài 1: Chữa cảm lạnh (Quẻ Càn/Đoài - Kim - Phế)
(
  'Bài thuốc giải cảm', '解感方', 1, ARRAY['Cảm lạnh', 'Sốt', 'Đau đầu'],
  ARRAY[1, 2], 'kim', ARRAY['Phế', 'Đại tràng'],
  '[
    {"ten": "Gừng tươi", "lieu_luong": "8g", "vai_tro": "quan"},
    {"ten": "Hành củ", "lieu_luong": "3 củ", "vai_tro": "than"},
    {"ten": "Tía tô", "lieu_luong": "10g", "vai_tro": "than"},
    {"ten": "Cam thảo", "lieu_luong": "4g", "vai_tro": "su"}
  ]'::jsonb,
  'Rửa sạch các vị thuốc, cho vào nồi',
  'Sắc với 500ml nước còn 200ml, uống nóng khi còn ấm, đắp chăn cho ra mồ hôi',
  '2-3 ngày, mỗi ngày 1 thang',
  ARRAY['Cảm lạnh giai đoạn đầu', 'Sợ lạnh', 'Không ra mồ hôi'],
  ARRAY['Cảm nắng', 'Sốt cao không ra mồ hôi'],
  'Uống nóng, nghỉ ngơi, tránh gió',
  ARRAY['nhe'], 8
),
-- Bài 2: Chữa ho có đờm (Quẻ Càn/Đoài - Kim - Phế)
(
  'Bài thuốc trị ho đờm', '化痰止咳方', 1, ARRAY['Ho', 'Đờm nhiều', 'Viêm họng'],
  ARRAY[1, 2], 'kim', ARRAY['Phế'],
  '[
    {"ten": "Lá húng chanh", "lieu_luong": "15g", "vai_tro": "quan"},
    {"ten": "Gừng tươi", "lieu_luong": "5g", "vai_tro": "than"},
    {"ten": "Mật ong", "lieu_luong": "2 muỗng", "vai_tro": "ta"},
    {"ten": "Quất", "lieu_luong": "2 quả", "vai_tro": "su"}
  ]'::jsonb,
  'Húng chanh rửa sạch, giã nát. Gừng thái lát',
  'Hấp cách thủy 15 phút, để nguội bớt rồi uống',
  '5-7 ngày, ngày uống 2-3 lần',
  ARRAY['Ho có đờm', 'Đờm trắng loãng', 'Viêm họng nhẹ'],
  ARRAY['Ho khan không đờm', 'Đờm vàng đặc'],
  'Kiêng đồ lạnh, cay nóng',
  ARRAY['nhe', 'trung-binh'], 9
),
-- Bài 3: Bổ gan (Quẻ Chấn/Tốn - Mộc - Can)
(
  'Bài thuốc bổ gan', '養肝方', 1, ARRAY['Mệt mỏi', 'Vàng da', 'Chức năng gan kém'],
  ARRAY[4, 5], 'moc', ARRAY['Can', 'Đởm'],
  '[
    {"ten": "Nghệ vàng", "lieu_luong": "10g", "vai_tro": "quan"},
    {"ten": "Mật ong", "lieu_luong": "15ml", "vai_tro": "than"},
    {"ten": "Rau má", "lieu_luong": "20g", "vai_tro": "ta"},
    {"ten": "Cam thảo", "lieu_luong": "5g", "vai_tro": "su"}
  ]'::jsonb,
  'Nghệ tươi giã nát hoặc nghệ bột. Rau má rửa sạch giã lấy nước',
  'Pha nghệ với mật ong và nước rau má, uống vào buổi sáng',
  '15-30 ngày liên tục',
  ARRAY['Gan yếu', 'Mệt mỏi', 'Da xạm'],
  ARRAY['Sỏi mật', 'Tắc mật'],
  'Không dùng khi đang có bệnh gan cấp tính',
  ARRAY['nhe', 'trung-binh'], 7
),
-- Bài 4: An thần (Quẻ Ly - Hỏa - Tâm)
(
  'Bài thuốc an thần', '安神方', 1, ARRAY['Mất ngủ', 'Hồi hộp', 'Lo âu'],
  ARRAY[3], 'hoa', ARRAY['Tâm'],
  '[
    {"ten": "Tâm sen", "lieu_luong": "5g", "vai_tro": "quan"},
    {"ten": "Lá vông nem", "lieu_luong": "10g", "vai_tro": "than"},
    {"ten": "Lạc tiên", "lieu_luong": "10g", "vai_tro": "ta"},
    {"ten": "Táo nhân", "lieu_luong": "10g", "vai_tro": "ta"}
  ]'::jsonb,
  'Rửa sạch các vị thuốc',
  'Sắc với 400ml nước còn 150ml, uống trước khi ngủ 30 phút',
  '7-14 ngày',
  ARRAY['Khó ngủ', 'Hay mơ', 'Tâm thần bất an'],
  ARRAY['Người tỳ vị hư hàn', 'Tiêu chảy'],
  'Không dùng cùng trà, cà phê',
  ARRAY['nhe', 'trung-binh'], 9
),
-- Bài 5: Bổ thận (Quẻ Khảm - Thủy - Thận)
(
  'Bài thuốc bổ thận', '補腎方', 1, ARRAY['Đau lưng', 'Tiểu đêm', 'Mệt mỏi'],
  ARRAY[6], 'thuy', ARRAY['Thận'],
  '[
    {"ten": "Đỗ trọng", "lieu_luong": "12g", "vai_tro": "quan"},
    {"ten": "Hoài sơn", "lieu_luong": "15g", "vai_tro": "than"},
    {"ten": "Câu kỷ tử", "lieu_luong": "10g", "vai_tro": "ta"},
    {"ten": "Cam thảo", "lieu_luong": "5g", "vai_tro": "su"}
  ]'::jsonb,
  'Rửa sạch, ngâm nước 30 phút',
  'Sắc với 600ml nước còn 200ml, chia 2 lần uống trong ngày',
  '20-30 ngày',
  ARRAY['Thận hư', 'Đau lưng mỏi gối', 'Tiểu nhiều lần'],
  ARRAY['Người âm hư hỏa vượng'],
  'Kiêng quan hệ tình dục quá độ trong thời gian uống thuốc',
  ARRAY['trung-binh'], 8
),
-- Bài 6: Kiện tỳ (Quẻ Khôn/Cấn - Thổ - Tỳ Vị)
(
  'Bài thuốc kiện tỳ', '健脾方', 1, ARRAY['Chán ăn', 'Tiêu chảy', 'Mệt mỏi'],
  ARRAY[7, 8], 'tho', ARRAY['Tỳ', 'Vị'],
  '[
    {"ten": "Hoài sơn", "lieu_luong": "20g", "vai_tro": "quan"},
    {"ten": "Bạch truật", "lieu_luong": "12g", "vai_tro": "than"},
    {"ten": "Ý dĩ", "lieu_luong": "15g", "vai_tro": "ta"},
    {"ten": "Cam thảo", "lieu_luong": "5g", "vai_tro": "su"}
  ]'::jsonb,
  'Rửa sạch, có thể rang vàng bạch truật',
  'Sắc uống hoặc nấu cháo ăn hàng ngày',
  '15-30 ngày',
  ARRAY['Tỳ vị hư nhược', 'Ăn không tiêu', 'Phân lỏng'],
  ARRAY['Thực tích', 'Bụng đầy trướng'],
  'Ăn chín uống sôi, tránh đồ sống lạnh',
  ARRAY['nhe', 'trung-binh'], 8
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- RLS Policies (with IF NOT EXISTS pattern)
-- =====================================================
ALTER TABLE public.nam_duoc_khoa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nam_duoc_vi_thuoc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nam_duoc_phuong_thuoc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nam_duoc_gua_mapping ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow read nam_duoc_khoa" ON public.nam_duoc_khoa;
DROP POLICY IF EXISTS "Allow read nam_duoc_vi_thuoc" ON public.nam_duoc_vi_thuoc;
DROP POLICY IF EXISTS "Allow read nam_duoc_phuong_thuoc" ON public.nam_duoc_phuong_thuoc;
DROP POLICY IF EXISTS "Allow read nam_duoc_gua_mapping" ON public.nam_duoc_gua_mapping;
DROP POLICY IF EXISTS "Admin write nam_duoc_khoa" ON public.nam_duoc_khoa;
DROP POLICY IF EXISTS "Admin write nam_duoc_vi_thuoc" ON public.nam_duoc_vi_thuoc;
DROP POLICY IF EXISTS "Admin write nam_duoc_phuong_thuoc" ON public.nam_duoc_phuong_thuoc;
DROP POLICY IF EXISTS "Admin write nam_duoc_gua_mapping" ON public.nam_duoc_gua_mapping;

-- Allow read access to all users
CREATE POLICY "Allow read nam_duoc_khoa" ON public.nam_duoc_khoa FOR SELECT USING (true);
CREATE POLICY "Allow read nam_duoc_vi_thuoc" ON public.nam_duoc_vi_thuoc FOR SELECT USING (true);
CREATE POLICY "Allow read nam_duoc_phuong_thuoc" ON public.nam_duoc_phuong_thuoc FOR SELECT USING (true);
CREATE POLICY "Allow read nam_duoc_gua_mapping" ON public.nam_duoc_gua_mapping FOR SELECT USING (true);

-- Only admin can write
CREATE POLICY "Admin write nam_duoc_khoa" ON public.nam_duoc_khoa FOR ALL USING (is_admin());
CREATE POLICY "Admin write nam_duoc_vi_thuoc" ON public.nam_duoc_vi_thuoc FOR ALL USING (is_admin());
CREATE POLICY "Admin write nam_duoc_phuong_thuoc" ON public.nam_duoc_phuong_thuoc FOR ALL USING (is_admin());
CREATE POLICY "Admin write nam_duoc_gua_mapping" ON public.nam_duoc_gua_mapping FOR ALL USING (is_admin());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vi_thuoc_ngu_hanh ON public.nam_duoc_vi_thuoc(ngu_hanh);
CREATE INDEX IF NOT EXISTS idx_vi_thuoc_tang_phu ON public.nam_duoc_vi_thuoc USING GIN(tang_phu);
CREATE INDEX IF NOT EXISTS idx_phuong_thuoc_gua ON public.nam_duoc_phuong_thuoc USING GIN(gua_ap_dung);
CREATE INDEX IF NOT EXISTS idx_phuong_thuoc_ngu_hanh ON public.nam_duoc_phuong_thuoc(ngu_hanh_chinh);
CREATE INDEX IF NOT EXISTS idx_phuong_thuoc_tang_phu ON public.nam_duoc_phuong_thuoc USING GIN(tang_phu_chinh);
