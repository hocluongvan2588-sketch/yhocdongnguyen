'use client';

import React from "react"

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Package, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ServicePackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  service_type: 'basic' | 'tuong_so' | 'premium';
  price: number;
  original_price: number | null;
  currency: string;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  basic: 'Cơ bản',
  tuong_so: 'Tượng Số',
  premium: 'Chuyên sâu',
};

const SERVICE_TYPE_COLORS: Record<string, string> = {
  basic: 'bg-muted text-muted-foreground',
  tuong_so: 'bg-primary text-primary-foreground',
  premium: 'bg-amber-500 text-white',
};

export default function ServicesAdminPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<ServicePackage | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    service_type: 'basic' as 'basic' | 'tuong_so' | 'premium',
    price: 0,
    original_price: '',
    features: '',
    is_active: true,
    is_featured: false,
    sort_order: 0,
  });

  const supabase = createClient();

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Lỗi tải dữ liệu: ' + error.message);
    } else {
      setPackages(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      service_type: 'basic',
      price: 0,
      original_price: '',
      features: '',
      is_active: true,
      is_featured: false,
      sort_order: 0,
    });
    setEditingPackage(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description || '',
      service_type: pkg.service_type,
      price: pkg.price,
      original_price: pkg.original_price?.toString() || '',
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      is_active: pkg.is_active,
      is_featured: pkg.is_featured,
      sort_order: pkg.sort_order,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const featuresArray = formData.features
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const packageData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      service_type: formData.service_type,
      price: formData.price,
      original_price: formData.original_price ? parseInt(formData.original_price) : null,
      features: featuresArray,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      sort_order: formData.sort_order,
    };

    if (editingPackage) {
      const { error } = await supabase
        .from('service_packages')
        .update(packageData)
        .eq('id', editingPackage.id);

      if (error) {
        toast.error('Lỗi cập nhật: ' + error.message);
      } else {
        toast.success('Đã cập nhật gói dịch vụ');
        setDialogOpen(false);
        fetchPackages();
      }
    } else {
      const { error } = await supabase.from('service_packages').insert(packageData);

      if (error) {
        toast.error('Lỗi tạo mới: ' + error.message);
      } else {
        toast.success('Đã tạo gói dịch vụ mới');
        setDialogOpen(false);
        fetchPackages();
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;

    const { error } = await supabase
      .from('service_packages')
      .delete()
      .eq('id', packageToDelete.id);

    if (error) {
      toast.error('Lỗi xóa: ' + error.message);
    } else {
      toast.success('Đã xóa gói dịch vụ');
      fetchPackages();
    }

    setDeleteDialogOpen(false);
    setPackageToDelete(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Gói dịch vụ</h1>
          <p className="text-muted-foreground">
            Cấu hình các gói dịch vụ và giá cả
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm gói mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Danh sách gói dịch vụ
          </CardTitle>
          <CardDescription>
            {packages.length} gói dịch vụ đang hoạt động
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Tên gói</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Nổi bật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.sort_order}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground">{pkg.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={SERVICE_TYPE_COLORS[pkg.service_type]}>
                        {SERVICE_TYPE_LABELS[pkg.service_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">{formatPrice(pkg.price)}</p>
                        {pkg.original_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(pkg.original_price)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                        {pkg.is_active ? 'Hoạt động' : 'Tạm ẩn'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {pkg.is_featured && (
                        <Star className="h-5 w-5 text-amber-500 mx-auto fill-amber-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(pkg)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive bg-transparent"
                          onClick={() => {
                            setPackageToDelete(pkg);
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
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Chỉnh sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho gói dịch vụ
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên gói</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editingPackage ? formData.slug : generateSlug(e.target.value),
                    });
                  }}
                  placeholder="VD: Gói Cơ bản"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="VD: basic"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về gói dịch vụ"
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="service_type">Loại gói</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value: 'basic' | 'tuong_so' | 'premium') =>
                    setFormData({ ...formData, service_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Cơ bản</SelectItem>
                    <SelectItem value="tuong_so">Tượng Số</SelectItem>
                    <SelectItem value="premium">Chuyên sâu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Giá gốc (VND)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) =>
                    setFormData({ ...formData, original_price: e.target.value })
                  }
                  placeholder="Để trống nếu không giảm giá"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Tính năng (mỗi dòng một tính năng)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Gieo quẻ tự động&#10;Phân tích bằng AI&#10;Lưu lịch sử"
                rows={5}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Thứ tự hiển thị</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Hoạt động</Label>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                />
                <Label htmlFor="is_featured">Nổi bật</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPackage ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa gói &quot;{packageToDelete?.name}&quot;? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
