# Dodo Payments Cloud Functions
<a href="https://discord.gg/bYqAp4ayYh">
    <img src="https://img.shields.io/discord/1305511580854779984?label=Join%20Discord&logo=discord" alt="Join Discord" />
  </a>

Production-ready webhook handlers for [Dodo Payments](https://dodopayments.com) across multiple serverless platforms.

## 🚀 Choose Your Platform

Choose your preferred serverless platform. Each folder contains a complete, ready-to-deploy implementation:

- **[Cloudflare Workers](./cloudflare/README.md)**
- **[Vercel Functions](./vercel/README.md)**
- **[Netlify Functions](./netlify/README.md)**
- **[Supabase Edge Functions](./supabase/README.md)**

Each guide includes step-by-step setup with CLI installation, authentication, and deployment instructions.

## 🗄️ Database Requirements

Each implementation includes a webhook handler connected to a PostgreSQL database:

- **Cloudflare, Vercel, Netlify** use **[Neon](https://neon.com)** - Serverless PostgreSQL with connection pooling
- **Supabase** uses **Supabase PostgreSQL** - Built-in database with your Supabase project

Both are optimized for serverless. You can also use any PostgreSQL database by providing a connection string (AWS RDS, self-hosted, etc.)

> 💡 **First time?** See the individual platform guides above for detailed prerequisites, CLI setup, and deployment instructions.

## 📦 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/dodopayments/cloud-functions.git
cd cloud-functions
```

### 2. Setup Database

Use your database provider's SQL editor to run [`schema.sql`](./schema.sql):

- **Neon**: Open SQL Editor → paste schema.sql → run
- **Supabase**: SQL Editor → New Query → paste schema.sql → run

### 3. Choose Your Platform

Navigate to your preferred platform folder and follow its detailed setup guide:

- **[Cloudflare Workers](./cloudflare/README.md)**
- **[Vercel Functions](./vercel/README.md)**
- **[Netlify Functions](./netlify/README.md)**
- **[Supabase Edge Functions](./supabase/README.md)**

Each guide includes:
- ✅ CLI installation & authentication
- ✅ Environment variable setup
- ✅ Deployment instructions

## 🗄️ Database Setup

All implementations require PostgreSQL tables. Create them using your database provider's SQL editor:

**For Neon (Cloudflare, Vercel, Netlify):**
1. Create a [Neon account](https://neon.com)
2. Create a new project
3. Open the SQL Editor in Neon dashboard
4. Copy and paste the entire contents of [`schema.sql`](./schema.sql)
5. Run the query

**For Supabase:**
1. Create a [Supabase account](https://supabase.com)
2. Create a new project
3. Go to SQL Editor in your Supabase dashboard
4. Create a new query
5. Copy and paste the entire contents of [`schema.sql`](./schema.sql)
6. Run the query

The schema creates three tables:
- **`customers`** - Customer information from Dodo Payments
- **`subscriptions`** - Subscription data and status
- **`webhook_events`** - Complete webhook event log for audit and retry purposes

## 🔔 Webhook Events Handled

All implementations process these Dodo Payments events:

| Event | Description |
|-------|-------------|
| `subscription.active` | New subscription activated |
| `subscription.cancelled` | Subscription cancelled |
| `subscription.renewed` | Subscription renewed (updates billing date) |

> **Note:** These implementations demonstrate handling three core subscription events (`subscription.active`, `subscription.cancelled`, `subscription.renewed`) with minimal fields. You can easily extend them to support additional event types and fields based on your requirements.

## 🔒 Security

### Webhook Signature Verification

All implementations use the **[dodopayments](https://www.npmjs.com/package/dodopayments)** library for secure webhook verification.

**⚠️ Important:** Both `DODO_PAYMENTS_API_KEY` and `DODO_PAYMENTS_WEBHOOK_KEY` are **required**.

### Best Practices

- ✅ Always verify signatures in production
- ✅ Use environment variables for secrets
- ✅ Enable HTTPS only
- ✅ Monitor webhook logs
- ✅ Set up error alerting

## 📁 Repository Structure

```
cloud-functions/
├── cloudflare/          # Cloudflare Workers implementation
│   ├── worker.ts
│   ├── wrangler.toml
│   ├── package.json
│   └── README.md
│
├── vercel/              # Vercel Functions implementation
│   ├── api/webhook/index.ts
│   ├── vercel.json
│   ├── package.json
│   └── README.md
│
├── netlify/             # Netlify Functions implementation
│   ├── functions/webhook.ts
│   ├── netlify.toml
│   ├── package.json
│   └── README.md
│
├── supabase/            # Supabase Edge Functions implementation
│   ├── functions/webhook/index.ts
│   ├── package.json
│   └── README.md
│
├── schema.sql           # PostgreSQL database schema
└── README.md            # This README file
```

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🔗 Resources

- [DodoPayments](https://dodopayments.com) - Payment platform
- [DodoPayments Docs](https://docs.dodopayments.com) - Official documentation
- [Neon Database](https://neon.com) - Serverless PostgreSQL
- [Cloudflare Workers](https://workers.cloudflare.com)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Netlify Functions](https://docs.netlify.com/functions)
- [Supabase Edge Functions](https://supabase.com/edge-functions)

## 💬 Support

- **DodoPayments**: [Support Portal](https://dodopayments.com/support)
- **Issues**: [GitHub Issues](https://github.com/dodopayments/cloud-functions/issues)

---

Made with ❤️ for the DodoPayments community
