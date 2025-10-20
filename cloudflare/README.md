# Cloudflare Workers - DodoPayments Webhook

Deploy DodoPayments webhooks to Cloudflare's global edge network with zero cold starts.

## Features

- ⚡ **Zero cold starts** - Instant response times
- 🌍 **Global edge deployment** - 300+ locations worldwide  
- 💾 **Serverless PostgreSQL** - Via Neon database
- 🔒 **Webhook verification** - Built-in signature checking
- 📊 **Event logging** - Complete audit trail

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

### 2. Configure Secrets

```bash
# Set your Neon database URL
wrangler secret put DATABASE_URL

# Set your webhook signing key (required)
wrangler secret put DODO_PAYMENTS_WEBHOOK_KEY
```

### 3. Update wrangler.toml

Edit `wrangler.toml` and set your worker name:

```toml
name = "my-dodo-webhook"
```

### 4. Deploy

```bash
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
| `DODO_PAYMENTS_WEBHOOK_KEY` | Yes | Webhook signing key for verification |

## Deployment URL

After deployment, your webhook will be at:
```
https://[worker-name].[your-subdomain].workers.dev
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

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [DodoPayments Docs](https://docs.dodopayments.com)

