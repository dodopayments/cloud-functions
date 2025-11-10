# Netlify - DodoPayments Webhook

Deploy DodoPayments webhooks to Netlify Functions.

## Features

- 🔒 **Webhook verification** - Secure signature checking using DodoPayments library
- 🔄 **Idempotency** - Prevents duplicate processing with webhook IDs
- 📊 **Event logging** - Complete audit trail in database
- ⚠️ **Error handling** - Logged failures with retry support

> **Note:** This implementation demonstrates handling three core subscription events (`subscription.active`, `subscription.cancelled`, `subscription.renewed`) with minimal fields. You can easily extend it to support additional event types and fields based on your requirements.

## Prerequisites

### 1. Install Netlify CLI (one-time)

```bash
npm install -g netlify-cli
```

### 2. Authenticate with Netlify (one-time)

```bash
netlify login
```

This will open your browser to authenticate with your Netlify account.

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

### 2. Set Initial Environment Variables

```bash
netlify env:set DATABASE_URL "your-neon-connection-string"
netlify env:set DODO_PAYMENTS_API_KEY "your-api-key"
```

> **Note:** We'll set `DODO_PAYMENTS_WEBHOOK_KEY` after deployment once you have your webhook URL.

### 3. Initialize Site (first deployment only)

```bash
netlify init
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Get Your Webhook URL

Your webhook URL is:
```
https://[your-project].netlify.app/.netlify/functions/webhook
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
netlify env:set DODO_PAYMENTS_WEBHOOK_KEY "your-webhook-signing-key"
npm run deploy
```

## Local Development

```bash
npm run dev
```

Your webhook will be available at `http://localhost:8888/.netlify/functions/webhook`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `DODO_PAYMENTS_API_KEY` | Yes | API key for DodoPayments client |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Yes | Webhook signing key for verification |

## Webhook URL

After deployment, your webhook URL will be at:
```
https://[your-site-name].netlify.app/.netlify/functions/webhook
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

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [DodoPayments Docs](https://docs.dodopayments.com)
