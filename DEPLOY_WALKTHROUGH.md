# Astro Command Center - Deployment Walkthrough

## Build Summary

### What Was Built / Updated

This buildout completed the **Netlify serverless functions layer** that bridges the existing Express backend logic to Netlify's serverless deployment model. The frontend (React + Vite + Redux) and backend (Express + MongoDB + Socket.io) were already robust and remain the baseline.

---

## Critical Components

### 1. Netlify Serverless Functions (9 API endpoints)

| Function | File | Purpose |
|----------|------|---------|
| **api-products** | `netlify/functions/api-products.js` | Full CRUD for products with search, pagination, categories, featured products, reviews. Admin-protected create/update/delete via JWT. |
| **api-users** | `netlify/functions/api-users.js` | User registration, login (signin), profile get/update, admin user management (list, edit, delete), top-sellers. |
| **api-orders** | `netlify/functions/api-orders.js` | Order creation, payment processing (PayPal), delivery marking, order history, admin order list, dashboard summary aggregation. |
| **api-game** | `netlify/functions/api-game.js` | Frequency Match game score submission, game progress tracking, content unlock status checking. Supports anonymous play via sessionId. |
| **api-navigation** | `netlify/functions/api-navigation.js` | Public navigation menus by location (header/footer), site settings/branding, admin CRUD for navigation items. |
| **api-cms** | `netlify/functions/api-cms.js` | CMS dashboard stats, product management with pagination/filtering, bulk actions, site configuration. |
| **api-config** | `netlify/functions/api-config.js` | PayPal client ID and Google Maps API key configuration endpoints. |
| **api-uploads** | `netlify/functions/api-uploads.js` | Upload endpoint placeholder (requires cloud storage integration for production). |
| **api-health** | `netlify/functions/api-health.js` | Health check endpoint (pre-existing). |

### 2. Shared Utilities

| File | Purpose |
|------|---------|
| `netlify/functions/utils/response.js` | CORS headers, `successResponse()`, `errorResponse()`, `corsPreflightResponse()` helpers |
| `netlify/functions/utils/auth.js` | JWT token generation, verification, `isAuth()` and `isAdmin()` middleware for serverless |
| `netlify/functions/utils/db.js` | MongoDB connection with caching for serverless cold starts (pre-existing) |

### 3. Database Models (Netlify Functions)

| Model | File | Key Fields |
|-------|------|------------|
| **Product** | `netlify/functions/models/productModel.js` | Now includes: `slug`, `longDescription`, `features[]`, `unlockRequirement` (free/purchase/game), `gameScoreRequired`, `streamUrl`, `downloadUrl`, `contentType`, `tags[]`, `featured`, `featuredOrder` |
| **User** | `netlify/functions/models/userModel.js` | Now includes: `matchPassword()` method via bcrypt, `pre('save')` password hashing hook |
| **Order** | `netlify/functions/models/orderModel.js` | Full order schema with items, shipping, payment, status tracking (pre-existing) |
| **GameProgress** | `netlify/functions/models/gameProgressModel.js` | Session-based game tracking, unlocked content refs, achievements array (pre-existing) |
| **CMS** | `netlify/functions/models/cmsModel.js` | `SiteConfig` (branding, social links, game/commerce/payment settings) and `Navigation` (menu items with nesting, roles) |

### 4. Configuration Updates

- **`netlify.toml`**: Added `www.astromahri.space` -> `astromahri.space` 301 redirect
- **`package.json`**: Updated description and author to "Astro Mahri"

### 5. Frontend (Unchanged - Already Complete)

The frontend was already fully built with:
- React 17 + Vite + React Router v6
- Redux state management with actions/reducers for products, users, orders, cart
- FrequencyMatch game component (Web Audio API)
- AchievementNotification component (Toast-based)
- ModernNavigation, ModernCard, ModernProduct, ModernButton design system
- CMS admin screens (Dashboard, Artists, Products, Navigation)
- Session manager for anonymous gaming
- Cosmic design system CSS with Orbitron + Inter fonts

---

## Pre-Deployment Checklist

### Environment Variables Required in Netlify Dashboard

