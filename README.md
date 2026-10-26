# IMovies — Modern Cinema Ticket Booking Platform

IMovies is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed for high-concurrency movie discovery, seat selection, and ticket booking. It features real-time seat availability visualization, concurrency-safe atomic reservations, role-based administration, and responsive dark-mode cinema aesthetics.

---

## Key Features

- **Movie Discovery & Filtering:** Live catalogue with multi-genre filters (Action, Sci-Fi, Drama, Thriller, Animation, etc.), keyword search, ratings, and featured spotlight hero banner.
- **Dynamic Showtimes & Theatres:** Screening discovery across multiple multiplex theatres with dates and screen formats (IMAX, 4K Dolby Atmos).
- **Interactive Cinema Seating:** 8-row tiered seat grid (Standard, Premium, VIP) with instant status mapping, seat selection limits, and live price breakdowns.
- **Concurrency-Safe Atomic Reservations:** Server-level atomic seat locking preventing race conditions and double-booking under concurrent user requests.
- **Production-Ready Role-Based Authentication:** Public registration strictly forces the `USER` role; administrative accounts cannot self-register. Secure out-of-band administrative provisioning via environment variables and CLI scripts.
- **Separate Dashboards for Each Role:** Standard users land on their dedicated personal booking portal (`/dashboard`); administrators land on the cinema management console (`/admin`).
- **Comprehensive Admin Management:** 8-domain console for Overview KPIs, Theatres & dynamic screen builders, Movie catalog, Showtime scheduling, Platform booking audit, User roster, Verified revenue stream, and Review moderation.
- **Booking Management & Ticket Confirmation:** Unique reference generation (`IMV-XXXXXX`), digital ticket slips with barcodes, booking history, and cancellation with atomic seat release.

---

## Technology Stack

- **Frontend:** React 18, Vite, React Router v6, Axios, Lucide Icons, Vanilla CSS with custom modern design system.
- **Backend:** Node.js, Express 4.x, Mongoose 8.x, JSON Web Token (JWT), bcryptjs, CORS, Dotenv.
- **Database:** MongoDB (compatible with MongoDB Atlas and local MongoDB 7.x/8.x).

---

## Project Structure

```
Myshow/
├── Client/                 # React 18 frontend single page application (Vite)
│   ├── src/
│   │   ├── components/     # UI components (SeatGrid, MovieCard, HeroBanner, Navbar, Footer)
│   │   ├── context/        # AuthContext for session management
│   │   ├── pages/          # Home, Details, SeatSelection, Confirmation, UserDashboard, MyBookings, Admin
│   │   ├── services/       # Centralized API service with Bearer token injection
│   │   └── index.css       # Obsidian dark cinema design tokens
│   └── vite.config.js      # Dev server with proxy to backend port 5000
├── Server/                 # Express REST API backend
│   ├── config/             # Mongoose database connection
│   ├── controllers/        # Auth, Admin, Movie, Theatre, Show, Review, and Booking controllers
│   ├── middleware/         # JWT protect, requireAdmin, and error handler middleware
│   ├── models/             # User, Movie, Theatre, Show, Booking, Review Mongoose models
│   ├── routes/             # REST API routes
│   ├── scripts/            # Database seed and secure initAdmin provisioning scripts
│   └── tests/              # Auth, admin, concurrency, and end-to-end regression suites
├── docs/                   # Project documentation & audit reports
│   ├── API_CONTRACT.md     # Full REST API specification
│   ├── IMPLEMENTATION_PLAN.md # Implementation tasks and verification statuses
│   ├── IMPLEMENTATION_CHECKLIST.md # Requirements verification matrix
│   └── PROJECT_AUDIT.md    # Source-of-truth audit report
└── package.json            # Root workspace orchestration scripts
```

---

## Authentication & Security Architecture

### 1. Role Segregation & Public Signup
- **Public Signup (`POST /api/auth/register`):** Open to anyone, but strictly assigns `role: 'USER'`. Any client-supplied `role` parameter in the request body is intentionally ignored at the controller layer.
- **No Public Admin Registration:** The system strictly prohibits public self-assignment of the `ADMIN` role. Route middleware (`requireAdmin`) and frontend guards (`ProtectedRoute`) block unauthorized access with HTTP 403.
- **Passwords & Secrets Protection:**
  - Passwords are encrypted with bcrypt (10 salt rounds) via Mongoose `pre('save')` hooks.
  - User schemas utilize `toJSON` transforms to automatically strip `password` hashes from every API response.
  - Queries accessing user records explicitly apply `.select('-password')`.
  - Frontend production bundles contain zero passwords, API secrets, or credentials.

### 2. Secure Admin Provisioning
Administrators must be provisioned securely using protected server-side scripts reading credentials from environment variables:

