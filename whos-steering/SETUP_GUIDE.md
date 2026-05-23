# WHO'S STEERING — Full Stack Setup Guide

## What's Included

```
whos-steering/
├── frontend/               ← React app (deploy to Netlify — free)
│   ├── src/
│   │   ├── pages/          ← Home, Catalog, Product, Configure, Checkout,
│   │   │                      Login, Account, Contact, Admin, OrderConfirmation
│   │   ├── components/     ← Nav, CartDrawer, WheelPreview
│   │   ├── context/        ← Cart + Auth (React Context)
│   │   └── lib/            ← API helper, data constants, price calculator
│   └── public/index.html
├── backend/                ← Express API (deploy to Render — free)
│   ├── routes/             ← auth, products, checkout, orders, upload
│   ├── middleware/auth.js  ← JWT auth + admin guard
│   ├── db/
│   │   ├── pool.js         ← PostgreSQL connection pool
│   │   └── schema.sql      ← Full DB schema + seed data
│   └── server.js
└── netlify.toml            ← Netlify build config (already configured)
```

**No AWS. No paid services. Everything runs free on:**
- Netlify (frontend)
- Render (backend API)
- Supabase (database + image storage)
- Stripe (payments — 2.9% + 30¢ per transaction, no monthly fee)

---

## STEP 1 — Push Your Code to GitHub

Render and Netlify both deploy directly from GitHub, so this needs to happen first.

1. Go to **https://github.com** → New repository → name it `whos-steering` → Create
2. Open a terminal inside the `whos-steering/` folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/whos-steering.git
git push -u origin main
```

---

## STEP 2 — Set Up Supabase (Database + Image Storage)

You get both your PostgreSQL database and your wheel photo storage from one free Supabase project.

### 2a — Create the project

1. Go to **https://supabase.com** → New Project
2. Name it `whos-steering`, set a strong DB password — **save the password somewhere safe**
3. Wait for provisioning (~1 minute)

### 2b — Get your credentials

Go to **Settings → API** and copy these three values — you'll need all of them:

| What | Where to find it |
|------|-----------------|
| **Project URL** | Settings → API → Project URL (`https://xxxx.supabase.co`) |
| **Service Role Key** | Settings → API → Project API keys → `service_role` (click reveal) |
| **Database URI** | Settings → Database → Connection string → URI |

### 2c — Run the database schema

1. Go to **SQL Editor** in the left sidebar → New query
2. Paste the entire contents of `backend/db/schema.sql` → click **Run**
3. You should see "Success" — all 9 tables are created, your 3 products seeded, pricing rules set up

### 2d — Create the image storage bucket

1. Go to **Storage** in the left sidebar → **New bucket**
2. Name it exactly: `wheel-photos`
3. Toggle **Public bucket** to ON (so photo URLs are publicly accessible)
4. Click **Create bucket**
5. Click into the `wheel-photos` bucket → **Policies tab → New policy → For full customization**
6. Add this policy to allow uploads:
   - Policy name: `allow-uploads`
   - Allowed operation: `INSERT`
   - Target roles: leave blank (allows all)
   - Click **Review** → **Save policy**

---

## STEP 3 — Deploy the Backend API (Render — Free)

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after idle takes ~30 seconds to wake up on the first visit. Fine for a new store.

1. Go to **https://render.com** → Sign up → **New → Web Service**
2. Connect your GitHub account → select the `whos-steering` repo
3. Fill in the service settings:
   - **Name:** `whos-steering-api`
   - **Root directory:** `backend`
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
   - **Instance type:** Free
4. Add these **Environment Variables**:

```
DATABASE_URL          = (your Supabase Database URI from Step 2b)
SUPABASE_URL          = (your Supabase Project URL from Step 2b)
SUPABASE_SERVICE_KEY  = (your Supabase service_role key from Step 2b)
JWT_SECRET            = (generate one — see below)
STRIPE_SECRET_KEY     = sk_live_xxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxx   (add this after Step 4)
FRONTEND_URL          = https://your-site.netlify.app  (update after Step 5)
NODE_ENV              = production
```

**To generate a JWT_SECRET**, run this in any terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

5. Click **Create Web Service**
6. Once deployed, copy your Render URL:
   `https://whos-steering-api.onrender.com`
   → **Save this — you need it in Steps 4 and 5**

---

## STEP 4 — Set Up Stripe Webhooks

> Webhooks automatically flip your order to "paid" the moment a payment clears.

1. Go to **https://dashboard.stripe.com → Developers → Webhooks → Add endpoint**
2. Set the **Endpoint URL** to:
```
https://whos-steering-api.onrender.com/api/checkout/webhook
```
3. Click **Select events** and choose:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Click **Add endpoint**
5. On the webhook page, click **Reveal** next to **Signing secret** → copy the `whsec_...` value
6. Go back to **Render → Environment** and add:
```
STRIPE_WEBHOOK_SECRET = whsec_xxxx
```
7. While in Stripe, go to **Developers → API Keys** and copy your **Publishable key** (`pk_live_...`) — needed in Step 5

---

