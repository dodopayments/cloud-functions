# Cloudflare Workers - DodoPayments Webhook

Deploy DodoPayments webhooks to Cloudflare's global edge network with zero cold starts.

## Features

- 🔒 **Webhook verification** - Secure signature checking using DodoPayments library
- 🔄 **Idempotency** - Prevents duplicate processing with webhook IDs
- 📊 **Event logging** - Complete audit trail in database
- ⚠️ **Error handling** - Logged failures with retry support

> **Note:** This implementation demonstrates handling three core subscription events (`subscription.active`, `subscription.cancelled`, `subscription.renewed`) with minimal fields. You can easily extend it to support additional event types and fields based on your requirements.

## Prerequisites

### 1. Install Wrangler CLI (one-time)

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare (one-time)

```bash
wrangler login
```

This will open your browser to authenticate with your Cloudflare account.

### 3. Database Setup

You'll need a PostgreSQL database. We recommend [Neon](https://neon.com) for serverless PostgreSQL.

**Create the tables:**
1. Sign up for [Neon](https://neon.com)
2. Create a new project
3. Open the SQL Editor
4. Copy and paste the contents of [`schema.sql`](../schema.sql)
5. Run the query

**Get your connection string:**
- Go to your Neon project → Connection string
- Copy the connection string

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Initial Secrets

```bash
# Set your Neon database URL
wrangler secret put DATABASE_URL

# Set your API key
wrangler secret put DODO_PAYMENTS_API_KEY
```

> **Note:** We'll set `DODO_PAYMENTS_WEBHOOK_KEY` after deployment once you have your webhook URL.

### 3. Update wrangler.toml

Edit `wrangler.toml` and set your worker name:

```toml
name = "my-dodo-webhook"
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Get Your Webhook URL

Your webhook URL is:
```
https://[worker-name].[your-subdomain].workers.dev
```

### 6. Register Webhook in DodoPayments Dashboard

1. Go to [DodoPayments Dashboard](https://app.dodopayments.com) → Developer → Webhooks
2. Create a new webhook endpoint
3. Configure your webhook URL as the endpoint
4. Enable these subscription events:
   - `subscription.active`
   - `subscription.cancelled`
   - `subscription.renewed`
5. Copy the **Signing Secret**

### 7. Set Webhook Key & Redeploy

```bash
wrangler secret put DODO_PAYMENTS_WEBHOOK_KEY
npm run deploy
```

## Local Development

```bash
npm run dev
```

Your webhook will be available at `http://localhost:8787`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `DODO_PAYMENTS_API_KEY` | Yes | API key for DodoPayments client |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Yes | Webhook signing key for verification |

## Webhook URL

After deployment, your webhook URL will be at:
```
https://[worker-name].[your-subdomain].workers.dev
```

Configure this URL in your DodoPayments dashboard.

## Security

This implementation uses the **[dodopayments](https://www.npmjs.com/package/dodopayments)** library for secure webhook signature verification.

**Features:**
- ✅ HMAC-SHA256 signature verification
- ✅ Automatic timestamp validation (5-minute tolerance)
- ✅ Replay attack prevention
- ✅ Constant-time comparison

**Important:** Always set both `DODO_PAYMENTS_API_KEY` and `DODO_PAYMENTS_WEBHOOK_KEY` in production.

## Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [DodoPayments Docs](https://docs.dodopayments.com)
