-- =====================================================
-- Nam Dược Thần Hiệu - Quyển IV: Các bệnh về ĐAU
-- 20 bài thuốc trị các chứng đau (đầu, răng, mắt, bụng, lưng, khớp...)
-- =====================================================

-- Schema hiện tại của nam_duoc_vi_thuoc:
-- ten_thuoc, ten_khoa_hoc, ten_khac[], tho_nom, ngu_hanh, gua_tuong_ung[], tang_phu[],
-- tinh (han/luong/on/nhiet/binh), vi[], quy_kinh[], cong_dung, chu_tri[], 
-- cach_dung, lieu_luong, kieng_ky[], bo_phan_dung[], cach_che_bien

-- Schema hiện tại của nam_duoc_phuong_thuoc:
-- ten_phuong, ten_han, xuat_xu, khoa_id, loai_benh[], gua_ap_dung[], ngu_hanh_chinh,
-- tang_phu_chinh[], thanh_phan (jsonb), cach_bao_che, cach_dung, lieu_trinh,
-- chi_dinh[], chong_chi_dinh[], luu_y, muc_do_benh[], do_tuoi_phu_hop, gioi_tinh, do_uu_tien

-- =====================================================
-- PHẦN 1: BỔ SUNG CÁC VỊ THUỐC QUAN TRỌNG
-- =====================================================

INSERT INTO public.nam_duoc_vi_thuoc (
  ten_thuoc,
  ten_khoa_hoc,
  ten_khac,
  ngu_hanh,
  tang_phu,
  tinh,
  vi,
  quy_kinh,
  cong_dung,
  chu_tri,
  bo_phan_dung,
  cach_che_bien,
  lieu_luong,
  kieng_ky
) VALUES

-- Ngũ gia bì
(
  'Ngũ gia bì',
  'Acanthopanax gracilistylus',
  ARRAY['五加皮', 'Vỏ ngũ gia'],
  'moc',
  ARRAY['Can', 'Thận'],
  'on',
  ARRAY['cay', 'đắng'],
  ARRAY['Can', 'Thận'],
  'Khu phong trừ thấp, bổ can thận, cường gân cốt',
  ARRAY['Tê bại', 'Đau nhức gân xương', 'Phong thấp'],
  ARRAY['Vỏ'],
  'Bào lạt hoặc tẩm rượu.',
  '5-10g',
  NULL
),

-- Cúc hoa
(
  'Cúc hoa',
  'Chrysanthemum morifolium',
  ARRAY['菊花', 'Hoa cúc'],
  'kim',
  ARRAY['Phế', 'Can'],
  'luong',
  ARRAY['ngọt', 'đắng'],
  ARRAY['Phế', 'Can'],
  'Thanh nhiệt giải độc, bình can sáng mắt',
  ARRAY['Đau đầu', 'Mắt đỏ', 'Chóng mặt'],
  ARRAY['Hoa'],
  'Hái hoa phơi khô.',
  '5-10g',
  ARRAY['Tỳ vị hư hàn']
),

-- Thạch cao
(
  'Thạch cao',
  'Gypsum fibrosum',
  ARRAY['石膏'],
  'kim',
  ARRAY['Phế', 'Vị'],
  'han',
  ARRAY['ngọt', 'cay'],
  ARRAY['Phế', 'Vị'],
  'Thanh nhiệt tả hỏa, trừ phiền chỉ khát',
  ARRAY['Sốt cao', 'Khát nước', 'Phiền táo'],
  ARRAY['Khoáng vật'],
  'Đập vỡ sắc trước.',
  '15-60g',
  ARRAY['Tỳ vị hư hàn', 'Huyết hư']
),

-- Phụ tử
(
  'Phụ tử',
  'Aconitum carmichaelii',
  ARRAY['附子', 'Ô đầu'],
  'hoa',
  ARRAY['Tâm', 'Thận', 'Tỳ'],
  'nhiet',
  ARRAY['cay', 'ngọt'],
  ARRAY['Tâm', 'Thận', 'Tỳ'],
  'Hồi dương cứu nghịch, bổ hỏa trợ dương. CÓ ĐỘC MẠNH - cần chế biến kỹ',
  ARRAY['Vong dương', 'Chân tay lạnh', 'Đau bụng hàn'],
  ARRAY['Củ con'],
  'Chế với muối hoặc nước cơm để giảm độc.',
  '3-15g (phải chế)',
  ARRAY['Thai phụ tuyệt đối kiêng', 'Âm hư hỏa vượng']
),

