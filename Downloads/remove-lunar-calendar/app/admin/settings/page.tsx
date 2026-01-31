'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, CreditCard, Save, RefreshCw, CheckCircle } from 'lucide-react';

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch: string | null;
  is_active: boolean;
  is_default: boolean;
}

export default function AdminSettingsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form state for new/edit bank
  const [editingBank, setEditingBank] = useState<Partial<BankAccount> | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const supabase = createClient();

  const fetchBankAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching bank accounts:', error);
    } else {
      setBankAccounts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleSaveBank = async () => {
    if (!editingBank) return;
    setSaving(true);

    try {
      if (isAddingNew) {
        const { error } = await supabase
          .from('bank_accounts')
          .insert({
            bank_name: editingBank.bank_name,
            account_number: editingBank.account_number,
            account_name: editingBank.account_name,
            branch: editingBank.branch || null,
            is_active: editingBank.is_active ?? true,
            is_default: editingBank.is_default ?? false,
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bank_accounts')
          .update({
            bank_name: editingBank.bank_name,
            account_number: editingBank.account_number,
            account_name: editingBank.account_name,
            branch: editingBank.branch || null,
            is_active: editingBank.is_active,
            is_default: editingBank.is_default,
          })
          .eq('id', editingBank.id);

        if (error) throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setEditingBank(null);
      setIsAddingNew(false);
      await fetchBankAccounts();
    } catch (error) {
      console.error('Error saving bank:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (bankId: string) => {
    // First, unset all defaults
    await supabase.from('bank_accounts').update({ is_default: false }).neq('id', '');
    // Then set the new default
    await supabase.from('bank_accounts').update({ is_default: true }).eq('id', bankId);
    await fetchBankAccounts();
  };

  const handleToggleActive = async (bank: BankAccount) => {
    await supabase
      .from('bank_accounts')
      .update({ is_active: !bank.is_active })
      .eq('id', bank.id);
    await fetchBankAccounts();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground">Quản lý cấu hình thanh toán và hệ thống</p>
      </div>

      {/* Bank Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Tài khoản ngân hàng</CardTitle>
                <CardDescription>Cấu hình tài khoản nhận thanh toán</CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingBank({
                  bank_name: '',
                  account_number: '',
                  account_name: '',
                  branch: '',
                  is_active: true,
                  is_default: false,
                });
                setIsAddingNew(true);
              }}
            >
              Thêm tài khoản
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : bankAccounts.length === 0 && !isAddingNew ? (
            <div className="py-8 text-center text-muted-foreground">
              Chưa có tài khoản ngân hàng nào. Thêm tài khoản để nhận thanh toán.
            </div>
          ) : (
            <>
              {/* Existing bank accounts */}
              {bankAccounts.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bank.bank_name}</span>
                      {bank.is_default && (
                        <Badge variant="default" className="text-xs">
                          Mặc định
                        </Badge>
                      )}
                      {!bank.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Tắt
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bank.account_number} - {bank.account_name}
                    </p>
                    {bank.branch && (
                      <p className="text-xs text-muted-foreground">Chi nhánh: {bank.branch}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBank(bank);
                        setIsAddingNew(false);
                      }}
                      className="bg-transparent"
                    >
                      Sửa
                    </Button>
                    {!bank.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(bank.id)}
                        className="bg-transparent"
                      >
                        Đặt mặc định
                      </Button>
                    )}
                    <Switch
                      checked={bank.is_active}
                      onCheckedChange={() => handleToggleActive(bank)}
                    />
                  </div>
                </div>
              ))}

              {/* Add/Edit Form */}
              {editingBank && (
                <div className="rounded-lg border border-primary/50 bg-muted/30 p-4">
                  <h4 className="mb-4 font-medium">
                    {isAddingNew ? 'Thêm tài khoản mới' : 'Chỉnh sửa tài khoản'}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tên ngân hàng</Label>
                      <Input
                        value={editingBank.bank_name || ''}
                        onChange={(e) =>
                          setEditingBank({ ...editingBank, bank_name: e.target.value })
                        }
                        placeholder="VD: Timo, Vietcombank..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Số tài khoản</Label>
                      <Input
                        value={editingBank.account_number || ''}
                        onChange={(e) =>
                          setEditingBank({ ...editingBank, account_number: e.target.value })
                        }
                        placeholder="Số tài khoản"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tên chủ tài khoản</Label>
                      <Input
                        value={editingBank.account_name || ''}
                        onChange={(e) =>
                          setEditingBank({ ...editingBank, account_name: e.target.value })
                        }
                        placeholder="Tên in trên tài khoản"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Chi nhánh (tùy chọn)</Label>
                      <Input
                        value={editingBank.branch || ''}
                        onChange={(e) =>
                          setEditingBank({ ...editingBank, branch: e.target.value })
                        }
                        placeholder="Chi nhánh ngân hàng"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingBank(null);
                        setIsAddingNew(false);
                      }}
                      className="bg-transparent"
                    >
                      Hủy
                    </Button>
                    <Button onClick={handleSaveBank} disabled={saving}>
                      {saving ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : saveSuccess ? (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {saveSuccess ? 'Đã lưu!' : 'Lưu'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Other Settings - Coming Soon */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Cài đặt khác
                <Badge variant="secondary" className="text-xs">Sắp ra mắt</Badge>
              </CardTitle>
              <CardDescription>Các cài đặt nâng cao sẽ sớm được cập nhật</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
