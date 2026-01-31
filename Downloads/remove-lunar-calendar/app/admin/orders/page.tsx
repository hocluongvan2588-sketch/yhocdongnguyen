'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Check, X, Eye, RefreshCw, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Order {
  id: string;
  user_id: string;
  package_id: string;
  order_code: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: string;
  transfer_content: string;
  paid_at: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  profiles: { email: string; full_name: string | null } | null;
  service_packages: { name: string; slug: string } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'reject'>('confirm');
  const [processing, setProcessing] = useState(false);

  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (email, full_name),
        service_packages:package_id (name, slug)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.order_code.toLowerCase().includes(searchLower) ||
      order.transfer_content.toLowerCase().includes(searchLower) ||
      order.profiles?.email?.toLowerCase().includes(searchLower) ||
      order.profiles?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { label: 'Chờ thanh toán', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      paid: { label: 'Đã thanh toán', variant: 'default', icon: <AlertCircle className="h-3 w-3" /> },
      confirmed: { label: 'Đã xác nhận', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      failed: { label: 'Thất bại', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
      cancelled: { label: 'Đã hủy', variant: 'outline', icon: <X className="h-3 w-3" /> },
      refunded: { label: 'Đã hoàn tiền', variant: 'outline', icon: <RefreshCw className="h-3 w-3" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;
    setProcessing(true);

    try {
      if (actionType === 'confirm') {
        // Update order status
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', selectedOrder.id);

        if (orderError) throw orderError;

        // Create or update subscription
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: selectedOrder.user_id,
            package_id: selectedOrder.package_id,
            order_id: selectedOrder.id,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            usage_count: 0,
          }, {
            onConflict: 'user_id,package_id',
          });

        if (subError) throw subError;

      } else {
        // Reject order
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'failed',
            notes: 'Đơn hàng bị từ chối bởi admin',
          })
          .eq('id', selectedOrder.id);

        if (error) throw error;
      }

      await fetchOrders();
      setConfirmDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      setProcessing(false);
    }
  };

  const openConfirmDialog = (order: Order, type: 'confirm' | 'reject') => {
    setSelectedOrder(order);
    setActionType(type);
    setConfirmDialogOpen(true);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">Xem và xử lý các đơn hàng thanh toán</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cần xác nhận</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xác nhận</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <CardDescription>Quản lý và xử lý đơn hàng từ khách hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, email, tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ thanh toán</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchOrders} className="bg-transparent">
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Không có đơn hàng nào
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Gói dịch vụ</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.order_code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.service_packages?.name}</TableCell>
                      <TableCell className="font-medium">{formatPrice(order.amount)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: vi })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === 'paid' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openConfirmDialog(order, 'confirm')}
                              >
                                <Check className="mr-1 h-3 w-3" />
                                Xác nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openConfirmDialog(order, 'reject')}
                              >
                                <X className="mr-1 h-3 w-3" />
                                Từ chối
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
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

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'confirm' ? 'Xác nhận đơn hàng' : 'Từ chối đơn hàng'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'confirm'
                ? 'Xác nhận thanh toán và kích hoạt gói dịch vụ cho khách hàng?'
                : 'Từ chối đơn hàng này? Khách hàng sẽ cần liên hệ để được hỗ trợ.'}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-2 rounded-lg bg-muted p-4">
              <p><strong>Mã đơn:</strong> {selectedOrder.order_code}</p>
              <p><strong>Khách hàng:</strong> {selectedOrder.profiles?.email}</p>
              <p><strong>Gói:</strong> {selectedOrder.service_packages?.name}</p>
              <p><strong>Số tiền:</strong> {formatPrice(selectedOrder.amount)}</p>
              <p><strong>Nội dung CK:</strong> {selectedOrder.transfer_content}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="bg-transparent">
              Hủy
            </Button>
            <Button
              variant={actionType === 'confirm' ? 'default' : 'destructive'}
              onClick={handleConfirmOrder}
              disabled={processing}
            >
              {processing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : actionType === 'confirm' ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              {actionType === 'confirm' ? 'Xác nhận' : 'Từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
