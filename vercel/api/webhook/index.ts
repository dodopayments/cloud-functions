import { neon } from '@neondatabase/serverless';
import { Webhook } from 'standardwebhooks';

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

// Disable body parsing to access raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Helper functions for json responses
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle subscription events
async function handleSubscriptionEvent(sql: any, data: any, status: string) {
  if (!data.customer?.customer_id || !data.subscription_id) {
    throw new Error('Missing required fields: customer_id or subscription_id');
  }

  console.log('🔄 Processing subscription event:', JSON.stringify(data, null, 2));

  const customer = data.customer;

  // Upsert customer (create if doesn't exist, otherwise use existing)
  const customerResult = await sql`
    INSERT INTO customers (email, name, dodo_customer_id, created_at)
    VALUES (${customer.email}, ${customer.name || customer.email}, ${customer.customer_id}, ${new Date().toISOString()})
    ON CONFLICT (dodo_customer_id) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      updated_at = ${new Date().toISOString()}
    RETURNING id
  `;

  const customerId = customerResult[0].id;
  console.log(`✅ Customer upserted with ID: ${customerId}`);

  // Upsert subscription
  await sql`
    INSERT INTO subscriptions (
      customer_id, dodo_subscription_id, product_id, status, 
      billing_interval, amount, currency, next_billing_date, cancelled_at, updated_at
    )
    VALUES (
      ${customerId}, ${data.subscription_id},
      ${data.product_id || 'unknown'}, ${status},
      ${data.payment_frequency_interval?.toLowerCase() || 'month'}, ${data.recurring_pre_tax_amount || 0},
      ${data.currency || 'USD'}, ${data.next_billing_date || null},
      ${data.cancelled_at || null}, ${new Date().toISOString()}
    )
    ON CONFLICT (dodo_subscription_id) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      next_billing_date = EXCLUDED.next_billing_date,
      cancelled_at = EXCLUDED.cancelled_at,
      updated_at = EXCLUDED.updated_at
  `;

  console.log(`✅ Subscription upserted with ${status} status`)
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response('ok', { 
    status: 200,
    headers: corsHeaders 
  });
}

// Handle webhook POST request
export async function POST(req: Request) {
  try {
    // Get raw body for webhook signature verification
    const rawBody = await req.text();
    
    console.log('📨 Webhook received');

    const DATABASE_URL = process.env.DATABASE_URL;
    const WEBHOOK_KEY = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

    if (!DATABASE_URL) {
      console.error('❌ Missing DATABASE_URL environment variable');
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }

    // Initialize Neon client
    const sql = neon(DATABASE_URL);

    // Verify webhook signature (required for security)
    if (!WEBHOOK_KEY) {
      console.error('❌ DODO_PAYMENTS_WEBHOOK_KEY is not configured');
      return jsonResponse({ error: 'Webhook verification key not configured' }, 500);
    }

    const webhookHeaders = {
      'webhook-id': req.headers.get('webhook-id') || '',
      'webhook-signature': req.headers.get('webhook-signature') || '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') || '',
    };

    try {
      const wh = new Webhook(WEBHOOK_KEY);
      await wh.verify(rawBody, webhookHeaders);
      console.log('✅ Webhook signature verified');
    } catch (error) {
      console.error('❌ Webhook verification failed:', error);
      return jsonResponse({ error: 'Webhook verification failed' }, 401);
    }

    const payload: WebhookPayload = JSON.parse(rawBody);
    const eventType = payload.type;
    const eventData = payload.data;
    const webhookId = req.headers.get('webhook-id') || '';

    console.log(`📋 Webhook payload:`, JSON.stringify(payload, null, 2));

    // Check for duplicate webhook-id (idempotency)
    if (webhookId) {
      const existingEvent = await sql`
        SELECT id FROM webhook_events WHERE webhook_id = ${webhookId}
      `;

      if (existingEvent.length > 0) {
        console.log(`⚠️ Webhook ${webhookId} already processed, skipping (idempotency)`);
        return jsonResponse({ success: true, message: 'Webhook already processed' });
      }
    }

    // Log webhook event with webhook_id for idempotency
    const logResult = await sql`
      INSERT INTO webhook_events (webhook_id, event_type, data, processed, created_at)
      VALUES (${webhookId || null}, ${eventType}, ${JSON.stringify(eventData)}, ${false}, ${new Date().toISOString()})
      RETURNING id
    `;

    const loggedEventId = logResult[0].id;
    console.log('📝 Webhook event logged with ID:', loggedEventId);

    console.log(`🔄 Processing: ${eventType} (${eventData.payload_type || 'unknown payload type'})`);

    try {
      switch (eventType) {
        case 'subscription.active':
          await handleSubscriptionEvent(sql, eventData, 'active');
          break;
        case 'subscription.cancelled':
          await handleSubscriptionEvent(sql, eventData, 'cancelled');
          break;
        case 'subscription.renewed':
          console.log('🔄 Subscription renewed - keeping active status and updating billing date');
          await handleSubscriptionEvent(sql, eventData, 'active');
          break;
        default:
          console.log(`ℹ️ Event ${eventType} logged but not processed (no handler available)`);
      }

      await sql`
        UPDATE webhook_events 
        SET processed = ${true}, processed_at = ${new Date().toISOString()}
        WHERE id = ${loggedEventId}
      `;

      console.log('✅ Webhook marked as processed');
    } catch (processingError) {
      console.error('❌ Error processing webhook event:', processingError);

      await sql`
        UPDATE webhook_events 
        SET processed = ${false}, 
            error_message = ${processingError instanceof Error ? processingError.message : 'Unknown error'},
            processed_at = ${new Date().toISOString()}
        WHERE id = ${loggedEventId}
      `;

      throw processingError;
    }

    console.log('✅ Webhook processed successfully');

    return jsonResponse({
      success: true,
      event_type: eventType,
      event_id: loggedEventId
    });

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    return jsonResponse({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
