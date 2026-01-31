-- ═══════════════════════════════════════════════════════════
-- QUERY HISTORY TABLE
-- Lưu lịch sử hỏi quẻ của user + Rate limiting (3 lần/ngày)
-- ═══════════════════════════════════════════════════════════

-- Tạo bảng lưu lịch sử queries
CREATE TABLE IF NOT EXISTS public.query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Thông tin thời gian hỏi quẻ
  query_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  lunar_info JSONB, -- {year, month, day, hour, tietKhi, season}
  
  -- Kết quả quẻ
  main_hexagram JSONB, -- Quẻ chủ
  changed_hexagram JSONB, -- Quẻ biến
  mutual_hexagram JSONB, -- Quẻ hỗ
  moving_line INTEGER, -- Hào động
  
  -- Kết quả chẩn đoán
  diagnosis JSONB, -- Toàn bộ kết quả chẩn đoán
  ai_analysis JSONB, -- Kết quả phân tích AI
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT, -- Để detect spam
  user_agent TEXT
);

-- Index cho việc query theo user và ngày
CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON public.query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON public.query_history(created_at);
CREATE INDEX IF NOT EXISTS idx_query_history_user_date ON public.query_history(user_id, created_at);

-- Enable RLS
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;

-- Policy: User chỉ xem được lịch sử của mình
CREATE POLICY "query_history_select_own" ON public.query_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: User chỉ insert được cho mình
CREATE POLICY "query_history_insert_own" ON public.query_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: User có thể xóa lịch sử của mình
CREATE POLICY "query_history_delete_own" ON public.query_history
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Admin xem tất cả (optional)
CREATE POLICY "query_history_admin_all" ON public.query_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════
-- FUNCTION: Đếm số lần query trong ngày của user
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_user_daily_query_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO query_count
  FROM public.query_history
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  RETURN COALESCE(query_count, 0);
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- FUNCTION: Kiểm tra user có thể query không (rate limit)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.can_user_query(p_user_id UUID, p_daily_limit INTEGER DEFAULT 3)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  current_count := public.get_user_daily_query_count(p_user_id);
  RETURN current_count < p_daily_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_daily_query_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_query(UUID, INTEGER) TO authenticated;
