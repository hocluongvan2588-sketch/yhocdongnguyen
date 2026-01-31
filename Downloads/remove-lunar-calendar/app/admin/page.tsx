import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Activity } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get user statistics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: activeUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: adminUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  const stats = [
    {
      title: 'Tổng người dùng',
      value: totalUsers || 0,
      description: 'Tổng số tài khoản đã đăng ký',
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Người dùng hoạt động',
      value: activeUsers || 0,
      description: 'Tài khoản đang hoạt động',
      icon: UserCheck,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Quản trị viên',
      value: adminUsers || 0,
      description: 'Tài khoản có quyền admin',
      icon: Activity,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">{'Tổng quan hệ thống quản trị'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn('rounded-lg p-2', stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{'Hoạt động gần đây'}</CardTitle>
            <CardDescription>{'Danh sách người dùng mới đăng ký'}</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentUsers />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function RecentUsers() {
  const supabase = await createClient();
  
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at, is_active')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recentUsers || recentUsers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {'Chưa có người dùng nào đăng ký'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {recentUsers.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-medium text-primary">
                {(user.full_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{user.full_name || 'Chưa cập nhật'}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              {user.role === 'admin' ? 'Admin' : 'User'}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                user.is_active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