-- Ngải cứu
(
  'Ngải cứu',
  'Artemisia vulgaris',
  ARRAY['艾葉', 'Ngải diệp'],
  'hoa',
  ARRAY['Tỳ', 'Can', 'Thận'],
  'on',
  ARRAY['đắng', 'cay'],
  ARRAY['Tỳ', 'Can', 'Thận'],
  'Ôn kinh chỉ huyết, tán hàn chỉ thống, trừ thấp',
  ARRAY['Đau bụng kinh', 'Kinh nguyệt không đều', 'Phong thấp'],
  ARRAY['Lá'],
  'Phơi khô, có thể chế ngải nhung.',
  '3-10g',
  ARRAY['Âm hư huyết nhiệt']
),

-- Tía tô
(
  'Tía tô',
  'Perilla frutescens',
  ARRAY['紫蘇', 'Tô diệp'],
  'kim',
  ARRAY['Phế', 'Tỳ'],
  'on',
  ARRAY['cay'],
  ARRAY['Phế', 'Tỳ'],
  'Phát biểu tán hàn, hành khí hòa vị',
  ARRAY['Cảm mạo', 'Ho', 'Buồn nôn'],
  ARRAY['Lá', 'Cành'],
  'Dùng tươi hoặc phơi khô.',
  '5-10g',
  ARRAY['Ra mồ hôi nhiều']
),

-- Củ sắn dây
(
  'Cát căn',
  'Pueraria lobata',
  ARRAY['葛根', 'Củ sắn dây'],
  'tho',
  ARRAY['Tỳ', 'Vị'],
  'luong',
  ARRAY['ngọt', 'cay'],
  ARRAY['Tỳ', 'Vị'],
  'Giải cơ thối nhiệt, thăng dương chỉ tả, sinh tân',
  ARRAY['Cảm sốt', 'Đau cổ gáy', 'Khát nước', 'Tiêu chảy'],
  ARRAY['Củ'],
  'Củ phơi khô hoặc dùng bột.',
  '10-15g',
  NULL
)

ON CONFLICT DO NOTHING;

-- =====================================================
-- PHẦN 2: NHẬP CÁC BÀI THUỐC QUYỂN IV - TRỊ ĐAU
-- =====================================================

INSERT INTO public.nam_duoc_phuong_thuoc (
  ten_phuong,
  ten_han,
  xuat_xu,
  khoa_id,
  loai_benh,
  gua_ap_dung,
  ngu_hanh_chinh,
  tang_phu_chinh,
  thanh_phan,
  cach_bao_che,
  cach_dung,
  lieu_trinh,
  chi_dinh,
  chong_chi_dinh,
  luu_y,
  muc_do_benh,
  do_uu_tien
) VALUES

-- 1. Trị đau đầu buốt óc, mắt mờ
(
  'Hương Phụ Cúc Hoa Tán',
  '香附菊花散',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Đau đầu', 'Mắt mờ'],
  ARRAY[1, 8],
  'moc',
  ARRAY['Can', 'Phế'],
  '[
    {"ten": "Hương phụ", "lieu_luong": "80g", "vai_tro": "quan"},
    {"ten": "Cúc hoa", "lieu_luong": "80g", "vai_tro": "than"},
    {"ten": "Thạch cao", "lieu_luong": "40g", "vai_tro": "ta"},
    {"ten": "Bạc hà", "lieu_luong": "20g", "vai_tro": "su"}
  ]'::jsonb,
  'Tán nhỏ các vị thành bột mịn',
  'Mỗi lần uống 8g với nước Gừng và Hành sau bữa ăn',
  '7-14 ngày',
  ARRAY['Đau đầu buốt óc', 'Mắt mờ do phong nhiệt'],
  ARRAY['Thai phụ thận trọng'],
  'Uống sau khi ăn',
  ARRAY['nhe', 'trung-binh'],
  8
),

