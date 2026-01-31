import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { parseTimoEmail, isTimoEmail } from '@/lib/utils/timo-email-parser';

// Lazy initialization to avoid build-time errors
let supabaseAdminClient: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabaseAdminClient = createClient(url, key);
  }
  return supabaseAdminClient;
}

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    const body = await request.json();
    
    // Expected payload from email forwarding service
    const { 
      from: emailFrom, 
      text: emailText, 
      html: emailHtml,
      subject: emailSubject 
    } = body;
    
    if (!emailFrom || (!emailText && !emailHtml)) {
      return NextResponse.json(
        { error: 'Missing email data' },
        { status: 400 }
      );
    }
    
    // Check if email is from Timo
    if (!isTimoEmail(emailFrom)) {
      return NextResponse.json(
        { message: 'Not a Timo email, skipped' },
        { status: 200 }
      );
    }
    
    // Parse email content
    const emailContent = emailText || emailHtml || '';
    const transaction = parseTimoEmail(emailFrom, emailContent);
    
    if (!transaction) {
      console.error('[v0] Failed to parse Timo email');
      return NextResponse.json(
        { error: 'Failed to parse email' },
        { status: 400 }
      );
    }
    
    console.log('[v0] Parsed transaction:', transaction);
    
    // Extract order code from content (NAPTEN...)
    const orderCodeMatch = transaction.content.match(/NAPTEN[A-Z0-9]+/i);
    if (!orderCodeMatch) {
      console.log('[v0] No order code found in transaction');
      return NextResponse.json(
        { message: 'No order code found' },
        { status: 200 }
      );
    }
    
    const orderCode = orderCodeMatch[0].toUpperCase();
    console.log('[v0] Found order code:', orderCode);
    
    // Find the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_code', orderCode)
      .eq('status', 'pending')
      .single();
    
    if (orderError || !order) {
      console.log('[v0] Order not found or already paid:', orderCode);
      return NextResponse.json(
        { message: 'Order not found or already processed' },
        { status: 200 }
      );
    }
    
    // Verify amount matches
    if (transaction.amount < order.amount) {
      console.log('[v0] Amount mismatch:', transaction.amount, 'vs', order.amount);
      // Still record but mark as underpaid
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'failed',
          transaction_id: transaction.transactionId,
          bank_name: transaction.bankName,
          notes: `Underpaid: received ${transaction.amount}, expected ${order.amount}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      
      return NextResponse.json(
        { error: 'Insufficient payment amount' },
        { status: 400 }
      );
    }
    
    // Update order as paid
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        transaction_id: transaction.transactionId,
        bank_name: transaction.bankName,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          ...order.metadata,
          sender_info: transaction.senderInfo,
          raw_content: transaction.content,
        },
      })
      .eq('id', order.id);
    
    if (updateError) {
      console.error('[v0] Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }
    
    // Create subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: order.user_id,
        package_id: order.package_id,
        order_id: order.id,
        status: 'active',
        started_at: new Date().toISOString(),
        // No expires_at = lifetime access
      })
      .select()
      .single();
    
    if (subError) {
      console.error('[v0] Error creating subscription:', subError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }
    
    console.log('[v0] Payment confirmed, subscription created:', subscription.id);
    
    // TODO: Send confirmation email to user
    
    return NextResponse.json({
      success: true,
      message: 'Payment confirmed',
      orderId: order.id,
      subscriptionId: subscription.id,
    });
    
  } catch (error) {
    console.error('[v0] Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Manual verification endpoint (for admin)
export async function PUT(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    const body = await request.json();
    const { orderCode, transactionId, adminKey } = body;
    
    // Simple admin key check (should use proper auth in production)
    if (adminKey !== process.env.ADMIN_WEBHOOK_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find and update order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_code', orderCode)
      .eq('status', 'pending')
      .single();
    
    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Update order
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        transaction_id: transactionId || `MANUAL_${Date.now()}`,
        bank_name: 'Manual',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: 'Manually verified by admin',
      })
      .eq('id', order.id);
    
    // Create subscription
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: order.user_id,
        package_id: order.package_id,
        order_id: order.id,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    return NextResponse.json({
      success: true,
      orderId: order.id,
      subscriptionId: subscription?.id,
    });
    
  } catch (error) {
    console.error('[v0] Manual verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
