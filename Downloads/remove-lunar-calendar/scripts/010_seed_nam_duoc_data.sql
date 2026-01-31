-- ══════════════════════════════════════════════════════════════════════════
-- Seed Data: Nam Dược Thần Hiệu - Quyển Đầu (Tuệ Tĩnh)
-- ══════════════════════════════════════════════════════════════════════════
-- Nguồn: Nam Dược Thần Hiệu - Tuệ Tĩnh
-- Phần: Kinh trị (Các vị thuốc kinh điển)
-- ══════════════════════════════════════════════════════════════════════════

-- Schema bảng nam_duoc_vi_thuoc hiện tại:
-- ten_thuoc, ten_khoa_hoc, ten_khac[], tho_nom, ngu_hanh, gua_tuong_ung[], tang_phu[],
-- tinh, vi[], quy_kinh[], cong_dung, chu_tri[], cach_dung, lieu_luong, kieng_ky[], bo_phan_dung[], cach_che_bien

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
  cach_che_bien
) VALUES
-- 1. Quán chúng (Rễ củ cây Ráng)
(
  'Quán chúng',
  'Dryopteris crassirhizoma',
  ARRAY['貫衆', 'Cây Ráng'],
  'thuy',
  ARRAY['Can', 'Vị'],
  'han',
  ARRAY['đắng'],
  ARRAY['Can', 'Vị'],
  'Thanh nhiệt, xuất huyết, trừ tà, giết trùng, tiêu tích báng',
  ARRAY['Xuất huyết', 'Giun sán', 'Tích báng'],
  ARRAY['Rễ củ'],
  'Cạo bỏ vỏ ngoài, phơi khô.'
),

-- 2. Hoàng tinh (Củ Hoàng tinh)
(
  'Hoàng tinh',
  'Polygonatum sibiricum',
  ARRAY['黃精', 'Củ Hoàng tinh'],
  'tho',
  ARRAY['Tỳ', 'Phế', 'Thận'],
  'binh',
  ARRAY['ngọt'],
  ARRAY['Tỳ', 'Phế', 'Thận'],
  'Bổ trung ích khí, thêm tân dịch, sống lâu, bổ thận',
  ARRAY['Suy nhược', 'Khô khát', 'Thận hư'],
  ARRAY['Củ'],
  'Gọt vỏ, đồ và phơi khô 9 lần (cửu chưng cửu sái).'
),

-- 3. Sài hồ nam (Rễ cây Lức)
(
  'Sài hồ nam',
  'Bupleurum chinense',
  ARRAY['柴胡', 'Rễ cây Lức'],
  'moc',
  ARRAY['Can', 'Đởm'],
  'han',
  ARRAY['đắng', 'cay'],
  ARRAY['Can', 'Đởm'],
  'Giải biểu tán nhiệt, sơ can giải uất, thăng dương cử hãm',
  ARRAY['Cảm sốt', 'Sốt cơn', 'Gan uất nhiệt', 'Gân co rút'],
  ARRAY['Rễ'],
  'Rễ phơi khô.'
),

-- 4. Tiền hồ nam (Rễ cây Chỉ thiên)
(
  'Tiền hồ nam',
  'Peucedanum praeruptorum',
  ARRAY['前胡', 'Rễ cây Chỉ thiên'],
  'kim',
  ARRAY['Phế'],
  'han',
  ARRAY['đắng', 'cay'],
  ARRAY['Phế'],
  'Giáng khí hóa đàm, tán phong thanh nhiệt',
  ARRAY['Cảm sốt', 'Bí đầy', 'Đau đầu', 'Ho đờm'],
  ARRAY['Rễ'],
  'Rễ phơi khô.'
),

-- 5. Long đờm nam (Cỏ Thanh ngâm)
(
  'Long đờm nam',
  'Gentiana scabra',
  ARRAY['龍膽', 'Cỏ Thanh ngâm'],
  'moc',
  ARRAY['Can', 'Đởm', 'Vị'],
  'han',
  ARRAY['đắng'],
  ARRAY['Can', 'Đởm', 'Vị'],
  'An tạng, sát trùng, trừ độc, thanh can nhiệt, trị đau mắt',
  ARRAY['Gan nóng', 'Đau mắt', 'Giun sán'],
  ARRAY['Toàn cây'],
  'Dao tre cắt bỏ rễ con, phơi râm cho khô.'
),

