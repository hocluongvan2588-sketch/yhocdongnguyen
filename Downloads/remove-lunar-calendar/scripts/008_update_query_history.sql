-- ═══════════════════════════════════════════════════════════
-- UPDATE QUERY HISTORY TABLE STRUCTURE
-- Thêm các cột mới cho lưu trữ đơn giản hơn
-- ═══════════════════════════════════════════════════════════

-- Drop existing table and recreate with better structure
DROP TABLE IF EXISTS public.query_history CASCADE;

CREATE TABLE public.query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Thời gian query (để rate limit)
  query_date DATE NOT NULL DEFAULT CURRENT_DATE,
  query_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Kết quả quẻ (lưu tên để dễ hiển thị)
  main_hexagram TEXT NOT NULL,
  changed_hexagram TEXT NOT NULL,
  mutual_hexagram TEXT NOT NULL,
  moving_line INTEGER NOT NULL,
  
  -- Thông tin bệnh nhân
  patient_age INTEGER,
  patient_gender TEXT,
  patient_subject TEXT,
  question TEXT,
  
  -- Input data (lưu full để có thể tái tạo)
  input_data JSONB,
  
  -- AI analysis result (lưu sau khi có kết quả)
  ai_analysis JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_query_history_user_id ON public.query_history(user_id);
CREATE INDEX idx_query_history_query_date ON public.query_history(query_date);
CREATE INDEX idx_query_history_user_date ON public.query_history(user_id, query_date);

-- Enable RLS
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "query_history_select_own" ON public.query_history;
DROP POLICY IF EXISTS "query_history_insert_own" ON public.query_history;
DROP POLICY IF EXISTS "query_history_delete_own" ON public.query_history;
DROP POLICY IF EXISTS "query_history_admin_all" ON public.query_history;

-- Policies
CREATE POLICY "query_history_select_own" ON public.query_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "query_history_insert_own" ON public.query_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "query_history_delete_own" ON public.query_history
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS FOR RATE LIMITING
-- ═══════════════════════════════════════════════════════════

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_user_daily_query_count(UUID);
DROP FUNCTION IF EXISTS public.can_user_query(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.get_user_query_count_today(UUID);

-- Function: Get query count today
CREATE OR REPLACE FUNCTION public.get_user_query_count_today(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  query_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO query_count
  FROM public.query_history
  WHERE user_id = p_user_id
    AND query_date = CURRENT_DATE;
  
  RETURN COALESCE(query_count, 0);
END;
$$;

-- Function: Check if user can query (rate limit = 3/day)
CREATE OR REPLACE FUNCTION public.can_user_query(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  daily_limit INTEGER := 3;
BEGIN
  current_count := public.get_user_query_count_today(p_user_id);
  RETURN current_count < daily_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_query_count_today(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_query(UUID) TO authenticated;
