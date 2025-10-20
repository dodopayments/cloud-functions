# Netlify - DodoPayments Webhook

Deploy DodoPayments webhooks to Netlify Functions.

## Features

- 🎯 **JAMstack optimized** - Perfect for static sites
- 🔄 **Auto-deploy** - Deploy from Git automatically
- 💾 **Serverless PostgreSQL** - Via Neon database
- 🔒 **Webhook verification** - Built-in signature checking
- 📊 **Event logging** - Complete audit trail

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

You'll need a PostgreSQL database. We recommend [Neon](https://neon.tech) for serverless PostgreSQL.

**Create the tables:**
1. Sign up for [Neon](https://neon.tech)
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

### 2. Set Environment Variables

Via Netlify CLI:
```bash
netlify env:set DATABASE_URL "your-neon-connection-string"
netlify env:set DODO_PAYMENTS_WEBHOOK_KEY "your-webhook-key"
```

Or via [Netlify Dashboard](https://app.netlify.com) → Site Settings → Environment Variables

### 3. Initialize Site (first deployment only)

```bash
netlify init
```

### 4. Deploy

```bash
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
| `DODO_PAYMENTS_WEBHOOK_KEY` | Yes | Webhook signing key for verification |

## Deployment URL

After deployment, your webhook will be at:
```
https://[your-site].netlify.app/.netlify/functions/webhook
```

Configure this URL in your DodoPayments dashboard.

## Security

This implementation uses the **[standardwebhooks](https://github.com/standard-webhooks/standard-webhooks)** library for battle-tested webhook signature verification.

**Features:**
- ✅ HMAC-SHA256 signature verification
- ✅ Automatic timestamp validation (5-minute tolerance)
- ✅ Replay attack prevention
- ✅ Constant-time comparison

**Important:** Always set `DODO_PAYMENTS_WEBHOOK_KEY` in production.

## Documentation

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [DodoPayments Docs](https://docs.dodopayments.com)