-- 6. Sơn tam nại (Củ Địa liền)
(
  'Sơn tam nại',
  'Cremastra appendiculata',
  ARRAY['山慈菇', 'Củ Địa liền'],
  'tho',
  ARRAY['Can', 'Vị'],
  'han',
  ARRAY['ngọt', 'cay'],
  ARRAY['Can', 'Vị'],
  'Tiêu ung tán kết, hóa đàm, trị lam chướng',
  ARRAY['Lam chướng', 'Sốt rét', 'Thổ tả', 'Sâu răng'],
  ARRAY['Củ'],
  'Củ phơi khô.'
),

-- 7. Cao lương khương (Củ Riềng ấm)
(
  'Cao lương khương',
  'Alpinia officinarum',
  ARRAY['高良薑', 'Củ Riềng ấm'],
  'hoa',
  ARRAY['Tỳ', 'Vị'],
  'nhiet',
  ARRAY['cay'],
  ARRAY['Tỳ', 'Vị'],
  'Ôn trung tán hàn, chỉ thống, tiêu thực',
  ARRAY['Phong tê', 'Tả lỵ lâu ngày', 'Dạ dày lạnh', 'Khí uất'],
  ARRAY['Củ'],
  'Củ phơi khô.'
),

-- 8. Ích trí tử (Trái Ré)
(
  'Ích trí tử',
  'Alpinia oxyphylla',
  ARRAY['益智子', 'Trái Ré'],
  'tho',
  ARRAY['Tỳ', 'Thận'],
  'on',
  ARRAY['cay'],
  ARRAY['Tỳ', 'Thận'],
  'Điều hòa tỳ vị, dưỡng thân, lợi tam tiêu, bổ tủy',
  ARRAY['Tỳ vị hư', 'Tiểu nhiều', 'Di tinh'],
  ARRAY['Quả'],
  'Khi dùng bỏ vỏ.'
),

-- 9. Tất bát (Lá lốt)
(
  'Tất bát',
  'Piper lolot',
  ARRAY['蓽撥', 'Lá lốt'],
  'hoa',
  ARRAY['Tỳ', 'Vị', 'Can'],
  'on',
  ARRAY['cay'],
  ARRAY['Tỳ', 'Vị', 'Can'],
  'Ôn trung tán hàn, hạ khí chỉ thống',
  ARRAY['Đau lưng', 'Chướng khí', 'Thổ tả hàn lỵ', 'Đau âm nang'],
  ARRAY['Lá'],
  'Lá phơi khô hoặc dùng tươi.'
),

-- 10. Khương hoàng (Nghệ vàng)
(
  'Khương hoàng',
  'Curcuma longa',
  ARRAY['薑黃', 'Nghệ vàng'],
  'moc',
  ARRAY['Can', 'Tỳ'],
  'on',
  ARRAY['cay', 'đắng'],
  ARRAY['Can', 'Tỳ'],
  'Phá hòn cục, tiêu ung nhọt, hạ khí, thông máu ứ, chỉ thống',
  ARRAY['Đau tim', 'Máu ứ', 'Ung nhọt'],
  ARRAY['Củ'],
  'Củ phơi khô.'
),

-- 11. Uất kim (Củ Nghệ rừng)
(
  'Uất kim',
  'Curcuma aromatica',
  ARRAY['鬱金', 'Củ Nghệ rừng'],
  'moc',
  ARRAY['Tâm', 'Can', 'Phế'],
  'han',
  ARRAY['cay', 'đắng'],
  ARRAY['Tâm', 'Can', 'Phế'],
  'Khai uất kết, thông kinh nguyệt, lương huyết',
  ARRAY['Đau bụng', 'Nhọt', 'Kinh nguyệt không đều'],
  ARRAY['Củ'],
  'Thái miếng phơi khô.'
),

