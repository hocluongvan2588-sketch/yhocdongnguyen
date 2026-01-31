-- =====================================================
-- PROFILES TABLE WITH ROLE-BASED ACCESS CONTROL
-- =====================================================
-- This script creates the profiles table and proper RLS policies
-- that avoid infinite recursion issues.

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY DEFINER FUNCTION FOR ADMIN CHECK
-- =====================================================
-- This function runs with elevated privileges to check admin status
-- without causing infinite recursion in RLS policies.
-- SECURITY DEFINER means it runs as the function owner (postgres),
-- bypassing RLS to check the admin status.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE  -- Function returns same result for same input within a transaction
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- =====================================================
-- RLS POLICIES (Avoiding infinite recursion)
-- =====================================================
-- IMPORTANT: We don't use "EXISTS (SELECT FROM profiles...)" directly
-- in policies because that causes infinite recursion. Instead, we use
-- the is_admin() SECURITY DEFINER function.

-- Drop all existing policies first (clean slate)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;

-- Policy 1: SELECT - Users can view their own profile, Admins can view all
CREATE POLICY "profiles_select_policy" ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id  -- User can see their own profile
    OR 
    public.is_admin()  -- Admin can see all profiles
  );

-- Policy 2: INSERT - Users can only insert their own profile (for new signups)
CREATE POLICY "profiles_insert_policy" ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy 3: UPDATE - Users can update their own profile, Admins can update all
CREATE POLICY "profiles_update_policy" ON public.profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id  -- User can update their own
    OR 
    public.is_admin()  -- Admin can update anyone
  )
  WITH CHECK (
    auth.uid() = id  -- User can only change their own data
    OR 
    public.is_admin()  -- Admin can change anyone's data
  );

-- Policy 4: DELETE - Only Admins can delete profiles (except themselves)
CREATE POLICY "profiles_delete_policy" ON public.profiles 
  FOR DELETE 
  USING (
    public.is_admin() AND id != auth.uid()  -- Admin can delete others, not themselves
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
