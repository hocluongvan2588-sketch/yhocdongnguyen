import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để tiếp tục' },
        { status: 401 }
      );
    }
    
    const { packageId } = await request.json();
    
    if (!packageId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin gói dịch vụ' },
        { status: 400 }
      );
    }
    
    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from('service_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();
    
    if (pkgError || !pkg) {
      return NextResponse.json(
        { error: 'Gói dịch vụ không tồn tại' },
        { status: 404 }
      );
    }
    
    // Check if user already has active subscription for this package
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('package_id', packageId)
      .eq('status', 'active')
      .single();
    
    if (existingSub) {
      return NextResponse.json(
        { error: 'Bạn đã có gói dịch vụ này' },
        { status: 400 }
      );
    }
    
    // Check for existing pending order
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('package_id', packageId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (existingOrder) {
      return NextResponse.json({ order: existingOrder });
    }
    
    // Generate order code: NAPTEN + first 8 chars of user id + 4 random chars
    const userIdPrefix = user.id.replace(/-/g, '').substring(0, 8).toUpperCase();
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderCode = `NAPTEN${userIdPrefix}${randomChars}`;
    
    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();
    
    // Create new order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        package_id: packageId,
        order_code: orderCode,
        amount: pkg.price,
        currency: pkg.currency || 'VND',
        status: 'pending',
        payment_method: 'bank_transfer',
        user_email: profile?.email || user.email,
        user_name: profile?.full_name,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('[v0] Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Không thể tạo đơn hàng' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ order });
    
  } catch (error) {
    console.error('[v0] Order creation error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