-- 2. Gừng Hành Thang (Cảm hàn, đau đầu búa bổ)
(
  'Gừng Hành Thang',
  '薑蔥湯',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Cảm hàn', 'Đau đầu'],
  ARRAY[1],
  'kim',
  ARRAY['Phế'],
  '[
    {"ten": "Gừng sống", "lieu_luong": "40g", "vai_tro": "quan"},
    {"ten": "Hành trắng", "lieu_luong": "14 củ", "vai_tro": "than"}
  ]'::jsonb,
  'Giã nát cả hai vị',
  'Sắc với 1 bát nước lấy 6-7 phần, uống nóng, đắp chăn ra mồ hôi',
  '1-3 ngày',
  ARRAY['Cảm hàn đau đầu búa bổ', 'Sợ lạnh run'],
  NULL,
  'Uống nóng, đắp chăn phát mồ hôi',
  ARRAY['nhe'],
  9
),

-- 3. Trị đau nửa đầu (Thiên đầu thống)
(
  'Nam Tinh Thạch Cao Tán',
  '南星石膏散',
  'Nam Dược Thần Hiệu - Quyển IV',
  2,
  ARRAY['Đau nửa đầu', 'Thiên đầu thống'],
  ARRAY[8],
  'tho',
  ARRAY['Phế', 'Can'],
  '[
    {"ten": "Nam tinh", "lieu_luong": "tùy ý", "vai_tro": "quan"},
    {"ten": "Thạch cao", "lieu_luong": "tùy ý", "vai_tro": "than"}
  ]'::jsonb,
  'Tán bột cả hai vị, hòa với nước',
  'Đau bên tả phết bên hữu thái dương và ngược lại',
  '3-5 ngày',
  ARRAY['Đau một bên đầu', 'Phong đàm'],
  NULL,
  'Dùng ngoài da',
  ARRAY['nhe'],
  7
),

-- 4. Trị đau nhức chân răng
(
  'Hương Phụ Muối Xát Răng',
  '香附鹽末',
  'Nam Dược Thần Hiệu - Quyển IV',
  2,
  ARRAY['Đau răng'],
  ARRAY[7],
  'tho',
  ARRAY['Vị'],
  '[
    {"ten": "Hương phụ", "lieu_luong": "tùy ý", "vai_tro": "quan"},
    {"ten": "Muối", "lieu_luong": "ít", "vai_tro": "ta"}
  ]'::jsonb,
  'Đốt tồn tính (đốt cháy đen bên ngoài), tán nhỏ',
  'Xát vào chân răng đau',
  '3-5 ngày',
  ARRAY['Đau nhức chân răng', 'Đau răng phong hỏa'],
  NULL,
  'Xát trực tiếp vào răng đau',
  ARRAY['nhe'],
  7
),

-- 5. Trị đau răng sâu
(
  'Bồ Kết Nướng',
  '皂角烤',
  'Nam Dược Thần Hiệu - Quyển IV',
  2,
  ARRAY['Răng sâu', 'Đau răng'],
  ARRAY[7],
  'hoa',
  ARRAY['Vị'],
  '[
    {"ten": "Quả Bồ kết", "lieu_luong": "1 quả", "vai_tro": "quan"},
    {"ten": "Rượu", "lieu_luong": "vừa đủ", "vai_tro": "su"}
  ]'::jsonb,
  'Nướng bồ kết cho nóng',
  'Ngậm quả nóng, nguội thì thay. Hoặc tán bột trộn rượu bôi',
  '3-5 ngày',
  ARRAY['Răng bị sâu đau nhức'],
  NULL,
  'Ngậm quả nóng hoặc bôi bột lên răng sâu',
  ARRAY['nhe'],
  6
),

