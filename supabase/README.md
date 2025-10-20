# Supabase Edge Functions - DodoPayments Webhook

Deploy DodoPayments webhooks to Supabase Edge Functions with Deno runtime.

## Features

- 🦕 **Modern Deno runtime** - TypeScript-first
- 🔐 **Integrated auth** - Works with Supabase Auth
- 💾 **Built-in database** - Direct Supabase PostgreSQL access
- 🔒 **Webhook verification** - Built-in signature checking
- 📊 **Event logging** - Complete audit trail

## Prerequisites

### 1. Supabase CLI via npx

```bash
npx supabase --version
```

### 2. Authenticate with Supabase (one-time)

```bash
npx supabase login
```

This will open your browser to authenticate with your Supabase account.

### 3. Link to Your Project (per project)

```bash
npx supabase link --project-ref your-project-ref
```

Get your project ref from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings.

### 4. Database Setup

Create the required tables using Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open the SQL Editor
3. Create a new query
4. Copy and paste the entire contents of [`schema.sql`](../schema.sql)
5. Run the query

Your webhook handler will then be ready to receive events!

## Quick Start

### 1. Set Environment Variables

Supabase automatically provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` at runtime.

Set your webhook key:

```bash
npx supabase secrets set DODO_PAYMENTS_WEBHOOK_KEY=your-webhook-key
```

### 2. Deploy

The function is already set up in `supabase/functions/webhook/index.ts` - just deploy it:

```bash
npm run deploy
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key for database access |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Yes | Webhook signing key for verification |

## Deployment URL

After deployment, your webhook will be at:
```
https://[project-ref].supabase.co/functions/v1/webhook
```

Configure this URL in your DodoPayments dashboard.

## Documentation

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [DodoPayments Docs](https://docs.dodopayments.com)

