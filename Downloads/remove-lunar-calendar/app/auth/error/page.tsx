import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-destructive/5 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{'Lỗi xác thực'}</CardTitle>
          <CardDescription className="text-base">
            {message || 'Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {'Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ hỗ trợ.'}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">{'Thử đăng nhập lại'}</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">{'Về trang chủ'}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
