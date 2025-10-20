# Vercel - DodoPayments Webhook

Deploy DodoPayments webhooks to Vercel's serverless platform.

## Features

- 🚀 **Fast deployment** - Deploy via Git or CLI
- 🔧 **Simple configuration** - Minimal setup required
- 💾 **Serverless PostgreSQL** - Via Neon database
- 🔒 **Webhook verification** - Built-in signature checking
- 📊 **Event logging** - Complete audit trail

## Prerequisites

### 1. Install Vercel CLI (one-time)

```bash
npm install -g vercel
```

### 2. Authenticate with Vercel (one-time)

```bash
vercel login
```

This will prompt you to authenticate via email or GitHub.

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

Via Vercel CLI:
```bash
vercel env add DATABASE_URL
vercel env add DODO_PAYMENTS_WEBHOOK_KEY
```

Or via [Vercel Dashboard](https://vercel.com/dashboard) → Project Settings → Environment Variables

### 3. Deploy

```bash
npm run deploy
```

## Local Development

```bash
npm run dev
```

Your webhook will be available at `http://localhost:3000/api/webhook`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Yes | Webhook signing key for verification |

## Deployment URL

After deployment, your webhook will be at:
```
https://[your-project].vercel.app/api/webhook
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

- [Vercel Functions Docs](https://vercel.com/docs/functions)
- [Vercel CLI](https://vercel.com/docs/cli)
- [DodoPayments Docs](https://docs.dodopayments.com)