-- 6. Trị đau mắt đỏ, sưng tấy
(
  'Lá Dâu Đắp Mắt',
  '桑葉敷眼',
  'Nam Dược Thần Hiệu - Quyển IV',
  2,
  ARRAY['Đau mắt đỏ', 'Viêm mắt'],
  ARRAY[3],
  'moc',
  ARRAY['Can'],
  '[
    {"ten": "Lá Dâu non", "lieu_luong": "1 nắm", "vai_tro": "quan"},
    {"ten": "Muối", "lieu_luong": "ít", "vai_tro": "ta"}
  ]'::jsonb,
  'Giã nát với muối',
  'Đắp lên mắt khi ngủ',
  '3-7 ngày',
  ARRAY['Đau mắt đỏ', 'Sưng tấy', 'Phong nhiệt lên mắt'],
  NULL,
  'Đắp ngoài mắt khi đi ngủ',
  ARRAY['nhe'],
  7
),

-- 7. Trị đau họng, sưng cổ
(
  'Củ Sắn Dây Thang',
  '葛根湯',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Đau họng', 'Viêm họng'],
  ARRAY[6],
  'thuy',
  ARRAY['Phế'],
  '[
    {"ten": "Củ Sắn dây", "lieu_luong": "tùy ý", "vai_tro": "quan"}
  ]'::jsonb,
  'Giã lấy nước cốt hoặc dùng bột sắn dây hòa nước',
  'Uống nước cốt tươi hoặc hòa bột',
  '3-5 ngày',
  ARRAY['Đau họng sưng cổ', 'Nhiệt độc ở họng'],
  NULL,
  'Uống nhiều lần trong ngày',
  ARRAY['nhe', 'trung-binh'],
  8
),

-- 8. Trị đau bụng thổ tả (Hoắc loạn)
(
  'Cứu Muối Rốn',
  '鹽臍灸',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Đau bụng', 'Thổ tả', 'Hoắc loạn'],
  ARRAY[8],
  'hoa',
  ARRAY['Tỳ', 'Vị'],
  '[
    {"ten": "Muối", "lieu_luong": "đầy rốn", "vai_tro": "ta"},
    {"ten": "Ngải nhung", "lieu_luong": "tùy ý", "vai_tro": "quan"}
  ]'::jsonb,
  'Bỏ muối đầy rốn, đặt ngải nhung lên trên',
  'Cứu (đốt) cho đến khi tỉnh lại',
  'Cấp cứu',
  ARRAY['Đau bụng ói mửa tiêu chảy', 'Hoắc loạn'],
  ARRAY['Cấp cứu khẩn cần đưa bệnh viện nếu không đỡ'],
  'Cứu ngải ở rốn cho đến khi tỉnh lại',
  ARRAY['nang'],
  9
),

-- 9. Tứ Nghịch Thang
(
  'Tứ Nghịch Thang',
  '四逆湯',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Đau bụng cấp', 'Chân tay lạnh'],
  ARRAY[6, 8],
  'hoa',
  ARRAY['Tâm', 'Thận', 'Tỳ'],
  '[
    {"ten": "Can khương", "lieu_luong": "40g", "vai_tro": "quan"},
    {"ten": "Phụ tử sống", "lieu_luong": "1 củ", "vai_tro": "than"},
    {"ten": "Chích Cam thảo", "lieu_luong": "80g", "vai_tro": "ta"}
  ]'::jsonb,
  'Các vị sắc chung',
  'Sắc uống gấp để hồi dương cứu nghịch',
  'Cấp cứu',
  ARRAY['Chứng thiếu âm', 'Hàn chứng', 'Vong dương'],
  ARRAY['Phụ tử độc cần chế biến', 'Thai phụ tuyệt đối kiêng'],
  'Uống ngay khi còn ấm',
  ARRAY['nang'],
  10
),

-- 10. Trị đau bụng kinh
(
  'Hương Phụ Ngải Cứu Thang',
  '香附艾草湯',
  'Nam Dược Thần Hiệu - Quyển IV',
  3,
  ARRAY['Đau bụng kinh', 'Rối loạn kinh nguyệt'],
  ARRAY[4, 5],
  'hoa',
  ARRAY['Can', 'Tỳ'],
  '[
    {"ten": "Hương phụ", "lieu_luong": "40g", "vai_tro": "quan"},
    {"ten": "Ngải cứu", "lieu_luong": "20g", "vai_tro": "than"}
  ]'::jsonb,
  'Tán bột hoặc sắc uống',
  'Uống với nước ấm trước kỳ kinh 2-3 ngày',
  '5-7 ngày',
  ARRAY['Đau bụng kinh', 'Kinh nguyệt đau'],
  ARRAY['Thai phụ không dùng'],
  'Uống trước kỳ kinh 2-3 ngày',
  ARRAY['nhe', 'trung-binh'],
  8
),