-- 12. Nga truật (Ngải xanh)
(
  'Nga truật',
  'Curcuma zedoaria',
  ARRAY['莪朮', 'Ngải xanh'],
  'moc',
  ARRAY['Can', 'Tỳ'],
  'on',
  ARRAY['cay', 'đắng'],
  ARRAY['Can', 'Tỳ'],
  'Phá hòn cục, tiêu thức ăn, chỉ thống',
  ARRAY['Nôn nước chua', 'Đau bụng', 'Tích tụ'],
  ARRAY['Củ'],
  'Thái miếng tẩm giấm, sấy khô.'
),

-- 13. Hương phụ (Củ cỏ Gấu)
(
  'Hương phụ',
  'Cyperus rotundus',
  ARRAY['香附', 'Củ cỏ Gấu'],
  'moc',
  ARRAY['Can', 'Tam tiêu'],
  'binh',
  ARRAY['cay', 'đắng', 'ngọt'],
  ARRAY['Can', 'Tam tiêu'],
  'Khai uất, lợi tam tiêu, điều kinh chỉ thống',
  ARRAY['Kinh nguyệt không đều', 'Đau bụng kinh', 'Khí uất'],
  ARRAY['Củ'],
  'Rang sém, giã bỏ vỏ đen; tẩm rượu/giấm/muối/đồng tiện tùy chứng rồi sao lên.'
),

-- 14. Bạc hà (Lá Bạc hà)
(
  'Bạc hà',
  'Mentha arvensis',
  ARRAY['薄荷', 'Lá Bạc hà'],
  'kim',
  ARRAY['Phế', 'Can'],
  'luong',
  ARRAY['cay'],
  ARRAY['Phế', 'Can'],
  'Thanh nhiệt hóa đờm, tiêu thức ăn, sơ tán phong nhiệt',
  ARRAY['Phong tà', 'Đau đầu', 'Họng đau'],
  ARRAY['Lá'],
  'Lá tươi hoặc phơi khô.'
),

-- 15. Hy thiêm (Lá Bà a)
(
  'Hy thiêm',
  'Siegesbeckia orientalis',
  ARRAY['豨薟', 'Cỏ đĩ'],
  'moc',
  ARRAY['Can', 'Thận'],
  'han',
  ARRAY['đắng'],
  ARRAY['Can', 'Thận'],
  'Trừ phong thấp, lợi gân cốt, thanh nhiệt giải độc',
  ARRAY['Lở ngứa', 'Phong thấp', 'Tê tay chân', 'Phù thũng'],
  ARRAY['Toàn cây'],
  'Tươi hoặc phơi khô, tẩm rượu mật đồ và phơi 9 lần.'
),

-- 16. Ngưu tất nam (Rễ Cỏ xước)
(
  'Ngưu tất nam',
  'Achyranthes aspera',
  ARRAY['牛膝', 'Rễ Cỏ xước'],
  'thuy',
  ARRAY['Can', 'Thận'],
  'binh',
  ARRAY['đắng', 'chua'],
  ARRAY['Can', 'Thận'],
  'Mạnh gân cốt, điều huyết, lợi khớp',
  ARRAY['Tê liệt', 'Đái gắt', 'Sốt rét', 'Đau khớp'],
  ARRAY['Rễ'],
  'Kỵ sắt, bỏ gốc, tẩm rượu dùng.'
),

-- 17. Nam tinh (Củ Ráy chuột)
(
  'Nam tinh',
  'Arisaema erubescens',
  ARRAY['南星', 'Củ Ráy chuột'],
  'tho',
  ARRAY['Phế', 'Can', 'Tỳ'],
  'on',
  ARRAY['đắng', 'cay'],
  ARRAY['Phế', 'Can', 'Tỳ'],
  'Táo phong hóa đàm, tán kết tiêu ung. CÓ ĐỘC - phải chế biến kỹ',
  ARRAY['Trúng phong sùi đờm', 'Mụn nhọt', 'Hòn cục'],
  ARRAY['Củ'],
  'Thái miếng, giã Gừng nấu chín, phơi khô (để khử độc).'
),

-- 18. Thỏ ty tử (Hột Tơ hồng)
(
  'Thỏ ty tử',
  'Cuscuta chinensis',
  ARRAY['菟絲子', 'Hột Tơ hồng'],
  'thuy',
  ARRAY['Can', 'Thận'],
  'on',
  ARRAY['ngọt'],
  ARRAY['Can', 'Thận'],
  'Bổ trung ích khí, mạnh gân cốt, sáng mắt, bổ thận dương',
  ARRAY['Đau lưng', 'Mỏi gối', 'Mờ mắt'],
  ARRAY['Hạt'],
  'Hạt phơi khô.'
),

