import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

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
}

export const metadata = {
  title: 'Bảng giá dịch vụ | Mai Hoa Tâm Pháp',
  description: 'Các gói dịch vụ Mai Hoa Tâm Pháp - Từ cơ bản đến chuyên sâu',
};

export default async function PricingPage() {
  const supabase = await createClient();
  
  const { data: packages } = await supabase
    .from('service_packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Gói dịch vụ
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Chọn gói phù hợp với bạn
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Khám phá sức khỏe qua Mai Hoa Thần Số với các gói dịch vụ được thiết kế 
              phù hợp với nhu cầu của bạn
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages?.map((pkg: ServicePackage) => (
              <Card
                key={pkg.id}
                className={`relative flex flex-col ${
                  pkg.is_featured
                    ? 'border-primary shadow-lg ring-2 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {pkg.is_featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      Phổ biến nhất
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 pt-6">
                  {pkg.original_price && pkg.original_price > pkg.price && (
                    <Badge variant="destructive" className="mb-2 w-fit">
                      Giảm {getDiscount(pkg.original_price, pkg.price)}%
                    </Badge>
                  )}
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        {formatPrice(pkg.price)}
                      </span>
                      {pkg.price > 0 && (
                        <span className="text-muted-foreground">/lần</span>
                      )}
                    </div>
                    {pkg.original_price && pkg.original_price > pkg.price && (
                      <p className="mt-1 text-sm text-muted-foreground line-through">
                        {formatPrice(pkg.original_price)}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {pkg.features?.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    asChild
                    className="w-full"
                    variant={pkg.is_featured ? 'default' : 'outline'}
                  >
                    <Link href={pkg.price === 0 ? '/' : `/checkout/${pkg.slug}`}>
                      {pkg.price === 0 ? 'Bắt đầu miễn phí' : 'Chọn gói này'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ or Additional Info */}
        <section className="border-t border-border bg-muted/30 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Bạn cần tư vấn thêm?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Liên hệ với chúng tôi để được hỗ trợ chọn gói dịch vụ phù hợp nhất 
              với nhu cầu sức khỏe của bạn.
            </p>
            <Button asChild variant="outline" className="mt-6 bg-transparent">
              <Link href="/contact">Liên hệ hỗ trợ</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
