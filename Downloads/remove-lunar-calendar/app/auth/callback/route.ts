import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Support both 'next' and 'redirectTo' params for flexibility
  const next = searchParams.get('next') ?? searchParams.get('redirectTo') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Get current user and ensure profile exists
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        // Create profile if it doesn't exist
        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            role: 'user', // Default role
          });
        }
      }
      
      // Ensure the redirect path is properly decoded
      const redirectPath = decodeURIComponent(next);
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Redirect to error page on failure
  return NextResponse.redirect(`${origin}/auth/error?message=Could not authenticate user`);
}