-- 19. Mộc miết tử (Hạt quả Gấc)
(
  'Mộc miết tử',
  'Momordica cochinchinensis',
  ARRAY['木鱉子', 'Hạt quả Gấc'],
  'moc',
  ARRAY['Can', 'Tỳ', 'Vị'],
  'on',
  ARRAY['ngọt'],
  ARRAY['Can', 'Tỳ', 'Vị'],
  'Thông bí tắc, tan ung nhọt, tiêu sưng. Hơi độc - dùng liều nhỏ',
  ARRAY['Đau lưng', 'Trĩ', 'Nhọt sưng'],
  ARRAY['Hạt'],
  'Hạt phơi khô.'
),

-- 20. Hà thủ ô trắng (Rễ cây Sữa bò)
(
  'Hà thủ ô trắng',
  'Streptocaulon juventas',
  ARRAY['白何首烏', 'Rễ cây Sữa bò'],
  'thuy',
  ARRAY['Can', 'Thận'],
  'on',
  ARRAY['đắng', 'ngọt'],
  ARRAY['Can', 'Thận'],
  'Mạnh gân bổ tỳ, trừ nhọt độc, tăng tuổi thọ',
  ARRAY['Suy nhược', 'Nhọt độc', 'Đau lưng mỏi gối'],
  ARRAY['Rễ', 'Củ'],
  'Lấy dao nứa cạo bỏ vỏ thô, lấy chày đập nát, ngâm nước vo gạo 1 đêm, phơi khô mà dùng.'
),

-- 21. Xương bồ (Rễ Xương bồ)
(
  'Xương bồ',
  'Acorus calamus',
  ARRAY['菖蒲', 'Rễ Xương bồ'],
  'hoa',
  ARRAY['Tâm', 'Can', 'Tỳ'],
  'on',
  ARRAY['cay'],
  ARRAY['Tâm', 'Can', 'Tỳ'],
  'Trừ thấp, an thần, khai khiếu',
  ARRAY['Trúng ác', 'Điên cuồng', 'Mê sảng'],
  ARRAY['Rễ'],
  'Cạo vỏ bằng dao nứa, đập dập sao hoặc tẩm nước vo gạo phơi khô.'
),

-- 22. Đậu sị (Hạt Đậu đen chế biến)
(
  'Đậu sị',
  'Glycine max',
  ARRAY['豆豉', 'Hạt Đậu đen lên men'],
  'thuy',
  ARRAY['Phế', 'Vị'],
  'han',
  ARRAY['đắng', 'cay'],
  ARRAY['Phế', 'Vị'],
  'Giải biểu, trừ phiền, tuyên phát uất nhiệt',
  ARRAY['Cảm mạo', 'Phiền nhiệt', 'Uất nhiệt'],
  ARRAY['Hạt đậu đen lên men'],
  'Đồ chín hạt đậu đen, ủ thanh hao sinh vàng, phơi khô, ủ lá dâu 7 lần trong 49 ngày.'
),

-- 23. Can khương (Củ gừng già)
(
  'Can khương',
  'Zingiber officinale',
  ARRAY['乾薑', 'Củ gừng già'],
  'hoa',
  ARRAY['Tỳ', 'Vị', 'Phế'],
  'nhiet',
  ARRAY['cay'],
  ARRAY['Tỳ', 'Vị', 'Phế'],
  'Ôn trung hồi dương, ôn phế hóa ẩm',
  ARRAY['Hư nhiệt', 'Phong hàn', 'Đau bụng', 'Thất huyết'],
  ARRAY['Củ gừng già có xơ'],
  'Ngâm nước chảy về phía đông 7 ngày, lấy ra xắt lát, đồ chín phơi khô mà dùng.'
)

ON CONFLICT DO NOTHING;

-- Log seed completion
DO $$
BEGIN
  RAISE NOTICE 'Đã nhập thành công 23 vị thuốc Kinh trị từ Nam Dược Thần Hiệu - Tuệ Tĩnh';
END $$;
