# Copilot instructions for this repo

## ⚠️ Critical Development Guidelines

**ALWAYS CONSULT MVP_DEV_GUIDE.md FIRST:**

- Before starting any new feature work, check `MVP_DEV_GUIDE.md` for current project status and priorities
- Focus on MVP-critical features listed in the guide before working on enhancements
- Follow the established architecture and avoid introducing new frameworks without discussion
- Update the guide when completing major milestones or features

**ALWAYS ASK BEFORE COMMITTING BREAKING CHANGES:**

- Never commit changes that modify core functionality without explicit user approval
- Always test changes locally before committing, especially changes to:
  - API endpoints and routing
  - Redux actions/reducers and state management
  - Component imports and dependencies
  - Database schema modifications
- If a change might break existing functionality, describe the impact and ask for permission
- When making large feature additions, implement them as optional/fallback-compatible first
- Test the full user flow (frontend + backend) before committing

**Breaking Change Examples to Always Ask About:**

- Changing product listing logic (featured vs regular products)
- Modifying API response structures
- Adding new required dependencies
- Changing component prop structures
- Database model field changes
- Authentication/routing modifications

## 📝 Notes for AI Assistants

When working on this project, always:
1. **Check MVP_DEV_GUIDE.md first** to understand current progress and priorities
2. **Follow the established architecture** - don't introduce new frameworks without discussion
3. **Maintain the cosmic/retro theme** in all UI updates
4. **Test changes** on both desktop and mobile viewports
5. **Update MVP_DEV_GUIDE.md** when major features are completed
6. **Focus on MVP-critical features** before enhancements

Current critical path from MVP guide: **E-commerce functionality → Testing → Launch**

Purpose: Help AI agents quickly understand how to run, and extend this app without guesswork. Keep edits aligned with these patterns and file locations.

## Architecture (big picture)

- Full-stack JS app with ESM modules.
  - Backend: Express + Mongoose, JWT auth, Mailgun emails, Socket.IO chat.
    - Entry: `backend/server.js` mounts routers under `/api/*` and serves built frontend from `frontend/build` in production.
    - Routers: `backend/routers/{product,user,order,upload,game}Router.js`.
    - Models: `backend/models/{productModel,userModel,orderModel,gameProgressModel}.js`.
    - Health: `GET /health` returns JSON with mongo state and env.
  - Frontend: React (Vite dev server on 3002), Redux, axios.
    - Dev proxy: `frontend/vite.config.mjs` proxies `/api` → `http://localhost:5000`.
    - Entry: `frontend/src/main.jsx` lazy-loads `App.jsx`. Build outputs to `frontend/build`.
    - Screens are in `.jsx` format only (duplicate `.js` versions removed).
- Game system: `backend/routers/gameRouter.js` + `backend/models/gameProgressModel.js` track anonymous progress by `sessionId` (unique). Score ≥150 unlocks product slug `earl-analysis-collection` and awards achievements.

## How to run (local dev)

- Backend: `npm run dev` (nodemon, port 5000; requires Mongo running).
- Frontend: `npm start --prefix frontend` (Vite on 3002, proxy to 5000).
- VS Code tasks (recommended): "Start Backend" and "Start Frontend"; or "Start Full Stack".
- Mongo via Docker (optional):
  - `npm run db:up` / `npm run db:logs` / `npm run db:down` (uses `docker-compose.yml`).
- Seeding: `npm run seed:reset` (alias of destroy+import) or `npm run data:import` / `npm run data:destroy`.
  - Seeder refuses to run in production unless `--force` is passed.

## Environment variables

Backend uses (with safe fallbacks):

- `MONGODB_URL` or `MONGODB_URI` (fallback `mongodb://localhost/astromahrixspace`).
- `JWT_SECRET` (fallback `somethingsecret` for dev).
- `PAYPAL_CLIENT_ID` (served via `GET /api/config/paypal`).
- Mailgun: `MAILGUN_API_KEY`, `MAILGUN_DOMIAN` (note typo in key name is intentional in code).

## API conventions

