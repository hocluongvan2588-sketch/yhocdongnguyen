-- Add admin policy for bank_accounts table
-- This allows admin users to insert, update, and delete bank accounts

-- First, create is_admin function if not exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies if they exist (to recreate)
DROP POLICY IF EXISTS "bank_accounts_admin_all" ON public.bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_admin_insert" ON public.bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_admin_update" ON public.bank_accounts;
DROP POLICY IF EXISTS "bank_accounts_admin_delete" ON public.bank_accounts;

-- Create policy for admin to do all operations
CREATE POLICY "bank_accounts_admin_all" ON public.bank_accounts
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Grant permissions
GRANT ALL ON public.bank_accounts TO authenticated;
