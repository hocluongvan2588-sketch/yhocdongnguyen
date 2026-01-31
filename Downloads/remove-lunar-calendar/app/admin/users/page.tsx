import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserTable from '@/components/admin/UserTable';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{'Quản lý người dùng'}</h1>
        <p className="text-muted-foreground">{'Xem và quản lý tất cả người dùng trong hệ thống'}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{'Danh sách người dùng'}</CardTitle>
          <CardDescription>
            {'Tổng cộng'} {users?.length || 0} {'người dùng'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={users || []} />
        </CardContent>
      </Card>
    </div>
  );
}
