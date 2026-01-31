'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Copy, Loader2, QrCode, ArrowLeft, Clock, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import type { User } from '@supabase/supabase-js';

interface ServicePackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  features: string[];
}

interface BankAccount {
  bank_name: string;
  account_number: string;
  account_holder: string;
}

interface Order {
  id: string;
  order_code: string;
  amount: number;
  status: string;
  expires_at: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [pkg, setPkg] = useState<ServicePackage | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/auth/login?redirectTo=/checkout/${slug}`);
        return;
      }
      setUser(user);
      
      // Fetch package
      const { data: pkgData, error: pkgError } = await supabase
        .from('service_packages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (pkgError || !pkgData) {
        setError('Gói dịch vụ không tồn tại');
        setLoading(false);
        return;
      }
      setPkg(pkgData);
      
      // Fetch bank account
      const { data: bankData } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_primary', true)
        .eq('is_active', true)
        .single();
      
      if (bankData) {
        setBankAccount(bankData);
      }
      
      // Check for existing pending order
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('package_id', pkgData.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (existingOrder) {
        setOrder(existingOrder);
        setLoading(false);
      } else {
        // Auto-create order if no existing pending order
        setLoading(false);
        await autoCreateOrder(user.id, pkgData);
      }
    };
    
    init();
  }, [slug, router, supabase]);

  // Auto-create order function
  const autoCreateOrder = async (userId: string, pkgData: ServicePackage) => {
    setCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkgData.id,
          packageSlug: pkgData.slug,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo đơn hàng');
      }
      
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const getQRCodeUrl = () => {
    if (!bankAccount || !order || !pkg) return null;
    // VietQR format - use current package price, not order amount (in case price changed)
    return `https://img.vietqr.io/image/${bankAccount.bank_name}-${bankAccount.account_number}-compact2.png?amount=${pkg.price}&addInfo=${order.order_code}&accountName=${encodeURIComponent(bankAccount.account_holder)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && !pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Lỗi</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={() => router.push('/pricing')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại bảng giá
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.push('/pricing')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại bảng giá
        </Button>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
              <CardDescription>Chi tiết gói dịch vụ bạn đang mua</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{pkg?.name}</h3>
                <p className="text-sm text-muted-foreground">{pkg?.description}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Tính năng bao gồm:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {pkg?.features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Thành tiền:</span>
                <div className="text-right">
                  {pkg?.original_price && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(pkg.original_price)}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(pkg?.price || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thanh toán chuyển khoản
              </CardTitle>
              <CardDescription>
                Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {creating ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Đang tạo mã thanh toán...</p>
                </div>
              ) : error && !order ? (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive mb-4">{error}</p>
                  <Button onClick={() => pkg && user && autoCreateOrder(user.id, pkg)} size="lg">
                    <QrCode className="mr-2 h-4 w-4" />
                    Thử lại
                  </Button>
                </div>
              ) : !order ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Đang khởi tạo...</p>
                </div>
              ) : (
                <>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Mã thanh toán</AlertTitle>
                    <AlertDescription>
                      Đơn hàng sẽ hết hạn sau 24 giờ. Vui lòng thanh toán trước thời hạn.
                    </AlertDescription>
                  </Alert>
                  
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      <Image
                        src={getQRCodeUrl() || ''}
                        alt="QR Code thanh toán"
                        width={200}
                        height={200}
                        className="rounded"
                        unoptimized
                      />
                    </div>
                  </div>
                  
                  {/* Bank Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Ngân hàng</p>
                        <p className="font-medium">{bankAccount?.bank_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Số tài khoản</p>
                        <p className="font-medium font-mono">{bankAccount?.account_number}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankAccount?.account_number || '', 'account')}
                      >
                        {copied === 'account' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Chủ tài khoản</p>
                        <p className="font-medium">{bankAccount?.account_holder}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Số tiền</p>
                        <p className="font-medium text-primary">{formatPrice(pkg?.price || 0)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard((pkg?.price || 0).toString(), 'amount')}
                      >
                        {copied === 'amount' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary">
                      <div>
                        <p className="text-xs text-muted-foreground">Nội dung chuyển khoản</p>
                        <p className="font-bold font-mono text-primary">{order.order_code}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.order_code, 'code')}
                      >
                        {copied === 'code' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertDescription className="text-yellow-800 text-sm">
                      <strong>Quan trọng:</strong> Vui lòng nhập chính xác nội dung chuyển khoản 
                      <strong className="font-mono"> {order.order_code}</strong> để hệ thống tự động xác nhận.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Sau khi chuyển khoản, đơn hàng sẽ được xác nhận trong vài phút.</p>
                    <p>Kiểm tra trạng thái tại <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/dashboard')}>Trang quản trị</Button></p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