1. Configure the initial Admin credentials in `Server/.env`:
```env
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@imovies.com
ADMIN_PASSWORD=your_secure_password_min_6_chars
```

2. Run the secure Admin provisioning utility:
```bash
npm run setup:admin
```
- **Single-Admin & Duplicate Prevention:** The script first checks if an account with `role: 'ADMIN'` already exists. If an Admin already exists, the script safely halts to prevent accidental duplication or unauthorized credential resets.
- **Authorized Credential Reset:** If you intentionally need to reset the existing Admin's password using the new `ADMIN_PASSWORD` in `.env`, run:
```bash
npm run setup:admin -- --force-reset
```

### 3. Production Login Interface & Dev Shortcuts
- **Production Mode:** The login page provides a clean, secure interface containing only Email and Password fields. No demo buttons, prefilled credentials, or shortcuts are displayed.
- **Development-Only Shortcuts:** Quick-login buttons can optionally be enabled for local development by setting `VITE_ENABLE_DEV_DEMO_LOGINS=true` in `Client/.env`. In production builds, these shortcuts are completely stripped and eliminated by Vite's bundler.

---

## Environment Configuration

### Backend: `Server/.env`
Create a `.env` file in the `Server/` directory (see `Server/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/imovies?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Admin Provisioning Configuration (Used by setup:admin and seed)
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@imovies.com
ADMIN_PASSWORD=your_secure_admin_password_min_6_chars
```

### Frontend: `Client/.env`
Create a `.env` file in the `Client/` directory (see `Client/.env.example`):
```env
VITE_API_URL=/api

# Set to 'true' ONLY during local development if you wish to display dev login buttons
VITE_ENABLE_DEV_DEMO_LOGINS=false
```

---

## Quickstart & Local Setup

### 1. Install Dependencies
Run the root workspace install script:
```bash
npm run install:all
```

### 2. Provision Admin Account
```bash
npm run setup:admin
```

### 3. Seed Catalog & Demonstration Data (Optional)
To populate movies, theatres, and screenings:
```bash
npm run seed
```

### 4. Run Development Servers
Start both backend API and frontend client concurrently:
```bash
npm run dev
```
The application will be accessible at:
- **Frontend Client:** `http://localhost:5173/`
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

---

## Verification & Testing Scripts

The application includes automated test suites covering authentication, role isolation, and concurrent booking safety:

| Script | Command | Description |
| :--- | :--- | :--- |
| **All E2E Tests** | `npm run test:server` | Runs the 10-step end-to-end integration test suite |
| **Auth Tests** | `npm run test:auth` | Runs 10 authentication and role authorization unit tests |
| **Admin & RBAC** | `npm run test:admin` | Tests 403 blocking on all admin endpoints, stats, users, theatre CRUD, and reviews |
| **Concurrency** | `npm run test:concurrency` | Simulates 5 simultaneous requests booking the same seat (zero double-booking) |
| **Client Production Build**| `npm run build:client` | Compiles Vite React assets for production bundle |

---

## Production Deployment Guidelines (Render & MongoDB Atlas)

### 1. Backend Service Configuration (Render Web Service)
- **Environment:** Node
- **Build Command:** `npm --prefix Server install`
- **Start Command:** `npm --prefix Server start`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `PORT`: `5000` (or Render's automatic `$PORT`)
  - `MONGODB_URI`: Your production MongoDB Atlas SRV connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/imovies?retryWrites=true&w=majority` *(Note: Localhost is strictly prohibited in production)*
  - `JWT_SECRET`: A high-entropy random key for signing JWT tokens
  - `CLIENT_URL`: The origin URL of your deployed frontend (e.g., `https://imovies-client.onrender.com`). Supports comma-separated origins.
  - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Credentials for administrative provisioning.

### 2. Frontend Configuration (Render Static Site or Vercel)
- **Build Command:** `npm --prefix Client install && npm --prefix Client run build`
- **Publish Directory:** `Client/dist`
- **Environment Variables:**
  - `VITE_API_URL`: The deployed Render backend API URL (e.g., `https://your-imovies-backend.onrender.com/api` or `https://your-imovies-backend.onrender.com`).
  - `VITE_ENABLE_DEV_DEMO_LOGINS`: `false` (prevents exposing demo login shortcuts in client bundle).

### 3. Alternative Unified Deployment (Single Render Web Service)
The Express backend is configured to automatically serve `Client/dist` static assets when `NODE_ENV=production`. If deploying as a single unified service:
- **Build Command:** `npm run install:all && npm run build:client`
- **Start Command:** `npm --prefix Server start`
- The frontend will be served directly by Express and communicate over `/api` on the same origin with zero cross-origin configuration required.

