import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WebhookPayload {
  business_id: string;
  type: string;
  timestamp: string;
  data: {
    payload_type: "Subscription" | "Refund" | "Dispute" | "LicenseKey";
    subscription_id?: string;
    customer?: {
      customer_id: string;
      email: string;
      name: string;
    };
    product_id?: string;
    status?: string;
    recurring_pre_tax_amount?: number;
    payment_frequency_interval?: string;
    next_billing_date?: string;
    cancelled_at?: string;
    currency?: string;
  };
}


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate required environment variables
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await req.text();
    console.log('📨 Webhook received');

    // Verify webhook signature (required for security)
    const webhookKey = Deno.env.get('DODO_PAYMENTS_WEBHOOK_KEY');
    if (!webhookKey) {
      console.error('❌ DODO_PAYMENTS_WEBHOOK_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook verification key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookHeaders = {
      'webhook-id': req.headers.get('webhook-id') || '',
      'webhook-signature': req.headers.get('webhook-signature') || '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') || '',
    };

    try {
      const wh = new Webhook(webhookKey);
      await wh.verify(rawBody, webhookHeaders);
      console.log('✅ Webhook signature verified');
    } catch (error) {
      console.error('❌ Webhook verification failed:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Webhook verification failed',
          details: error instanceof Error ? error.message : 'Invalid signature'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody) as WebhookPayload;
    } catch (parseError) {
      console.error('❌ Failed to parse webhook payload:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const eventType = payload.type;
    const eventData = payload.data;
    const webhookId = req.headers.get('webhook-id') || '';

    console.log(`📋 Webhook payload:`, JSON.stringify(payload, null, 2));

    // Check for duplicate webhook-id (idempotency)
    if (webhookId) {
      const { data: existingEvent } = await supabase
        .from('webhook_events')
        .select('id')
        .eq('webhook_id', webhookId)
        .single();

      if (existingEvent) {
        console.log(`⚠️ Webhook ${webhookId} already processed, skipping (idempotency)`);
        return new Response(
          JSON.stringify({ success: true, message: 'Webhook already processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log webhook event with webhook_id for idempotency
    const logResult = await supabase.from('webhook_events').insert([{
      webhook_id: webhookId || null,
      event_type: eventType,
      data: eventData,
      processed: false,
      created_at: new Date().toISOString()
    }]).select('id').single();

    if (logResult.error) {
      console.error('❌ Failed to log webhook event:', logResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to log webhook event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const loggedEventId = logResult.data.id;
    console.log('📝 Webhook event logged with ID:', loggedEventId);

    console.log(`🔄 Processing: ${eventType} (${eventData.payload_type || 'unknown payload type'})`);

    try {
      switch (eventType) {
        case 'subscription.active':
          await handleSubscriptionEvent(supabase, eventData, 'active');
          break;
        case 'subscription.cancelled':
          await handleSubscriptionEvent(supabase, eventData, 'cancelled');
          break;
        case 'subscription.renewed':
          console.log('🔄 Subscription renewed - keeping active status and updating billing date');
          await handleSubscriptionEvent(supabase, eventData, 'active');
          break;
        default:
          console.log(`ℹ️ Event ${eventType} logged but not processed (no handler available)`);
      }
      
      const updateResult = await supabase
        .from('webhook_events')
        .update({ 
          processed: true, 
          processed_at: new Date().toISOString() 
        })
        .eq('id', loggedEventId);
      
      if (updateResult.error) {
        console.error('❌ Failed to mark webhook as processed:', updateResult.error);
      } else {
        console.log('✅ Webhook marked as processed');
      }
    } catch (processingError) {
      console.error('❌ Error processing webhook event:', processingError);
      
      await supabase
        .from('webhook_events')
        .update({ 
          processed: false,
          error_message: processingError instanceof Error ? processingError.message : 'Unknown error',
          processed_at: new Date().toISOString()
        })
        .eq('id', loggedEventId);
      
      throw processingError;
    }

    console.log('✅ Webhook processed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        event_type: eventType,
        event_id: loggedEventId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSubscriptionEvent(supabase: SupabaseClient, data: any, status: string) {
  if (!data.customer?.customer_id || !data.subscription_id) {
    throw new Error('Missing required fields: customer_id or subscription_id');
  }

  try {
    console.log('🔄 Processing subscription event:', JSON.stringify(data, null, 2));
    
    const customer = data.customer;
    
    // Upsert customer (create if doesn't exist, otherwise update)
    const customerResult = await supabase
      .from('customers')
      .upsert({
        email: customer.email,
        name: customer.name || customer.email,
        dodo_customer_id: customer.customer_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'dodo_customer_id',
        ignoreDuplicates: false
      })
      .select('id')
      .single();

    if (customerResult.error) {
      console.error('❌ Failed to upsert customer:', customerResult.error);
      throw new Error(`Failed to upsert customer: ${customerResult.error.message}`);
    }

    const customerId = customerResult.data.id;
    console.log(`✅ Customer upserted with ID: ${customerId}`);

    // Upsert subscription
    const subscriptionResult = await supabase
      .from('subscriptions')
      .upsert({
        customer_id: customerId,
        dodo_subscription_id: data.subscription_id,
        product_id: data.product_id || 'unknown',
        status,
        billing_interval: data.payment_frequency_interval?.toLowerCase() || 'month',
        amount: data.recurring_pre_tax_amount || 0,
        currency: data.currency || 'USD',
        next_billing_date: data.next_billing_date || null,
        cancelled_at: data.cancelled_at || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'dodo_subscription_id',
        ignoreDuplicates: false
      })
      .select();

    if (subscriptionResult.error) {
      console.error('❌ Failed to upsert subscription:', subscriptionResult.error);
      throw new Error(`Failed to upsert subscription: ${subscriptionResult.error.message}`);
    }

    console.log(`✅ Subscription upserted with ${status} status`);

  } catch (error) {
    console.error('❌ Error in handleSubscriptionEvent:', error);
    console.error('❌ Raw webhook data:', JSON.stringify(data, null, 2));
    throw error;
  }
}
