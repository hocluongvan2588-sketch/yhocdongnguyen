'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Pill, BookOpen, Search
} from 'lucide-react';
import { toast } from 'sonner';

interface ViThuoc {
  id: string;
  ten_thuoc: string;
  ten_khoa_hoc: string | null;
  ten_khac: string[] | null;
  ngu_hanh: string | null;
  tinh: string | null;
  vi: string[] | null;
  quy_kinh: string[] | null;
  cong_dung: string | null;
  chu_tri: string[] | null;
  lieu_luong: string | null;
  kieng_ky: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface PhuongThuoc {
  id: string;
  ten_phuong: string;
  ten_han: string | null;
  xuat_xu: string | null;
  ngu_hanh_chinh: string | null;
  tang_phu_chinh: string[] | null;
  thanh_phan: { ten: string; lieu: string }[] | null;
  cach_dung: string | null;
  chi_dinh: string[] | null;
  chong_chi_dinh: string[] | null;
  luu_y: string | null;
  loai_benh: string[] | null;
  muc_do_benh: string[] | null;
  do_uu_tien: number;
  is_active: boolean;
  created_at: string;
}

const NGU_HANH_OPTIONS = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
const TINH_OPTIONS = ['Hàn', 'Lương', 'Bình', 'Ôn', 'Nhiệt'];

export default function MedicineAdminPage() {
  const [activeTab, setActiveTab] = useState('vi-thuoc');
  const [viThuocList, setViThuocList] = useState<ViThuoc[]>([]);
  const [phuongThuocList, setPhuongThuocList] = useState<PhuongThuoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [viThuocDialogOpen, setViThuocDialogOpen] = useState(false);
  const [phuongThuocDialogOpen, setPhuongThuocDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [editingViThuoc, setEditingViThuoc] = useState<ViThuoc | null>(null);
  const [editingPhuongThuoc, setEditingPhuongThuoc] = useState<PhuongThuoc | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'vi' | 'phuong'; item: ViThuoc | PhuongThuoc } | null>(null);

  // Form data for Vi Thuoc
  const [viThuocForm, setViThuocForm] = useState({
    ten_thuoc: '',
    ten_khoa_hoc: '',
    ten_khac: '',
    ngu_hanh: '',
    tinh: '',
    vi: '',
    quy_kinh: '',
    cong_dung: '',
    chu_tri: '',
    lieu_luong: '',
    kieng_ky: '',
    is_active: true,
  });

  // Form data for Phuong Thuoc
  const [phuongThuocForm, setPhuongThuocForm] = useState({
    ten_phuong: '',
    ten_han: '',
    xuat_xu: '',
    ngu_hanh_chinh: '',
    tang_phu_chinh: '',
    thanh_phan: '',
    cach_dung: '',
    chi_dinh: '',
    chong_chi_dinh: '',
    luu_y: '',
    loai_benh: '',
    muc_do_benh: '',
    do_uu_tien: 1,
    is_active: true,
  });

  const supabase = createClient();

  const fetchViThuoc = useCallback(async () => {
    const { data, error } = await supabase
      .from('nam_duoc_vi_thuoc')
      .select('*')
      .order('ten_thuoc', { ascending: true });

    if (error) {
      toast.error('Lỗi tải vị thuốc: ' + error.message);
    } else {
      setViThuocList(data || []);
    }
  }, [supabase]);

  const fetchPhuongThuoc = useCallback(async () => {
    const { data, error } = await supabase
      .from('nam_duoc_phuong_thuoc')
      .select('*')
      .order('do_uu_tien', { ascending: true });

    if (error) {
      toast.error('Lỗi tải bài thuốc: ' + error.message);
    } else {
      setPhuongThuocList(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchViThuoc(), fetchPhuongThuoc()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchViThuoc, fetchPhuongThuoc]);

  // Filter data based on search
  const filteredViThuoc = viThuocList.filter(v => 
    v.ten_thuoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.ten_khoa_hoc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPhuongThuoc = phuongThuocList.filter(p => 
    p.ten_phuong.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ten_han?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset forms
  const resetViThuocForm = () => {
    setViThuocForm({
      ten_thuoc: '',
      ten_khoa_hoc: '',
      ten_khac: '',
      ngu_hanh: '',
      tinh: '',
      vi: '',
      quy_kinh: '',
      cong_dung: '',
      chu_tri: '',
      lieu_luong: '',
      kieng_ky: '',
      is_active: true,
    });
    setEditingViThuoc(null);
  };

  const resetPhuongThuocForm = () => {
    setPhuongThuocForm({
      ten_phuong: '',
      ten_han: '',
      xuat_xu: '',
      ngu_hanh_chinh: '',
      tang_phu_chinh: '',
      thanh_phan: '',
      cach_dung: '',
      chi_dinh: '',
      chong_chi_dinh: '',
      luu_y: '',
      loai_benh: '',
      muc_do_benh: '',
      do_uu_tien: 1,
      is_active: true,
    });
    setEditingPhuongThuoc(null);
  };

  // Open dialogs
  const openViThuocDialog = (item?: ViThuoc) => {
    if (item) {
      setEditingViThuoc(item);
      setViThuocForm({
        ten_thuoc: item.ten_thuoc,
        ten_khoa_hoc: item.ten_khoa_hoc || '',
        ten_khac: item.ten_khac?.join(', ') || '',
        ngu_hanh: item.ngu_hanh || '',
        tinh: item.tinh || '',
        vi: item.vi?.join(', ') || '',
        quy_kinh: item.quy_kinh?.join(', ') || '',
        cong_dung: item.cong_dung || '',
        chu_tri: item.chu_tri?.join(', ') || '',
        lieu_luong: item.lieu_luong || '',
        kieng_ky: item.kieng_ky?.join(', ') || '',
        is_active: item.is_active,
      });
    } else {
      resetViThuocForm();
    }
    setViThuocDialogOpen(true);
  };

  const openPhuongThuocDialog = (item?: PhuongThuoc) => {
    if (item) {
      setEditingPhuongThuoc(item);
      setPhuongThuocForm({
        ten_phuong: item.ten_phuong,
        ten_han: item.ten_han || '',
        xuat_xu: item.xuat_xu || '',
        ngu_hanh_chinh: item.ngu_hanh_chinh || '',
        tang_phu_chinh: item.tang_phu_chinh?.join(', ') || '',
        thanh_phan: item.thanh_phan?.map(t => `${t.ten}: ${t.lieu}`).join('\n') || '',
        cach_dung: item.cach_dung || '',
        chi_dinh: item.chi_dinh?.join('\n') || '',
        chong_chi_dinh: item.chong_chi_dinh?.join('\n') || '',
        luu_y: item.luu_y || '',
        loai_benh: item.loai_benh?.join(', ') || '',
        muc_do_benh: item.muc_do_benh?.join(', ') || '',
        do_uu_tien: item.do_uu_tien,
        is_active: item.is_active,
      });
    } else {
      resetPhuongThuocForm();
    }
    setPhuongThuocDialogOpen(true);
  };

  // Save Vi Thuoc
  const handleSaveViThuoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const parseArray = (str: string) => str.split(',').map(s => s.trim()).filter(s => s);

    const data = {
      ten_thuoc: viThuocForm.ten_thuoc,
      ten_khoa_hoc: viThuocForm.ten_khoa_hoc || null,
      ten_khac: parseArray(viThuocForm.ten_khac),
      ngu_hanh: viThuocForm.ngu_hanh || null,
      tinh: viThuocForm.tinh || null,
      vi: parseArray(viThuocForm.vi),
      quy_kinh: parseArray(viThuocForm.quy_kinh),
      cong_dung: viThuocForm.cong_dung || null,
      chu_tri: parseArray(viThuocForm.chu_tri),
      lieu_luong: viThuocForm.lieu_luong || null,
      kieng_ky: parseArray(viThuocForm.kieng_ky),
      is_active: viThuocForm.is_active,
    };

    if (editingViThuoc) {
      const { error } = await supabase
        .from('nam_duoc_vi_thuoc')
        .update(data)
        .eq('id', editingViThuoc.id);

      if (error) {
        toast.error('Lỗi cập nhật: ' + error.message);
      } else {
        toast.success('Đã cập nhật vị thuốc');
        setViThuocDialogOpen(false);
        fetchViThuoc();
      }
    } else {
      const { error } = await supabase.from('nam_duoc_vi_thuoc').insert(data);

      if (error) {
        toast.error('Lỗi tạo mới: ' + error.message);
      } else {
        toast.success('Đã thêm vị thuốc mới');
        setViThuocDialogOpen(false);
        fetchViThuoc();
      }
    }

    setSaving(false);
  };

  // Save Phuong Thuoc
  const handleSavePhuongThuoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const parseArray = (str: string) => str.split(',').map(s => s.trim()).filter(s => s);
    const parseLines = (str: string) => str.split('\n').map(s => s.trim()).filter(s => s);
    
    // Parse thanh phan format: "Ten: Lieu" per line
    const parseThanhPhan = (str: string) => {
      return parseLines(str).map(line => {
        const [ten, lieu] = line.split(':').map(s => s.trim());
        return { ten: ten || '', lieu: lieu || '' };
      }).filter(t => t.ten);
    };

    const data = {
      ten_phuong: phuongThuocForm.ten_phuong,
      ten_han: phuongThuocForm.ten_han || null,
      xuat_xu: phuongThuocForm.xuat_xu || null,
      ngu_hanh_chinh: phuongThuocForm.ngu_hanh_chinh || null,
      tang_phu_chinh: parseArray(phuongThuocForm.tang_phu_chinh),
      thanh_phan: parseThanhPhan(phuongThuocForm.thanh_phan),
      cach_dung: phuongThuocForm.cach_dung || null,
      chi_dinh: parseLines(phuongThuocForm.chi_dinh),
      chong_chi_dinh: parseLines(phuongThuocForm.chong_chi_dinh),
      luu_y: phuongThuocForm.luu_y || null,
      loai_benh: parseArray(phuongThuocForm.loai_benh),
      muc_do_benh: parseArray(phuongThuocForm.muc_do_benh),
      do_uu_tien: phuongThuocForm.do_uu_tien,
      is_active: phuongThuocForm.is_active,
    };

    if (editingPhuongThuoc) {
      const { error } = await supabase
        .from('nam_duoc_phuong_thuoc')
        .update(data)
        .eq('id', editingPhuongThuoc.id);

      if (error) {
        toast.error('Lỗi cập nhật: ' + error.message);
      } else {
        toast.success('Đã cập nhật bài thuốc');
        setPhuongThuocDialogOpen(false);
        fetchPhuongThuoc();
      }
    } else {
      const { error } = await supabase.from('nam_duoc_phuong_thuoc').insert(data);

      if (error) {
        toast.error('Lỗi tạo mới: ' + error.message);
      } else {
        toast.success('Đã thêm bài thuốc mới');
        setPhuongThuocDialogOpen(false);
        fetchPhuongThuoc();
      }
    }

    setSaving(false);
  };

  // Delete handler
  const handleDelete = async () => {
    if (!itemToDelete) return;

    const tableName = itemToDelete.type === 'vi' ? 'nam_duoc_vi_thuoc' : 'nam_duoc_phuong_thuoc';
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', itemToDelete.item.id);

    if (error) {
      toast.error('Lỗi xóa: ' + error.message);
    } else {
      toast.success('Đã xóa thành công');
      if (itemToDelete.type === 'vi') {
        fetchViThuoc();
      } else {
        fetchPhuongThuoc();
      }
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Bài thuốc Đông y</h1>
          <p className="text-muted-foreground">
            Quản lý vị thuốc và bài thuốc trong hệ thống Nam Dược
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm thuốc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vi-thuoc" className="gap-2">
            <Pill className="h-4 w-4" />
            Vị thuốc ({filteredViThuoc.length})
          </TabsTrigger>
          <TabsTrigger value="phuong-thuoc" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Bài thuốc ({filteredPhuongThuoc.length})
          </TabsTrigger>
        </TabsList>

        {/* Vi Thuoc Tab */}
        <TabsContent value="vi-thuoc">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Danh sách Vị thuốc
                </CardTitle>
                <CardDescription>
                  Các vị thuốc đơn lẻ trong hệ thống
                </CardDescription>
              </div>
              <Button onClick={() => openViThuocDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm vị thuốc
              </Button>
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
                      <TableHead>Tên thuốc</TableHead>
                      <TableHead>Tên khoa học</TableHead>
                      <TableHead>Ngũ hành</TableHead>
                      <TableHead>Tính</TableHead>
                      <TableHead>Quy kinh</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViThuoc.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.ten_thuoc}</TableCell>
                        <TableCell className="text-sm text-muted-foreground italic">
                          {item.ten_khoa_hoc || '-'}
                        </TableCell>
                        <TableCell>
                          {item.ngu_hanh && (
                            <Badge variant="outline" className="bg-transparent">{item.ngu_hanh}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.tinh || '-'}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {item.quy_kinh?.join(', ') || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.is_active ? 'default' : 'secondary'}>
                            {item.is_active ? 'Hoạt động' : 'Tạm ẩn'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViThuocDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive bg-transparent"
                              onClick={() => {
                                setItemToDelete({ type: 'vi', item });
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
        </TabsContent>

        {/* Phuong Thuoc Tab */}
        <TabsContent value="phuong-thuoc">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Danh sách Bài thuốc
                </CardTitle>
                <CardDescription>
                  Các bài thuốc (phương) trong hệ thống
                </CardDescription>
              </div>
              <Button onClick={() => openPhuongThuocDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm bài thuốc
              </Button>
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
                      <TableHead>Tên bài thuốc</TableHead>
                      <TableHead>Tên Hán</TableHead>
                      <TableHead>Ngũ hành</TableHead>
                      <TableHead>Tạng phủ</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPhuongThuoc.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.do_uu_tien}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.ten_phuong}</p>
                            {item.xuat_xu && (
                              <p className="text-xs text-muted-foreground">{item.xuat_xu}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm italic">{item.ten_han || '-'}</TableCell>
                        <TableCell>
                          {item.ngu_hanh_chinh && (
                            <Badge variant="outline" className="bg-transparent">{item.ngu_hanh_chinh}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {item.tang_phu_chinh?.join(', ') || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.is_active ? 'default' : 'secondary'}>
                            {item.is_active ? 'Hoạt động' : 'Tạm ẩn'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPhuongThuocDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive bg-transparent"
                              onClick={() => {
                                setItemToDelete({ type: 'phuong', item });
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
        </TabsContent>
      </Tabs>

      {/* Vi Thuoc Dialog */}
      <Dialog open={viThuocDialogOpen} onOpenChange={setViThuocDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingViThuoc ? 'Chỉnh sửa vị thuốc' : 'Thêm vị thuốc mới'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho vị thuốc
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveViThuoc} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ten_thuoc">Tên thuốc *</Label>
                <Input
                  id="ten_thuoc"
                  value={viThuocForm.ten_thuoc}
                  onChange={(e) => setViThuocForm({ ...viThuocForm, ten_thuoc: e.target.value })}
                  placeholder="VD: Cam thảo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ten_khoa_hoc">Tên khoa học</Label>
                <Input
                  id="ten_khoa_hoc"
                  value={viThuocForm.ten_khoa_hoc}
                  onChange={(e) => setViThuocForm({ ...viThuocForm, ten_khoa_hoc: e.target.value })}
                  placeholder="VD: Glycyrrhiza uralensis"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ten_khac">Tên khác (phân cách bằng dấu phẩy)</Label>
              <Input
                id="ten_khac"
                value={viThuocForm.ten_khac}
                onChange={(e) => setViThuocForm({ ...viThuocForm, ten_khac: e.target.value })}
                placeholder="VD: Quốc lão, Mật cam"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ngu_hanh">Ngũ hành</Label>
                <Select
                  value={viThuocForm.ngu_hanh}
                  onValueChange={(value) => setViThuocForm({ ...viThuocForm, ngu_hanh: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngũ hành" />
                  </SelectTrigger>
                  <SelectContent>
                    {NGU_HANH_OPTIONS.map(nh => (
                      <SelectItem key={nh} value={nh}>{nh}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tinh">Tính</Label>
                <Select
                  value={viThuocForm.tinh}
                  onValueChange={(value) => setViThuocForm({ ...viThuocForm, tinh: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tính" />
                  </SelectTrigger>
                  <SelectContent>
                    {TINH_OPTIONS.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vi">Vị (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="vi"
                  value={viThuocForm.vi}
                  onChange={(e) => setViThuocForm({ ...viThuocForm, vi: e.target.value })}
                  placeholder="VD: Ngọt, Bình"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quy_kinh">Quy kinh (phân cách bằng dấu phẩy)</Label>
              <Input
                id="quy_kinh"
                value={viThuocForm.quy_kinh}
                onChange={(e) => setViThuocForm({ ...viThuocForm, quy_kinh: e.target.value })}
                placeholder="VD: Tâm, Phế, Tỳ, Vị"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cong_dung">Công dụng</Label>
              <Textarea
                id="cong_dung"
                value={viThuocForm.cong_dung}
                onChange={(e) => setViThuocForm({ ...viThuocForm, cong_dung: e.target.value })}
                placeholder="Mô tả công dụng của vị thuốc"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chu_tri">Chủ trị (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="chu_tri"
                  value={viThuocForm.chu_tri}
                  onChange={(e) => setViThuocForm({ ...viThuocForm, chu_tri: e.target.value })}
                  placeholder="VD: Ho, Đau họng, Mệt mỏi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lieu_luong">Liều lượng</Label>
                <Input
                  id="lieu_luong"
                  value={viThuocForm.lieu_luong}
                  onChange={(e) => setViThuocForm({ ...viThuocForm, lieu_luong: e.target.value })}
                  placeholder="VD: 3-10g"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kieng_ky">Kiêng kỵ (phân cách bằng dấu phẩy)</Label>
              <Input
                id="kieng_ky"
                value={viThuocForm.kieng_ky}
                onChange={(e) => setViThuocForm({ ...viThuocForm, kieng_ky: e.target.value })}
                placeholder="VD: Phụ nữ có thai, Người huyết áp cao"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active_vi"
                checked={viThuocForm.is_active}
                onCheckedChange={(checked) => setViThuocForm({ ...viThuocForm, is_active: checked })}
              />
              <Label htmlFor="is_active_vi">Hoạt động</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setViThuocDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingViThuoc ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Phuong Thuoc Dialog */}
      <Dialog open={phuongThuocDialogOpen} onOpenChange={setPhuongThuocDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPhuongThuoc ? 'Chỉnh sửa bài thuốc' : 'Thêm bài thuốc mới'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho bài thuốc
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePhuongThuoc} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ten_phuong">Tên bài thuốc *</Label>
                <Input
                  id="ten_phuong"
                  value={phuongThuocForm.ten_phuong}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, ten_phuong: e.target.value })}
                  placeholder="VD: Lục vị địa hoàng"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ten_han">Tên Hán</Label>
                <Input
                  id="ten_han"
                  value={phuongThuocForm.ten_han}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, ten_han: e.target.value })}
                  placeholder="VD: 六味地黃丸"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="xuat_xu">Xuất xứ</Label>
                <Input
                  id="xuat_xu"
                  value={phuongThuocForm.xuat_xu}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, xuat_xu: e.target.value })}
                  placeholder="VD: Tiểu Nhi Dược Chứng Trực Quyết"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="do_uu_tien">Độ ưu tiên</Label>
                <Input
                  id="do_uu_tien"
                  type="number"
                  value={phuongThuocForm.do_uu_tien}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, do_uu_tien: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ngu_hanh_chinh">Ngũ hành chính</Label>
                <Select
                  value={phuongThuocForm.ngu_hanh_chinh}
                  onValueChange={(value) => setPhuongThuocForm({ ...phuongThuocForm, ngu_hanh_chinh: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngũ hành" />
                  </SelectTrigger>
                  <SelectContent>
                    {NGU_HANH_OPTIONS.map(nh => (
                      <SelectItem key={nh} value={nh}>{nh}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tang_phu_chinh">Tạng phủ chính (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="tang_phu_chinh"
                  value={phuongThuocForm.tang_phu_chinh}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, tang_phu_chinh: e.target.value })}
                  placeholder="VD: Thận, Can"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thanh_phan">Thành phần (mỗi dòng: Tên vị thuốc: Liều lượng)</Label>
              <Textarea
                id="thanh_phan"
                value={phuongThuocForm.thanh_phan}
                onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, thanh_phan: e.target.value })}
                placeholder="Thục địa: 24g&#10;Sơn thù: 12g&#10;Sơn dược: 12g"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cach_dung">Cách dùng</Label>
              <Textarea
                id="cach_dung"
                value={phuongThuocForm.cach_dung}
                onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, cach_dung: e.target.value })}
                placeholder="Mô tả cách dùng bài thuốc"
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chi_dinh">Chỉ định (mỗi dòng một chỉ định)</Label>
                <Textarea
                  id="chi_dinh"
                  value={phuongThuocForm.chi_dinh}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, chi_dinh: e.target.value })}
                  placeholder="Thận âm hư&#10;Đau lưng mỏi gối&#10;Ù tai, chóng mặt"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chong_chi_dinh">Chống chỉ định (mỗi dòng một chống chỉ định)</Label>
                <Textarea
                  id="chong_chi_dinh"
                  value={phuongThuocForm.chong_chi_dinh}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, chong_chi_dinh: e.target.value })}
                  placeholder="Tỳ hư&#10;Tiêu chảy&#10;Phụ nữ có thai"
                  rows={4}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loai_benh">Loại bệnh (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="loai_benh"
                  value={phuongThuocForm.loai_benh}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, loai_benh: e.target.value })}
                  placeholder="VD: Thận hư, Nội khoa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="muc_do_benh">Mức độ bệnh (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="muc_do_benh"
                  value={phuongThuocForm.muc_do_benh}
                  onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, muc_do_benh: e.target.value })}
                  placeholder="VD: Nhẹ, Vừa, Nặng"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="luu_y">Lưu ý</Label>
              <Textarea
                id="luu_y"
                value={phuongThuocForm.luu_y}
                onChange={(e) => setPhuongThuocForm({ ...phuongThuocForm, luu_y: e.target.value })}
                placeholder="Các lưu ý khi sử dụng bài thuốc"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active_phuong"
                checked={phuongThuocForm.is_active}
                onCheckedChange={(checked) => setPhuongThuocForm({ ...phuongThuocForm, is_active: checked })}
              />
              <Label htmlFor="is_active_phuong">Hoạt động</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPhuongThuocDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPhuongThuoc ? 'Cập nhật' : 'Tạo mới'}
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
              Bạn có chắc chắn muốn xóa {itemToDelete?.type === 'vi' ? 'vị thuốc' : 'bài thuốc'} &quot;
              {itemToDelete?.type === 'vi' 
                ? (itemToDelete.item as ViThuoc).ten_thuoc 
                : (itemToDelete?.item as PhuongThuoc)?.ten_phuong}
              &quot;? Hành động này không thể hoàn tác.
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