## STEP 5 — Deploy Frontend to Netlify

1. Go to **https://netlify.com** → **Add new site → Import an existing project → GitHub**
2. Select the `whos-steering` repo
3. Set the build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
4. Click **Show advanced → New variable** and add both:
```
REACT_APP_API_URL                = https://whos-steering-api.onrender.com
REACT_APP_STRIPE_PUBLISHABLE_KEY = pk_live_xxxx
```
5. Click **Deploy site**
6. Once live, copy your Netlify URL (e.g. `https://whos-steering.netlify.app`)
7. Go back to **Render → Environment** and update:
```
FRONTEND_URL = https://whos-steering.netlify.app
```
8. In Render, click **Manual Deploy → Deploy latest commit** to apply the change

The `netlify.toml` already handles all routing for you — nothing extra to configure.

---

## STEP 6 — Create Your Admin Account

1. Visit your live Netlify site → **Login → Create Account** → register with your email
2. Go to **Supabase → SQL Editor** and run:
```sql
UPDATE customers SET is_admin = TRUE WHERE email = 'your@email.com';
```
3. Log back in and go to `/admin` — full dashboard access

---

## STEP 7 — Test Stripe Payments Before Going Live

1. In **Stripe dashboard**, flip to **Test mode** (top right toggle)
2. **Render → Environment**, temporarily set:
```
STRIPE_SECRET_KEY = sk_test_xxxx
```
3. **Netlify → Site settings → Environment variables**, temporarily set:
```
REACT_APP_STRIPE_PUBLISHABLE_KEY = pk_test_xxxx
```
4. Redeploy both (Render: Manual Deploy, Netlify: Trigger deploy)
5. Place a test order using: card `4242 4242 4242 4242` — any future expiry — any CVC
6. Check Render logs + Supabase `orders` table — confirm order is created and status flips to `paid`
7. Check Stripe dashboard — PaymentIntent should show **Succeeded**
8. Swap back to live keys and redeploy both when ready

---

## How to View Customer Wheel Photos (Admin)

When a customer submits a custom build, they upload a photo of their current wheel. You can view it in two places:

**Admin Dashboard (`/admin`)**
Click **VIEW & UPDATE** on any order. The full order detail modal shows:
- The customer's submitted wheel photo(s) — click any photo to enlarge it
- Every build specification (brand, vehicle, materials, colors, options)
- Shipping address and order timeline
- Status update controls

**Customer Account (`/account`)**
When a customer expands any of their orders they see the same — their submitted photo and full build spec — so they always have a record of exactly what they ordered.

All photos are stored in your Supabase `wheel-photos` bucket. You can also browse them directly in **Supabase → Storage → wheel-photos** at any time.

---

## Database Tables Reference

| Table | Purpose |
|-------|---------|
| `customers` | Registered users + guest email tracking |
| `products` | Your 3 catalog wheels (BMW M Sport, Audi RS, Carbon Series) |
| `inventory` | Stock counts per product |
| `wheel_configurations` | Every custom build spec + photo URL |
| `orders` | Order records with shipping info and status |
| `order_items` | Line items linking orders to configurations |
| `payments` | Stripe PaymentIntent + charge references |
| `order_status_history` | Full audit trail of every status change |
| `pricing_rules` | Editable add-on prices (airbag, heated, etc.) |

---

## Admin Dashboard Features

- Live stats: total orders, paid, in-build, shipped, revenue (30d + all time)
- Full order table with status filtering
- Click any order to open a full detail view with the customer's wheel photo, all build specs, shipping info, and status timeline
- Click photo to enlarge fullscreen
- Update order status with optional notes
- Access at `/admin` — requires `is_admin = TRUE` in DB

---

## Updating Prices

Change any price without touching code — just run a query in Supabase SQL Editor:

```sql
-- Change airbag add-on from $75 to $100
UPDATE pricing_rules SET amount = 100.00 WHERE rule_key = 'airbag_compat';

-- Change BMW base price
UPDATE pricing_rules SET amount = 899.99 WHERE rule_key = 'base_bmw';

-- Change Audi base price
UPDATE pricing_rules SET amount = 800.00 WHERE rule_key = 'base_audi';

-- Change magnetic paddle upgrade
UPDATE pricing_rules SET amount = 75.00 WHERE rule_key = 'paddle_magnetic';

-- Change a catalog product's listed price
UPDATE products SET base_price = 1399.99 WHERE sku = 'BMW-MSIG-001';
```

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env       # fill in your values
npm install
npm run dev                # runs on http://localhost:3001

# Frontend (new terminal)
cd frontend
cp .env.example .env       # set REACT_APP_API_URL=http://localhost:3001
npm install
npm start                  # runs on http://localhost:3000
```

---

## Full Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Netlify (frontend) | **Free** | Unlimited deploys, custom domain |
| Render (backend API) | **Free** | Spins down after 15 min idle |
| Supabase (database + photos) | **Free** | 500MB DB, 1GB storage |
| Stripe | 2.9% + 30¢ per sale | No monthly fee ever |
| **Total** | **$0/mo + Stripe fees** | 100% free infrastructure |
