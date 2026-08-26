# Suez Trading Internationale Limited — storefront, shop & management system

A Next.js application for **Suez Trading Internationale Limited** (Abuja, Nigeria):
a multi-page marketing site, an online shop with Paystack checkout, and a
management area where staff run the catalogue, stock and orders.

- **Framework** — Next.js 16 (App Router, React 19, Server Actions), TypeScript, Tailwind CSS v4
- **Design** — the shared Suez group system (see §3), matching Suez Electric and Suez Gas
- **Database** — PostgreSQL via Prisma 7 (built for [Neon](https://neon.tech); works with any Postgres)
- **Payments** — [Paystack](https://paystack.com) (card, bank transfer, USSD, mobile money)
- **Images** — [Cloudinary](https://cloudinary.com) upload + CDN + on-the-fly resizing
- **Currency** — Nigerian Naira, stored as integer kobo

---

## 1. Quick start

```bash
npm install
cp .env.example .env      # then fill in the values — see §2
npm run db:migrate        # create the schema
npm run seed              # 6 categories, 32 products, demo orders, staff logins
npm run dev
```

Open <http://localhost:3000>. The management area is at
<http://localhost:3000/admin>.

**Seeded logins** (change these before go-live):

| Email | Password | Role |
| --- | --- | --- |
| `admin@sueztrading.com` | `SuezAdmin2026!` | Owner |
| `manager@sueztrading.com` | `SuezManager2026!` | Manager |

### Local Postgres without a Neon account

```bash
docker run -d --name suez-postgres \
  -e POSTGRES_USER=suez -e POSTGRES_PASSWORD=suezdev -e POSTGRES_DB=sueztrading \
  -p 55432:5432 postgres:17-alpine
```

Then use `postgresql://suez:suezdev@localhost:55432/sueztrading` as your
`DATABASE_URL`. (`docker start suez-postgres` brings it back afterwards.)

---

## 2. Environment variables

Everything lives in `.env`. `.env.example` is the annotated template.

### Database — Neon

1. Create a project at <https://console.neon.tech>.
2. Copy **both** connection strings from the dashboard:
   - the **pooled** one (host contains `-pooler`) → `DATABASE_URL`
   - the **direct** one → `DIRECT_URL`

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/sueztrading?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/sueztrading?sslmode=require"
```

The app uses the pooled string so serverless invocations do not exhaust Neon's
connection limit; migrations use the direct string because DDL over the pooler
is unreliable.

### Admin authentication

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put the result in `AUTH_SECRET`. Changing it signs everyone out.

### Paystack

From <https://dashboard.paystack.com/#/settings/developers>:

```env
PAYSTACK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
```

Then register the webhook under **Settings → API Keys & Webhooks**:

```
https://your-domain.com/api/paystack/webhook
```

**The webhook is not optional.** The browser callback confirms most payments,
but it is lost whenever a customer closes the tab or their connection drops
mid-redirect. The webhook is the authoritative signal, and the two are safe to
receive in either order or simultaneously.

#### Demo payment mode

For stakeholder demos there is a simulated checkout, so the whole flow can be
walked without a Paystack merchant account:

```env
DEMO_PAYMENTS="true"    # simulate
DEMO_PAYMENTS="false"   # always use real Paystack
# unset                 # simulate only when PAYSTACK_SECRET_KEY is missing
```

The customer is sent to `/checkout/demo/[reference]`, a stand-in for the
Paystack hosted page carrying a clear "demonstration mode" notice, with buttons
to simulate a successful or a declined payment.

**Only the card network is simulated.** Everything downstream is the real
pipeline: the order is created, the atomic payment claim runs, stock is
allocated, the ledger entry is written, the coupon is counted and the receipt
is issued — exactly as a live Paystack webhook would drive it. All the Paystack
code stays in place and untouched; flipping the flag switches to live
processing.

### Cloudinary

From your Cloudinary dashboard (*Product Environment Credentials*):

```env
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_FOLDER="suez-trading/products"
```

**With no credentials set, uploads fall back to writing into `public/uploads`,**
so development works out of the box. That fallback needs a writable persistent
disk — fine on a VPS or a container with a volume, *not* on Vercel or Lambda,
where the filesystem is ephemeral. Configure Cloudinary before deploying
serverless.

<details>
<summary>Why Cloudinary rather than Cloudflare R2</summary>

R2 is excellent, cheap object storage with zero egress fees — but it stores
exactly what you upload. Staff photographing a cement pallet on a phone will
upload 4MB, and R2 will serve that same 4MB to every shopper on mobile data.
Getting resizing and format conversion means adding Cloudflare Images, a
separate paid product.

Cloudinary bundles upload, CDN delivery and transformation: appending
`f_auto,q_auto,w_400` to the URL turns that 4MB photo into a ~30KB WebP. For a
catalogue this size the free tier covers it comfortably.

R2 becomes the better choice at high volume, or if you consolidate on
Cloudflare. All the provider logic is in `lib/storage.ts` — implementing
`uploadImage` and `removeImage` against R2's S3 API is the only change needed;
nothing else in the app touches storage.
</details>

---

## 3. Design system

The storefront shares the Suez group visual system with
[Suez Electric](https://suezelectric.vercel.app) and
[Suez Gas](https://suezgas.vercel.app), so the three read as one company.

| | |
| --- | --- |
| Display | **Zodiak** (serif) — headings, prices, figures |
| Text & labels | **Switzer** — body copy, and uppercase wide-tracked labels (`.font-label`) |
| Data | **IBM Plex Mono** — references, SKUs, phone numbers |
| Ground | `bone` / `bone-2` / `bone-line` (warm paper) and `ink` / `ink-2` / `ink-line` (near black) |
| Accent | `cargo` `#d97b24` — Electric uses `voltage`, Gas uses `flame` |

Zodiak and Switzer load from Fontshare (linked in `app/layout.tsx`); IBM Plex
Mono comes through `next/font`.

Composition follows the group's rules: **borders rather than shadows**, pill
buttons, ruled grids instead of floating cards, and the accent used sparingly.
There are no drop shadows, gradient washes or decorative background patterns
anywhere in the system.

Tokens live in `app/globals.css` under `@theme`. Catalogue artwork is generated
into the same palette by `npm run art`.

## 4. What is in the box

### Storefront

| Route | Purpose |
| --- | --- |
| `/` | Landing page — divisions, live categories, featured stock, how ordering works |
| `/shop` | Catalogue with search, category filter, price sort, in-stock filter, pagination |
| `/shop/[slug]` | Product detail — live stock, quantity stepper, specs, related items |
| `/cart`, `/checkout` | Basket and Paystack checkout (delivery or depot pickup) |
| `/order/[reference]` | Receipt and live fulfilment status |
| `/track` | Order lookup by reference **and** email |
| `/services`, `/services/[slug]` | The six operating divisions |
| `/about`, `/contact`, `/faq` | Company record, enquiry form, help |
| `/legal/terms`, `/legal/privacy`, `/legal/shipping` | Terms of sale, privacy, delivery & returns |

### Management area (`/admin`)

- **Dashboard** — revenue this month vs last, orders today, awaiting fulfilment, low stock, best sellers
- **Orders** — search and filter, full detail, fulfilment status, internal notes, re-check payment with Paystack
- **Products** — full CRUD, image upload, pricing, featured toggles, draft/active/archived, duplicate
- **Inventory** — stock levels, reorder alerts, stock value at cost and retail, and a complete movement ledger
- **Categories**, **Discount codes**, **Enquiries**, **Staff accounts**, **Store settings**

Three roles: **Staff** (day-to-day), **Manager** (adds deletes, refunds, settings),
**Owner** (adds staff accounts).

---

## 5. How the money and stock logic works

This is the part worth understanding before changing anything.

**Prices are never trusted from the browser.** The cart posts product IDs and
quantities only; `lib/checkout.ts` re-prices every line from the database,
re-checks stock and minimum order quantities, and validates the coupon. A
tampered cart cannot change what is charged.

**Stock is allocated at payment, not at add-to-cart.** Reserving on add would
let an abandoned basket hold the last generator hostage.

**Payment confirmation is idempotent.** The webhook and the browser callback
race routinely. The order is claimed with a single conditional `UPDATE ... WHERE
paymentStatus <> 'PAID'`, so exactly one of them proceeds to decrement stock,
count the coupon and write the paid event.

**Stock decrements are atomic.** Each line uses
`UPDATE ... SET stock = stock - n WHERE id = ? AND stock >= n`, so two payments
landing in the same millisecond cannot both claim the last unit. If stock is
genuinely insufficient the order is still recorded — the customer has already
paid — the level goes negative, and an event is written to the order telling
staff to resolve it.

**Underpayments are never marked paid.** If Paystack reports an amount below
the order total, the order is held and flagged rather than fulfilled.

**Every stock change is on the ledger.** Sales, restocks, counts, damages,
returns and cancellations all write a `StockMovement` row carrying the
resulting balance, who did it and why — so `/admin/inventory` shows an audit
trail, not just a number.

Run the checks:

```bash
npm run verify:payment
```

It exercises pricing, coupons, the callback/webhook race, underpayment
rejection, failed payments, cancellation restock, and eight concurrent payments
competing for four units — then rolls everything back.

---

## 6. Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run seed` | Seed catalogue, staff, settings and demo orders |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:reset` | Drop, re-migrate and re-seed |
| `npm run db:studio` | Prisma Studio — browse the database |
| `npm run verify:payment` | Payment, stock and concurrency checks |
| `npm run check:deploy` | Validate environment and database before deploying |
| `npm run vercel-build` | Generate client, apply migrations, then build (Vercel build command) |
| `npm run art` | Regenerate the SVG catalogue artwork |

---

## 7. Deploying to Vercel with Neon

### 1. Create the database

In the [Neon console](https://console.neon.tech), create a project (pick the
region closest to your Vercel region — `eu-central-1` or `us-east-1` for
Nigeria-facing traffic). Copy **both** connection strings:

| Neon gives you | Goes in | Why |
| --- | --- | --- |
| **Pooled** (host contains `-pooler`) | `DATABASE_URL` | Serverless functions open a pool each; without PgBouncer they exhaust Neon's connection limit |
| **Direct** (no `-pooler`) | `DIRECT_URL` | Migrations run DDL, which is unreliable through PgBouncer |

Both need `?sslmode=require`.

### 2. Set the environment variables in Vercel

Add these under **Settings → Environment Variables** for Production (and
Preview, if you want previews to work):

```
DATABASE_URL       postgresql://…-pooler.…neon.tech/sueztrading?sslmode=require
DIRECT_URL         postgresql://…       .…neon.tech/sueztrading?sslmode=require
AUTH_SECRET        <node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
NEXT_PUBLIC_SITE_URL   https://your-domain.com

PAYSTACK_SECRET_KEY              sk_live_…
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY  pk_live_…
DEMO_PAYMENTS                    false

CLOUDINARY_CLOUD_NAME    …
CLOUDINARY_API_KEY       …
CLOUDINARY_API_SECRET    …
CLOUDINARY_FOLDER        suez-trading/products
```

> **Cloudinary is required on Vercel, not optional.** Vercel's filesystem is
> read-only and thrown away between deploys, so the `public/uploads` fallback
> cannot work there. Without these three variables the admin image upload will
> refuse with an explanatory error, and `/admin/settings` will show storage as
> unconfigured.

### 3. Point the build at migrations

Set the **Build Command** in Vercel to:

```
npm run vercel-build
```

which runs `prisma generate && prisma migrate deploy && next build`. Every
deploy then applies any pending migration before the new code goes live.

### 4. Seed once

Vercel cannot run the seed for you. From your machine, with `.env` pointed at
Neon:

```bash
npm run seed
```

Or skip the demo data and create just the first owner account.

### 5. Register the Paystack webhook

In the Paystack dashboard, **Settings → API Keys & Webhooks**:

```
https://your-domain.com/api/paystack/webhook
```

### 6. Check before you announce it

```bash
npm run check:deploy
```

This validates every variable, warns when you are still on a Neon direct
string, a Paystack test key or simulated payments, and confirms the database
is actually reachable. It exits non-zero on anything that would break
production, so it can also gate CI.

### Go-live checklist

- [ ] `AUTH_SECRET` regenerated (not the dev placeholder)
- [ ] Seeded admin passwords changed
- [ ] `DEMO_PAYMENTS` set to `false`
- [ ] Paystack switched from test keys to live keys
- [ ] Paystack webhook registered and returning 200
- [ ] Cloudinary configured — required on Vercel
- [ ] `DATABASE_URL` uses the **pooled** Neon host, `DIRECT_URL` the direct one
- [ ] `NEXT_PUBLIC_SITE_URL` matches the live origin
- [ ] Contact details in `lib/site.ts` replaced — they are marked `PLACEHOLDER`
- [ ] Prices and stock levels confirmed against the depot
- [ ] `npm run check:deploy` passes

## 8. Project layout

```
app/
  (storefront)/      public pages, sharing the header/footer/cart shell
  admin/
    (auth)/login     sign-in, outside the guarded shell
    (dashboard)/     the management area, guarded by requireAdmin()
    actions/         server actions for every admin mutation
  api/
    checkout         prices the cart and opens the Paystack transaction
    paystack/        webhook (authoritative) and browser callback
    admin/upload     authenticated image upload
components/
  cart/ home/ shop/ site/ admin/ ui/
lib/
  db.ts              Prisma client on the pg driver adapter
  checkout.ts        server-side re-pricing and stock validation
  orders.ts          applies a verified Paystack transaction, idempotently
  inventory.ts       the only place stock levels change
  storage.ts         Cloudinary upload, with a local-disk fallback
  demo-payments.ts   the simulated-payment switch and payload builder
  image.ts           Cloudinary delivery URL helpers
  auth.ts            session cookie, password hashing, role checks
  site.ts            company record and division copy
prisma/
  schema.prisma      the data model
  seed.ts            catalogue, staff, settings, demo orders
scripts/
  generate-art.mjs   builds the SVG catalogue artwork
  verify-payment.mts payment, stock and concurrency checks
```

---

## 9. Notes and known limits

- **Guest checkout only.** There are no customer accounts; orders are looked up
  by reference plus email. Customer logins, saved addresses and reorder would be
  a natural next phase.
- **No transactional email yet.** Order confirmations are shown on screen and in
  the management area, but nothing is emailed. Wiring Resend or Postmark into
  `lib/orders.ts` where the paid event is written is the place to add it.
- **Catalogue artwork is generated SVG.** `public/products/*.svg` are drawn by
  `scripts/generate-art.mjs` so the project has no external image dependency.
  Replace them with real photography through the admin image upload.
- **Contact details are placeholders.** Phone, email and social links in
  `lib/site.ts` are marked and must be confirmed before launch.