- Use `express-async-handler` and return errors via the centralized error handler (`res.status(500).send({ message })`).
- Auth: attach `isAuth`, `isAdmin`, `isSellerOrAdmin` middlewares from `backend/utils.js`.
- Products list supports filters via query params (`name, category, seller, min, max, rating, order`) and pagination (`pageNumber`, page size 3); see `productRouter.get('/')`.
- Seeding endpoints (`/api/users/seed`, `/api/products/seed`) are protected and disabled in production.
- Socket.IO events in `server.js`: `onLogin`, `onUserSelected`, `onMessage` (admin/user chat relay). Keep event names stable.

## Frontend conventions

- Keep API calls relative (e.g., `axios.get('/api/products')`); dev uses Vite proxy, prod uses same-origin Express.
- Redux store in `frontend/src/store.js`; components under `frontend/src/components/**` and pages in `frontend/src/App*.{jsx,tsx}`.
- Vite config outputs to `build` to match Netlify and Express static serving.

## Modern Design System

- **Comprehensive CSS framework** implemented with cosmic theme preservation:
  - Core: `frontend/src/styles/modern-design-system.css` (design tokens, utilities, responsive grid)
  - Components: `frontend/src/styles/components.css` (component-specific styles)
  - Integration: `frontend/src/index.css` imports both with legacy compatibility
- **Modern React components** in `frontend/src/components/`:
  - `ModernButton.jsx` - Multi-variant button system (primary, secondary, accent, outline, ghost)
  - `ModernCard.jsx` - Flexible card component with backdrop blur
  - `ModernInput.jsx` - Form inputs with validation states
  - `ModernProduct.jsx` - Product cards with hover effects and responsive layout
  - `ModernGameInterface.jsx` - Interactive game interface with cosmic styling
  - `ModernNavigation.jsx` - Responsive navigation with mobile menu
- **Responsive breakpoints**: Mobile-first design (640px, 768px, 1024px, 1280px, 1536px)
- **Utility classes**: Tailwind-inspired utilities (spacing, typography, layout, effects)
- **CSS custom properties**: Extensive use of CSS variables for theming and consistency
- **Admin interface styling**: Specialized classes for CMS admin screens (`.admin-*` classes)
- **Documentation**: See `DESIGN_SYSTEM.md` for full component API and `MIGRATION_GUIDE.md` for integration steps

## Netlify / deployment

- `netlify.toml` builds frontend and publishes `frontend/build`. Redirects `/api/*` → `/.netlify/functions/api-:splat` are defined, but this repo currently implements APIs in Express (`backend/server.js`). If adding Netlify Functions, mirror routes under `netlify/functions` using the `api-*` naming scheme.
- Node 18 is specified for builds. Secrets must be set in provider UI, not committed.

## Patterns to follow (examples)

- New API route:
  - Create `backend/routers/xyzRouter.js` exporting an `express.Router()` with async handlers.
  - Mount in `backend/server.js` as `app.use('/api/xyz', xyzRouter);`.
- Game unlocks: Use `GameProgress.findOne({ sessionId })`; push product `_id` to `unlockedContent` and append achievement objects `{ name, description, icon, unlockedAt }`.
- **UI Components**: Use modern components from the design system:
  - Buttons: `<ModernButton variant="primary" size="lg">Text</ModernButton>`
  - Forms: `<ModernInput label="Email" type="email" error={errorMsg} />`
  - Cards: `<ModernCard header={<h3>Title</h3>}>Content</ModernCard>`
  - Navigation: `<ModernNavigation user={userInfo} cartItems={cartItems} />`
- **Responsive layouts**: Use utility classes `grid grid-cols-1 md:grid-cols-3 gap-6` for responsive grids
- **Admin styling**: Use `.admin-*` classes for CMS interfaces (`.admin-layout`, `.admin-nav`, `.admin-form-*`)

## Gotchas

- Product unlock logic relies on a product with slug `earl-analysis-collection`; ensure it exists in seed data.
- `MAILGUN_DOMIAN` env var name contains a typo in code; set it as-is.
- The backend serves `frontend/build` and `/uploads` statically; keep paths intact when refactoring.
- Use VS Code tasks for development; `npm run cosmic:dev` script removed (required missing `concurrently` dependency).

If anything above is unclear or you need additional conventions documented (e.g., component structure or CI specifics), ask and we’ll refine this file.
