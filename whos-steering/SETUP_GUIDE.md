# WHO'S STEERING — Full Stack Setup Guide

## What's Included

```
whos-steering/
├── frontend/               ← React app (deploy to Netlify)
│   ├── src/
│   │   ├── pages/          ← Home, Catalog, Product, Configure, Checkout,
│   │   │                      Login, Account, Contact, Admin, OrderConfirmation
│   │   ├── components/     ← Nav, CartDrawer, WheelPreview
│   │   ├── context/        ← Cart + Auth (React Context)
│   │   └── lib/            ← API helper, data constants, price calculator
│   └── public/index.html
├── backend/                ← Express API (deploy to Railway)
│   ├── routes/             ← auth, products, checkout, orders, upload
│   ├── middleware/auth.js  ← JWT auth + admin guard
│   ├── db/
│   │   ├── pool.js         ← PostgreSQL connection pool
│   │   └── schema.sql      ← Full DB schema + seed data
│   └── server.js
└── netlify.toml            ← Netlify build config
```

---

## STEP 1 — Set Up Your Database (Supabase — Free)

1. Go to **https://supabase.com** → New Project
2. Name it `whos-steering`, set a strong DB password, save it
3. Go to **Settings → Database → Connection string → URI** — copy it
4. Open **SQL Editor** → paste the entire contents of `backend/db/schema.sql` → Run
5. That creates all tables, seeds your 3 products, and sets up pricing rules

---

## STEP 2 — Deploy the Backend API (Railway — Free tier)

1. Go to **https://railway.app** → New Project → Deploy from GitHub repo
   - Or: install Railway CLI: `npm install -g @railway/cli` then `railway login`
2. Point it at the `backend/` folder
3. Set these **environment variables** in Railway dashboard:

```
DATABASE_URL        = (your Supabase connection string from Step 1)
JWT_SECRET          = (generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
STRIPE_SECRET_KEY   = sk_live_xxxx   (from Stripe dashboard → Developers → API Keys)
STRIPE_WEBHOOK_SECRET = whsec_xxxx  (set up in Step 4)
FRONTEND_URL        = https://your-netlify-site.netlify.app
NODE_ENV            = production
PORT                = 3001

# For wheel photo uploads (see Step 3):
AWS_REGION          = us-east-1
AWS_ACCESS_KEY_ID   = xxxx
AWS_SECRET_ACCESS_KEY = xxxx
S3_BUCKET_NAME      = whos-steering-uploads
```

4. Railway will give you a URL like `https://whos-steering-api.up.railway.app`
   → Save this — you'll need it for the frontend

---

## STEP 3 — Set Up AWS S3 for Wheel Photo Uploads

> Customers upload a photo of their current wheel for fitment verification.

1. Go to **https://aws.amazon.com** → S3 → Create bucket
   - Name: `whos-steering-uploads`
   - Region: `us-east-1`
   - Uncheck "Block all public access" (photos need to be readable)
2. Add this **bucket policy** (replace YOUR_BUCKET_NAME):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
  }]
}
```
3. Go to **IAM → Users → Create User** → Attach `AmazonS3FullAccess` policy
4. Create access keys → copy into Railway env vars above

---

## STEP 4 — Set Up Stripe Webhooks

> Webhooks automatically update order status when payment succeeds.

1. Go to **https://dashboard.stripe.com → Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://your-railway-api.up.railway.app/api/checkout/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the **Signing secret** (starts with `whsec_`) → add to Railway as `STRIPE_WEBHOOK_SECRET`
5. Copy your **Publishable key** (starts with `pk_live_`) — needed for frontend

---

## STEP 5 — Deploy Frontend to Netlify

1. Push this whole repo to GitHub
2. Go to **https://netlify.com → Add new site → Import from Git**
3. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. Add these **environment variables** in Netlify (Site settings → Environment variables):
```
REACT_APP_API_URL                  = https://your-railway-api.up.railway.app
REACT_APP_STRIPE_PUBLISHABLE_KEY   = pk_live_xxxx
```
5. Click **Deploy site**

The `netlify.toml` file at the root handles routing (single-page app redirects).

---

## STEP 6 — Create Your Admin Account

1. Go to your live site → click **Login → Create Account**
2. Register with your email
3. In Supabase SQL editor, run:
```sql
UPDATE customers SET is_admin = TRUE WHERE email = 'your@email.com';
```
4. Now visit `/admin` on your site — you'll see the full dashboard

---

## STEP 7 — Test Stripe Payments (Before Going Live)

1. In Stripe dashboard, switch to **Test mode**
2. Replace `STRIPE_SECRET_KEY` temporarily with `sk_test_xxxx`
3. Replace `REACT_APP_STRIPE_PUBLISHABLE_KEY` with `pk_test_xxxx`
4. Use test card: `4242 4242 4242 4242` — any future expiry — any CVC
5. Place a test order end-to-end
6. Switch back to live keys when ready

---

## Database Tables Reference

| Table | Purpose |
|-------|---------|
| `customers` | Registered users + guest email tracking |
| `products` | Your 3 catalog wheels (BMW M Sport, Audi RS, Carbon Series) |
| `inventory` | Stock counts per product |
| `wheel_configurations` | Every custom build configuration saved |
| `orders` | Order records with shipping info and status |
| `order_items` | Line items linking orders to configurations |
| `payments` | Stripe PaymentIntent + charge references |
| `order_status_history` | Full audit trail of every status change |
| `pricing_rules` | Editable add-on prices (airbag, heated, etc.) |

---

## Admin Dashboard Features

- Live stats: total orders, paid, in-build, shipped, revenue (30d + all time)
- Full order table with status filtering
- One-click status updates with optional notes
- Complete audit trail per order
- Access at `/admin` (requires `is_admin = TRUE` in DB)

---

## Updating Prices

Prices are stored in the `pricing_rules` table — update them without touching code:

```sql
-- Change airbag add-on from $75 to $100
UPDATE pricing_rules SET amount = 100.00 WHERE rule_key = 'airbag_compat';

-- Change BMW base price
UPDATE pricing_rules SET amount = 899.99 WHERE rule_key = 'base_bmw';

-- Change a product's base price
UPDATE products SET base_price = 1399.99 WHERE sku = 'BMW-MSIG-001';
```

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # runs on :3001

# Frontend (new terminal)
cd frontend
cp .env.example .env   # fill in your values
npm install
npm start              # runs on :3000
```

---

## Quick Cost Estimate (Monthly)

| Service | Cost |
|---------|------|
| Netlify (frontend) | Free |
| Railway (backend) | ~$5–10/mo |
| Supabase (database) | Free up to 500MB |
| AWS S3 (photos) | ~$0.50–2/mo |
| Stripe | 2.9% + 30¢ per transaction |
| **Total** | **~$5–15/mo + Stripe fees** |
