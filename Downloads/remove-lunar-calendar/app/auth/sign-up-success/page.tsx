import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{'Đăng ký thành công!'}</CardTitle>
          <CardDescription className="text-base">
            {'Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Mail className="h-5 w-5" />
              <span className="font-medium">{'Kiểm tra email'}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {'Vui lòng click vào link trong email để xác nhận tài khoản và hoàn tất đăng ký.'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {'Không nhận được email? Kiểm tra thư mục spam hoặc thử đăng ký lại.'}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">{'Đi đến trang đăng nhập'}</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">{'Về trang chủ'}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