-- 11. Trị đau lưng do Thận hư
(
  'Hạt Gấc Rượu',
  '木鱉子酒',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Đau lưng', 'Thận hư'],
  ARRAY[6],
  'thuy',
  ARRAY['Thận', 'Can'],
  '[
    {"ten": "Hạt Gấc", "lieu_luong": "tùy ý", "vai_tro": "quan"},
    {"ten": "Rượu", "lieu_luong": "vừa đủ", "vai_tro": "su"}
  ]'::jsonb,
  'Hạt gấc bỏ vỏ lấy nhân sao vàng tán bột',
  'Mỗi lần uống 8g với rượu lúc đói',
  '15-30 ngày',
  ARRAY['Yếu thận', 'Đau lưng mỏi gối'],
  ARRAY['Độc không quá liều', 'Thai phụ kiêng'],
  'Uống lúc đói với rượu ấm',
  ARRAY['trung-binh'],
  7
),

-- 12. Trị đau lưng không cúi ngửa được
(
  'Rễ Cỏ Xước Rượu',
  '牛膝酒',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Đau lưng', 'Cứng lưng'],
  ARRAY[4, 6],
  'moc',
  ARRAY['Can', 'Thận'],
  '[
    {"ten": "Rễ Cỏ xước", "lieu_luong": "1 nắm", "vai_tro": "quan"},
    {"ten": "Rượu", "lieu_luong": "vừa đủ", "vai_tro": "su"}
  ]'::jsonb,
  'Rửa sạch rễ cỏ xước',
  'Sắc rễ cỏ xước với rượu và nước, uống lúc ấm',
  '10-15 ngày',
  ARRAY['Đau lưng cứng', 'Khó cúi ngửa'],
  NULL,
  'Uống ấm ngày 2 lần',
  ARRAY['trung-binh'],
  7
),

-- 13. Trị đau thắt ngang lưng
(
  'Xương Rồng Đắp Lưng',
  '仙人掌敷腰',
  'Nam Dược Thần Hiệu - Quyển IV',
  2,
  ARRAY['Đau lưng', 'Yêu thống'],
  ARRAY[7],
  'tho',
  ARRAY['Thận'],
  '[
    {"ten": "Xương rồng bà", "lieu_luong": "2-3 cành", "vai_tro": "quan"}
  ]'::jsonb,
  'Hơ nóng xương rồng',
  'Đắp và chườm trực tiếp vào chỗ lưng đau',
  '5-7 ngày',
  ARRAY['Đau thắt ngang lưng', 'Đau lưng dọc ngang'],
  NULL,
  'Đắp nóng vào lưng thay khi nguội',
  ARRAY['nhe'],
  6
),

-- 14. Trị các khớp xương đau nhức (Phong thấp)
(
  'Tam Vị Trừ Thấp Thang',
  '三味除濕湯',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Đau khớp', 'Phong thấp'],
  ARRAY[4, 5],
  'moc',
  ARRAY['Can', 'Thận'],
  '[
    {"ten": "Lá lốt", "lieu_luong": "15g", "vai_tro": "quan"},
    {"ten": "Rễ Bưởi bung", "lieu_luong": "15g", "vai_tro": "than"},
    {"ten": "Rễ Cỏ xước", "lieu_luong": "15g", "vai_tro": "than"}
  ]'::jsonb,
  'Rửa sạch các vị',
  'Sắc uống ngày 1 thang chia 2-3 lần',
  '15-30 ngày',
  ARRAY['Các khớp xương đau nhức', 'Đau khớp do gió ẩm'],
  NULL,
  'Uống 2-3 lần/ngày sau ăn',
  ARRAY['trung-binh'],
  8
),

