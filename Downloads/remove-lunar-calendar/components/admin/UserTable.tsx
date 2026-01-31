'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Shield, ShieldOff, UserCheck, UserX, Trash2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserTableProps {
  users: Profile[];
}

export default function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });

  const handleToggleRole = async (userId: string, currentRole: string) => {
    setIsLoading(userId);
    const supabase = createClient();
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      router.refresh();
    }
    setIsLoading(null);
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setIsLoading(userId);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !isActive })
      .eq('id', userId);

    if (!error) {
      router.refresh();
    }
    setIsLoading(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;
    
    setIsLoading(deleteDialog.userId);
    const supabase = createClient();

    // Note: This only deletes the profile. To fully delete the user,
    // you would need to use Supabase Admin API or a server action
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', deleteDialog.userId);

    if (!error) {
      router.refresh();
    }
    setIsLoading(null);
    setDeleteDialog({ open: false, userId: null });
  };

  if (users.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {'Chưa có người dùng nào trong hệ thống'}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{'Họ tên'}</TableHead>
              <TableHead>{'Vai trò'}</TableHead>
              <TableHead>{'Trạng thái'}</TableHead>
              <TableHead>{'Ngày tạo'}</TableHead>
              <TableHead className="text-right">{'Thao tác'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xs font-medium text-primary">
                        {(user.full_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.full_name || 'Chưa cập nhật'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                  >
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_active ? 'default' : 'destructive'}
                    className={
                      user.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                        : ''
                    }
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isLoading === user.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{'Thao tác'}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleRole(user.id, user.role)}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            {'Hạ quyền xuống User'}
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            {'Nâng lên Admin'}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            {'Vô hiệu hóa'}
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            {'Kích hoạt'}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {'Xóa người dùng'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, userId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{'Xác nhận xóa người dùng?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {'Hành động này không thể hoàn tác. Tất cả dữ liệu của người dùng sẽ bị xóa vĩnh viễn.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{'Hủy'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
