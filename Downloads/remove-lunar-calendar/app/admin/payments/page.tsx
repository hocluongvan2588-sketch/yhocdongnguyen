'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Star,
  QrCode,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  branch: string | null;
  qr_code_url: string | null;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  service_packages: { name: string } | null;
}

interface RevenueStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  successRate: number;
  pendingCount: number;
  confirmedCount: number;
  failedCount: number;
}

export default function AdminPaymentsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Form state
  const [formData, setFormData] = useState({
    bank_name: 'Timo',
    account_number: '',
    account_holder: '',
    branch: '',
    qr_code_url: '',
    is_active: true,
    is_primary: false,
  });

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);

    // Fetch bank accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('Error fetching bank accounts:', accountsError);
    } else {
      setBankAccounts(accounts || []);
    }

    // Fetch orders for statistics
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, amount, status, created_at, paid_at, service_packages:package_id (name)')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    } else {
      setOrders(ordersData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate revenue statistics
  const stats = useMemo<RevenueStats>(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    const confirmedOrders = orders.filter(o => o.status === 'confirmed');
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid');
    const failedOrders = orders.filter(o => o.status === 'failed' || o.status === 'cancelled');

    const todayRevenue = confirmedOrders
      .filter(o => new Date(o.paid_at || o.created_at) >= todayStart)
      .reduce((sum, o) => sum + Number(o.amount), 0);

    const weekRevenue = confirmedOrders
      .filter(o => new Date(o.paid_at || o.created_at) >= weekStart)
      .reduce((sum, o) => sum + Number(o.amount), 0);

    const monthRevenue = confirmedOrders
      .filter(o => new Date(o.paid_at || o.created_at) >= monthStart)
      .reduce((sum, o) => sum + Number(o.amount), 0);

    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + Number(o.amount), 0);

    const totalProcessed = confirmedOrders.length + failedOrders.length;
    const successRate = totalProcessed > 0 ? (confirmedOrders.length / totalProcessed) * 100 : 0;

    return {
      today: todayRevenue,
      thisWeek: weekRevenue,
      thisMonth: monthRevenue,
      total: totalRevenue,
      successRate,
      pendingCount: pendingOrders.length,
      confirmedCount: confirmedOrders.length,
      failedCount: failedOrders.length,
    };
  }, [orders]);

  // Revenue by package
  const revenueByPackage = useMemo(() => {
    const packageMap = new Map<string, number>();
    
    orders
      .filter(o => o.status === 'confirmed')
      .forEach(o => {
        const packageName = o.service_packages?.name || 'Khác';
        packageMap.set(packageName, (packageMap.get(packageName) || 0) + Number(o.amount));
      });

    return Array.from(packageMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // Revenue trend (last N days based on timeRange)
  const revenueTrend = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const now = new Date();
    const trend: { date: string; revenue: number; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.paid_at || o.created_at);
        return o.status === 'confirmed' && orderDate >= dayStart && orderDate <= dayEnd;
      });

      trend.push({
        date: format(date, 'dd/MM', { locale: vi }),
        revenue: dayOrders.reduce((sum, o) => sum + Number(o.amount), 0),
        count: dayOrders.length,
      });
    }

    return trend;
  }, [orders, timeRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const resetForm = () => {
    setFormData({
      bank_name: 'Timo',
      account_number: '',
      account_holder: '',
      branch: '',
      qr_code_url: '',
      is_active: true,
      is_primary: false,
    });
    setEditingAccount(null);
  };

  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      account_holder: account.account_holder,
      branch: account.branch || '',
      qr_code_url: account.qr_code_url || '',
      is_active: account.is_active,
      is_primary: account.is_primary,
    });
    setDialogOpen(true);
  };

  const handleSaveAccount = async () => {
    setSaving(true);

    try {
      // If setting as primary, unset other primary accounts
      if (formData.is_primary) {
        await supabase
          .from('bank_accounts')
          .update({ is_primary: false })
          .neq('id', editingAccount?.id || '');
      }

      if (editingAccount) {
        // Update existing
        const { error } = await supabase
          .from('bank_accounts')
          .update({
            bank_name: formData.bank_name,
            account_number: formData.account_number,
            account_holder: formData.account_holder,
            branch: formData.branch || null,
            qr_code_url: formData.qr_code_url || null,
            is_active: formData.is_active,
            is_primary: formData.is_primary,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAccount.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('bank_accounts')
          .insert({
            bank_name: formData.bank_name,
            account_number: formData.account_number,
            account_holder: formData.account_holder,
            branch: formData.branch || null,
            qr_code_url: formData.qr_code_url || null,
            is_active: formData.is_active,
            is_primary: formData.is_primary,
          });

        if (error) throw error;
      }

      await fetchData();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving bank account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountToDelete.id);

      if (error) throw error;

      await fetchData();
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error('Error deleting bank account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (account: BankAccount) => {
    setSaving(true);

    try {
      // Unset all primary
      await supabase
        .from('bank_accounts')
        .update({ is_primary: false })
        .neq('id', '');

      // Set this one as primary
      await supabase
        .from('bank_accounts')
        .update({ is_primary: true })
        .eq('id', account.id);

      await fetchData();
    } catch (error) {
      console.error('Error setting primary:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý thanh toán</h1>
          <p className="text-muted-foreground">Thống kê doanh thu và cấu hình ngân hàng</p>
        </div>
        <Button variant="outline" onClick={fetchData} className="bg-transparent">
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="statistics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Thống kê
          </TabsTrigger>
          <TabsTrigger value="bank-config" className="gap-2">
            <Building2 className="h-4 w-4" />
            Cấu hình ngân hàng
          </TabsTrigger>
        </TabsList>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          {/* Revenue Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatPrice(stats.today)}</div>
                <p className="text-xs text-muted-foreground">Doanh thu ngày</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tuần này</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatPrice(stats.thisWeek)}</div>
                <p className="text-xs text-muted-foreground">Doanh thu tuần</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tháng này</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatPrice(stats.thisMonth)}</div>
                <p className="text-xs text-muted-foreground">Doanh thu tháng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng cộng</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.total)}</div>
                <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Status Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Đơn hoàn thành / Tổng xử lý</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
                <p className="text-xs text-muted-foreground">Đơn đang chờ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã xác nhận</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.confirmedCount}</div>
                <p className="text-xs text-muted-foreground">Đơn hoàn thành</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thất bại</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failedCount}</div>
                <p className="text-xs text-muted-foreground">Đơn hủy/thất bại</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Xu hướng doanh thu</CardTitle>
                  <CardDescription>Biểu đồ doanh thu theo thời gian</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 ngày</SelectItem>
                    <SelectItem value="30d">30 ngày</SelectItem>
                    <SelectItem value="90d">90 ngày</SelectItem>
                    <SelectItem value="all">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {/* Simple bar chart visualization */}
                <div className="flex h-full items-end gap-1 overflow-x-auto pb-6">
                  {revenueTrend.map((day, i) => {
                    const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);
                    const height = (day.revenue / maxRevenue) * 100;
                    return (
                      <div key={i} className="group relative flex flex-1 min-w-[20px] flex-col items-center">
                        <div
                          className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        <span className="absolute -bottom-6 text-[10px] text-muted-foreground">
                          {i % Math.ceil(revenueTrend.length / 10) === 0 ? day.date : ''}
                        </span>
                        {/* Tooltip */}
                        <div className="absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                          <p className="font-medium">{day.date}</p>
                          <p>{formatPrice(day.revenue)}</p>
                          <p>{day.count} đơn</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Package */}
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo gói dịch vụ</CardTitle>
              <CardDescription>Phân bổ doanh thu theo từng loại gói</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueByPackage.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu doanh thu</p>
              ) : (
                <div className="space-y-4">
                  {revenueByPackage.map((pkg, i) => {
                    const maxRevenue = Math.max(...revenueByPackage.map(p => p.revenue));
                    const width = (pkg.revenue / maxRevenue) * 100;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-muted-foreground">{formatPrice(pkg.revenue)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Config Tab */}
        <TabsContent value="bank-config" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tài khoản ngân hàng</CardTitle>
                  <CardDescription>Quản lý thông tin tài khoản nhận thanh toán</CardDescription>
                </div>
                <Button onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm tài khoản
                </Button>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAccount ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
                      </DialogTitle>
                      <DialogDescription>
                        Nhập thông tin tài khoản ngân hàng để nhận thanh toán
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bank_name">Ngân hàng</Label>
                        <Select
                          value={formData.bank_name}
                          onValueChange={(v) => setFormData({ ...formData, bank_name: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Timo">Timo (VPBank)</SelectItem>
                            <SelectItem value="VPBank">VPBank</SelectItem>
                            <SelectItem value="Vietcombank">Vietcombank</SelectItem>
                            <SelectItem value="Techcombank">Techcombank</SelectItem>
                            <SelectItem value="MB Bank">MB Bank</SelectItem>
                            <SelectItem value="ACB">ACB</SelectItem>
                            <SelectItem value="BIDV">BIDV</SelectItem>
                            <SelectItem value="Agribank">Agribank</SelectItem>
                            <SelectItem value="Sacombank">Sacombank</SelectItem>
                            <SelectItem value="TPBank">TPBank</SelectItem>
                            <SelectItem value="Momo">Momo</SelectItem>
                            <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="account_number">Số tài khoản</Label>
                        <Input
                          id="account_number"
                          placeholder="Nhập số tài khoản"
                          value={formData.account_number}
                          onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="account_holder">Chủ tài khoản</Label>
                        <Input
                          id="account_holder"
                          placeholder="Nhập tên chủ tài khoản"
                          value={formData.account_holder}
                          onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="branch">Chi nhánh (tùy chọn)</Label>
                        <Input
                          id="branch"
                          placeholder="Nhập chi nhánh"
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="qr_code_url">URL mã QR (tùy chọn)</Label>
                        <Input
                          id="qr_code_url"
                          placeholder="https://..."
                          value={formData.qr_code_url}
                          onChange={(e) => setFormData({ ...formData, qr_code_url: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                          />
                          <Label htmlFor="is_active">Kích hoạt</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            id="is_primary"
                            checked={formData.is_primary}
                            onCheckedChange={(v) => setFormData({ ...formData, is_primary: v })}
                          />
                          <Label htmlFor="is_primary">Tài khoản chính</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">
                        Hủy
                      </Button>
                      <Button onClick={handleSaveAccount} disabled={saving || !formData.account_number || !formData.account_holder}>
                        {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        {editingAccount ? 'Cập nhật' : 'Thêm mới'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {bankAccounts.length === 0 ? (
                <div className="py-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Chưa có tài khoản nào</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thêm tài khoản ngân hàng để bắt đầu nhận thanh toán
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngân hàng</TableHead>
                        <TableHead>Số tài khoản</TableHead>
                        <TableHead>Chủ tài khoản</TableHead>
                        <TableHead>Chi nhánh</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{account.bank_name}</span>
                              {account.is_primary && (
                                <Badge variant="default" className="ml-1">
                                  <Star className="mr-1 h-3 w-3" />
                                  Chính
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{account.account_number}</TableCell>
                          <TableCell>{account.account_holder}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {account.branch || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>
                              {account.is_active ? 'Hoạt động' : 'Tắt'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!account.is_primary && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSetPrimary(account)}
                                  disabled={saving}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              {account.qr_code_url && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(account.qr_code_url!, '_blank')}
                                >
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(account)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setAccountToDelete(account);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timo Configuration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Cấu hình Timo Bank
              </CardTitle>
              <CardDescription>
                Thông tin cấu hình webhook và xử lý giao dịch tự động từ Timo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h4 className="font-medium text-amber-800">Lưu ý quan trọng</h4>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-700">
                  <li>Hệ thống tự động nhận email thông báo từ Timo để xác nhận giao dịch</li>
                  <li>Email cần được forward từ <code className="rounded bg-amber-100 px-1">support@timo.vn</code></li>
                  <li>Nội dung chuyển khoản phải chứa mã <code className="rounded bg-amber-100 px-1">NAPTEN + UserID</code></li>
                  <li>Webhook endpoint: <code className="rounded bg-amber-100 px-1">/api/webhooks/payment</code></li>
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Webhook URL</h4>
                  <code className="block rounded bg-muted p-2 text-sm">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/payment
                  </code>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Headers cần thiết</h4>
                  <code className="block rounded bg-muted p-2 text-sm">
                    X-Webhook-Secret: ADMIN_WEBHOOK_KEY
                  </code>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-medium">Cấu trúc nội dung chuyển khoản</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Format:</strong> <code className="rounded bg-muted px-1">NAPTEN{'{'}8_ký_tự_đầu_UserID{'}'}{'{'}4_ký_tự_ngẫu_nhiên{'}'}</code></p>
                  <p><strong>Ví dụ:</strong> <code className="rounded bg-muted px-1">NAPTENc6f12c0d4A2B</code></p>
                  <p className="text-muted-foreground">Hệ thống sẽ tự động trích xuất UserID từ nội dung để xác nhận đơn hàng</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {accountToDelete && (
            <div className="rounded-lg bg-muted p-4">
              <p><strong>Ngân hàng:</strong> {accountToDelete.bank_name}</p>
              <p><strong>Số TK:</strong> {accountToDelete.account_number}</p>
              <p><strong>Chủ TK:</strong> {accountToDelete.account_holder}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-transparent">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={saving}>
              {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