-- 15. Trị tê bại, đau nhức gân xương
(
  'Ngũ Gia Bì Rượu',
  '五加皮酒',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Tê bại', 'Đau gân xương'],
  ARRAY[4, 6],
  'hoa',
  ARRAY['Can', 'Thận'],
  '[
    {"ten": "Ngũ gia bì", "lieu_luong": "40g", "vai_tro": "quan"},
    {"ten": "Rượu", "lieu_luong": "500ml", "vai_tro": "su"}
  ]'::jsonb,
  'Ngâm rượu 7-10 ngày',
  'Uống 1 chén nhỏ mỗi ngày hoặc sắc nước uống',
  '30-60 ngày',
  ARRAY['Phong thấp tê bại', 'Đau nhức gân xương'],
  NULL,
  'Uống 1 chén nhỏ mỗi ngày',
  ARRAY['nhe', 'trung-binh'],
  7
),

-- 16. Trị đau khớp gối sưng nóng
(
  'Ngải Cứu Dấm Đắp',
  '艾葉醋敷',
  'Nam Dược Thần Hiệu - Quyển IV',
  2,
  ARRAY['Đau khớp gối', 'Hạc tất phong'],
  ARRAY[7],
  'hoa',
  ARRAY['Can'],
  '[
    {"ten": "Lá Ngải cứu", "lieu_luong": "1 nắm", "vai_tro": "quan"},
    {"ten": "Dấm chua", "lieu_luong": "vừa đủ", "vai_tro": "ta"}
  ]'::jsonb,
  'Ngải cứu xào nóng với dấm',
  'Đắp vào đầu gối khi còn ấm, băng lại',
  '7-14 ngày',
  ARRAY['Đầu gối sưng đau nóng', 'Hạc tất phong'],
  NULL,
  'Đắp ấm giữ 1-2 giờ',
  ARRAY['nhe'],
  7
),

-- 17. Trị đau gót chân
(
  'Vỏ Sữa Lá Lốt Thang',
  '乳皮蓽茇湯',
  'Nam Dược Thần Hiệu - Quyển IV',
  1,
  ARRAY['Đau gót chân'],
  ARRAY[7],
  'tho',
  ARRAY['Thận', 'Can'],
  '[
    {"ten": "Vỏ cây Sữa", "lieu_luong": "20g", "vai_tro": "quan"},
    {"ten": "Lá lốt", "lieu_luong": "20g", "vai_tro": "than"}
  ]'::jsonb,
  'Rửa sạch các vị',
  'Sắc nước ngâm chân và uống',
  '10-15 ngày',
  ARRAY['Gót chân đau nhức'],
  NULL,
  'Ngâm chân ấm uống 1 chén',
  ARRAY['nhe'],
  6
),

-- 18. Trị đau vai gáy
(
  'Tía Tô Hành Chườm',
  '紫蘇蔥敷',
  'Nam Dược Thần Hiệu - Quyển IV',
  2,
  ARRAY['Đau vai gáy', 'Cứng cổ'],
  ARRAY[1, 2],
  'kim',
  ARRAY['Phế'],
  '[
    {"ten": "Lá tía tô", "lieu_luong": "1 nắm", "vai_tro": "quan"},
    {"ten": "Hành sống", "lieu_luong": "3 củ", "vai_tro": "than"}
  ]'::jsonb,
  'Giã nát xào nóng với rượu',
  'Bọc vải chườm vào vùng vai gáy bị cứng',
  '5-7 ngày',
  ARRAY['Vai gáy cứng đau', 'Cứng cổ'],
  NULL,
  'Chườm nóng vùng vai gáy',
  ARRAY['nhe'],
  7
)

ON CONFLICT DO NOTHING;

-- =====================================================
-- PHẦN 3: TẠO INDEX ĐỂ TỐI ƯU TRUY VẤN
-- =====================================================

-- Index cho truy vấn bài thuốc theo loại bệnh
CREATE INDEX IF NOT EXISTS idx_phuong_loai_benh 
ON nam_duoc_phuong_thuoc USING gin(loai_benh);

-- =====================================================
-- HOÀN THÀNH
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Đã nhập thành công 18 bài thuốc từ Nam Dược Thần Hiệu - Quyển IV: Trị các chứng đau';
END $$;
