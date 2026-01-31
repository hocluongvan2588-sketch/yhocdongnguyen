'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  CreditCard,
  User,
  Calendar,
  ArrowRight,
  History,
  Eye
} from 'lucide-react';
import Header from '@/components/Header';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Order {
  id: string;
  order_code: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  created_at: string;
  paid_at: string | null;
  expires_at: string;
  package: {
    name: string;
    slug: string;
  };
}

interface Subscription {
  id: string;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string | null;
  package: {
    id: string;
    name: string;
    slug: string;
    description: string;
    features: string[];
  };
}

interface Profile {
  email: string;
  full_name: string | null;
  role: string;
}

interface QueryHistory {
  id: string;
  query_date: string;
  query_time: string;
  main_hexagram: string;
  changed_hexagram: string;
  mutual_hexagram: string;
  moving_line: number;
  patient_age: number | null;
  patient_gender: string | null;
  patient_subject: string | null;
  question: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [todayQueryCount, setTodayQueryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login?redirectTo=/dashboard');
        return;
      }
      
      setUser(user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email, full_name, role')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
      
      // Fetch subscriptions with package info
      const { data: subsData } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          started_at,
          expires_at,
          package:service_packages(id, name, slug, description, features)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (subsData) {
        setSubscriptions(subsData as unknown as Subscription[]);
      }
      
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id,
          order_code,
          amount,
          status,
          created_at,
          paid_at,
          expires_at,
          package:service_packages(name, slug)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (ordersData) {
        setOrders(ordersData as unknown as Order[]);
      }
      
      // Fetch query history
      const { data: historyData } = await supabase
        .from('query_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (historyData) {
        setQueryHistory(historyData as QueryHistory[]);
        // Count today's queries
        const today = new Date().toLocaleDateString('en-CA');
        const todayCount = historyData.filter(q => q.query_date === today).length;
        setTodayQueryCount(todayCount);
      }
      
      setLoading(false);
    };
    
    init();
  }, [router, supabase]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return <Badge className="bg-green-500">Hoạt động</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Chờ thanh toán</Badge>;
      case 'expired':
      case 'failed':
        return <Badge variant="destructive">Hết hạn</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Trang quản trị</h1>
          <p className="text-muted-foreground">Quản lý gói dịch vụ và đơn hàng của bạn</p>
        </div>
        
        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email || user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Họ tên</p>
                <p className="font-medium">{profile?.full_name || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loại tài khoản</p>
                <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                  {profile?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Lịch sử hỏi quẻ ({queryHistory.length})
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Gói dịch vụ ({subscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Đơn hàng ({orders.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Query History Tab */}
          <TabsContent value="history" className="space-y-4">
            {/* Today's usage info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Số lượt hỏi quẻ hôm nay</p>
                      <p className="text-sm text-muted-foreground">Giới hạn: 3 lượt/ngày</p>
                    </div>
                  </div>
                  <Badge 
                    variant={todayQueryCount >= 3 ? "destructive" : "secondary"}
                    className="text-lg px-4 py-1"
                  >
                    {todayQueryCount}/3
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {queryHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có lịch sử hỏi quẻ</h3>
                  <p className="text-muted-foreground mb-4">
                    Lịch sử các lần hỏi quẻ của bạn sẽ được lưu tại đây
                  </p>
                  <Button onClick={() => router.push('/')}>
                    Lập quẻ ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {queryHistory.map((query) => (
                  <Card key={query.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Quẻ tượng */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 border-primary/30">
                              {query.main_hexagram}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="outline" className="bg-secondary/10 border-secondary/30">
                              {query.changed_hexagram}
                            </Badge>
                            <Badge variant="secondary" className="ml-1">
                              Hào {query.moving_line}
                            </Badge>
                          </div>
                          
                          {/* Thông tin bệnh nhân */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {query.patient_gender && (
                              <span>{query.patient_gender}{query.patient_age ? `, ${query.patient_age} tuổi` : ''}</span>
                            )}
                            {query.patient_subject && query.patient_subject !== 'banthan' && (
                              <span>• Xem cho: {
                                query.patient_subject === 'cha' ? 'Cha' :
                                query.patient_subject === 'me' ? 'Mẹ' :
                                query.patient_subject === 'con' ? 'Con' :
                                query.patient_subject === 'vo' ? 'Vợ' :
                                query.patient_subject === 'chong' ? 'Chồng' :
                                query.patient_subject === 'anh-chi-em' ? 'Anh chị em' : 'Người khác'
                              }</span>
                            )}
                          </div>
                          
                          {/* Câu hỏi */}
                          {query.question && (
                            <p className="text-sm italic text-muted-foreground line-clamp-1">
                              "{query.question}"
                            </p>
                          )}
                        </div>
                        
                        {/* Thời gian */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(query.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            {subscriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có gói dịch vụ nào</h3>
                  <p className="text-muted-foreground mb-4">
                    Khám phá các gói dịch vụ của chúng tôi để bắt đầu
                  </p>
                  <Button onClick={() => router.push('/pricing')}>
                    Xem bảng giá
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {subscriptions.map((sub) => (
                  <Card key={sub.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{sub.package?.name}</CardTitle>
                          <CardDescription>{sub.package?.description}</CardDescription>
                        </div>
                        {getStatusBadge(sub.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Kích hoạt: {formatDate(sub.started_at)}</span>
                        </div>
                        
                        {sub.expires_at ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Hết hạn: {formatDate(sub.expires_at)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Trọn đời</span>
                          </div>
                        )}
                        
                        {sub.status === 'active' && sub.package?.slug && (
                          <Button 
                            className="w-full mt-4"
                            onClick={() => router.push(`/services/${sub.package.slug}`)}
                          >
                            Sử dụng dịch vụ
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
                  <p className="text-muted-foreground">
                    Các đơn hàng của bạn sẽ hiển thị ở đây
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Mã đơn</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Gói dịch vụ</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Số tiền</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Trạng thái</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Ngày tạo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {order.order_code}
                              </code>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {order.package?.name}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {formatPrice(order.amount)}
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              {order.status === 'pending' && new Date(order.expires_at) > new Date() && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/checkout/${order.package?.slug}`)}
                                >
                                  Thanh toán
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