Go to **Site Settings > Environment Variables** and set:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/astrocommandcenter?retryWrites=true&w=majority
JWT_SECRET=<strong-random-secret-32-chars-minimum>
NODE_ENV=production
PAYPAL_CLIENT_ID=<your-paypal-client-id>
STRIPE_SECRET_KEY=<your-stripe-secret-key>  (optional, for future Stripe integration)
GOOGLE_API_KEY=<your-google-maps-key>  (optional, for map features)
```

### MongoDB Atlas Setup

1. Ensure your MongoDB Atlas cluster is active
2. Whitelist `0.0.0.0/0` in Network Access (required for Netlify serverless)
3. Verify database user credentials match `MONGODB_URI`

---

## Deployment Steps (Manual)

### Step 1: Verify Local Build

```bash
cd astromahrixspace
npm run build
```

This runs: `npm install && npm install --prefix frontend && npm run build --prefix frontend`

Verify `frontend/build/` directory is created with `index.html`.

### Step 2: Seed Database (if needed)

```bash
# Set MONGODB_URI in .env first
npm run cosmic:setup
```

This destroys existing data and imports seed users + products.

### Step 3: Test Locally with Netlify Dev

```bash
npx netlify dev
```

Verify at `http://localhost:8890`:
- [ ] Landing page loads
- [ ] Navigation renders
- [ ] Products page shows items (`/merch`)
- [ ] Game page works (`/games`)
- [ ] Sign in works (`/signin`)
- [ ] Cart functionality works

### Step 4: Deploy to Netlify

```bash
# Preview deploy (non-production URL)
npx netlify deploy

# Production deploy
npx netlify deploy --prod
```

### Step 5: Verify Production

After production deploy, verify at `https://astromahri.space`:

- [ ] Homepage/Landing page loads
- [ ] API health check: `https://astromahri.space/api/health`
- [ ] Products load: `https://astromahri.space/api/products`
- [ ] User registration works
- [ ] User login works
- [ ] Frequency Match game plays and submits scores
- [ ] Cart and checkout flow works
- [ ] Admin dashboard accessible (login as admin@astromahri.space)
- [ ] CMS dashboard loads
- [ ] Navigation management works
- [ ] www redirect works: `https://www.astromahri.space` -> `https://astromahri.space`

### Step 6: DNS Configuration (if not already done)

In your domain registrar, ensure:
- A record or ALIAS pointing `astromahri.space` to Netlify
- CNAME for `www.astromahri.space` pointing to your Netlify site
- SSL certificate provisioned in Netlify dashboard

---

## Architecture Overview

```
Browser
  |
  v
Netlify CDN (frontend/build - static React SPA)
  |
  |-- /api/* redirects to /.netlify/functions/api-*
  v
Netlify Functions (serverless Node.js)
  |-- api-products.js  (Products CRUD + search + reviews)
  |-- api-users.js     (Auth + user management)
  |-- api-orders.js    (Orders + payments + delivery)
  |-- api-game.js      (Frequency Match + achievements + unlocks)
  |-- api-navigation.js (Navigation menus + site settings)
  |-- api-cms.js       (CMS admin dashboard)
  |-- api-config.js    (PayPal/Google config)
  |-- api-uploads.js   (File upload placeholder)
  |-- api-health.js    (Health check)
  |
  v
MongoDB Atlas (shared connection pool, cached for serverless)
```

## API Route Mapping

All frontend `/api/*` calls are redirected by `netlify.toml`:

```
/api/products/*     -> api-products function
/api/users/*        -> api-users function
/api/orders/*       -> api-orders function
/api/game/*         -> api-game function
/api/navigation/*   -> api-navigation function
/api/cms/*          -> api-cms function
/api/config/*       -> api-config function
/api/uploads        -> api-uploads function
/api/health         -> api-health function
```

---

## Known Limitations / Future Work

1. **File Uploads**: The `api-uploads` function is a placeholder. For production file uploads, integrate Cloudinary, AWS S3, or Netlify Blobs.
2. **Socket.io**: Real-time chat (ChatBox component) requires the Express backend server running. In pure serverless mode, consider migrating to a WebSocket service (e.g., Ably, Pusher).
3. **Content Models**: The CMS uses simplified models in serverless. The full `ArtistModel`, `MediaItemModel`, `EnhancedProductModel`, and `AchievementModel` from the Express backend are not yet ported to serverless functions. The CMS dashboard works with the base Product model.
4. **Email**: Mailgun email functionality requires the Express server. For serverless, consider Netlify Functions + Mailgun API or SendGrid.
