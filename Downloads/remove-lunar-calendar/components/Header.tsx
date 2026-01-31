'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Menu, Home, BookOpen, LogIn, LogOut, User, Shield, Sparkles, CreditCard, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Header({
  title = 'Mai Hoa Tâm Pháp',
  subtitle = 'Dịch học Đông y',
  showBackButton = false,
  backUrl = '/',
}: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;
    const supabase = createClient();
    
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;
        
        setUser(user);
        
        if (user) {
          // Check if user is admin - use maybeSingle to avoid errors
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!isMounted) return;
          setIsAdmin(profile?.role === 'admin');
        }
      } catch (error) {
        if (!isMounted) return;
        // Only log non-abort errors
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('[v0] Error getting user:', error);
        }
        setUser(null);
        setIsAdmin(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          if (isMounted) {
            setIsAdmin(profile?.role === 'admin');
          }
        } catch {
          if (isMounted) {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl">☯</span>
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </header>
    );
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const menuItems = [
    { label: 'Trang chủ', href: '/', icon: Home },
    { label: 'Tượng Số Bát Quái', href: '/services/tuong-so-bat-quai', icon: Sparkles },
    { label: 'Phương pháp', href: '/methodology', icon: BookOpen },
    { label: 'Bảng giá', href: '/pricing', icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo - clickable to go home */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl">☯</span>
          </div>
          <div className="hidden sm:block text-left">
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </button>

        {/* Right: Auth + Back button (desktop only) + Mobile menu */}
        <div className="flex items-center gap-2">
          {/* Desktop: Auth buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Shield className="h-4 w-4" />
                    {'Admin'}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {'Gói của tôi'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      {'Đăng xuất'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/auth/login')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {'Đăng nhập'}
              </Button>
            )}
          </div>

          {/* Back button - desktop only */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(backUrl)}
              className="hidden sm:flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {'Quay lại'}
            </Button>
          )}

          {/* Mobile menu */}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {menuItems.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* Mobile: Auth menu items */}
              {!loading && (
                <>
                  {user ? (
                    <>
                      <DropdownMenuItem
                          onClick={() => {
                            router.push('/dashboard');
                            setMenuOpen(false);
                          }}
                          className="flex items-center gap-2"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {'Gói của tôi'}
                        </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem
                          onClick={() => {
                            router.push('/admin');
                            setMenuOpen(false);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          {'Admin'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          handleSignOut();
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        {'Đăng xuất'}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/auth/login');
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      {'Đăng nhập'}
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
