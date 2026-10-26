# Implementation Plan: IMovies MERN Application

**Plan Version:** 1.1.0  
**Status:** Completed (100% Verified)  
**Tracking Document:** Synchronized with actual code commits, test suites, and browser runs. All tasks verified and passing.

---

## Task Priority Overview

- **P0: Project Stability & Scaffolding** (Tasks P0-01 to P0-04)
- **P1: Authentication & Authorization** (Tasks P1-01 to P1-05)
- **P2: Core Movie, Theatre & Showtime Engine** (Tasks P2-01 to P2-06)
- **P3: Concurrency-Safe Booking & Seat Workflow** (Tasks P3-01 to P3-06)
- **P4: Seed Data, Polished UI & Verification** (Tasks P4-01 to P4-04)

---

## P0: Project Stability & Scaffolding

### Task P0-01: Backend Foundation & Manifest
- **Requirement & User Value:** Initialize the Node.js/Express backend service with clean dependencies, npm scripts, and environment variable configuration.
- **Files/Modules Involved:**
  - `Server/package.json`
  - `Server/.env.example`
  - `Server/config/db.js`
  - `Server/server.js`
  - `.gitignore`
- **Dependencies / Blockers:** None.
- **Implementation Steps:**
  1. Create `.gitignore` to prevent committing `node_modules`, `.env`, build output.
  2. Create `Server/package.json` with dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`.
  3. Create `Server/.env.example` with `PORT=5000`, `MONGODB_URI=mongodb://127.0.0.1:27017/imovies`, `JWT_SECRET=supersecretjwtkey_imovies_2026`, `CLIENT_URL=http://localhost:5173`.
  4. Create `Server/config/db.js` connecting Mongoose with connection success/failure logging.
  5. Create `Server/server.js` configuring JSON body parser, CORS, health endpoint (`GET /api/health`), and centralized error handling.
  6. Install Server dependencies.
- **Acceptance Criteria:**
  - `npm --prefix Server test` or health check responds with `{ status: "ok" }`.
  - MongoDB connection succeeds when server starts.
- **Verification Command/Test:**
  `node Server/server.js` (test health endpoint with curl or node script).
- **Status:** DONE

---

### Task P0-02: Backend Error Handling & Request Logging Middleware
- **Requirement & User Value:** Provide standardized error responses and request safety without crashing or exposing stack traces.
- **Files/Modules Involved:**
  - `Server/middleware/errorMiddleware.js`
  - `Server/server.js`
- **Dependencies / Blockers:** P0-01
- **Implementation Steps:**
  1. Create `notFound` middleware returning 404 JSON for unknown routes.
  2. Create `errorHandler` middleware catching all uncaught errors, formatting message, status code, and hiding internal stack traces in production.
- **Acceptance Criteria:**
  - Accessing non-existent route returns `404 Not Found` with `{ success: false, message: "Route not found" }`.
  - Unhandled exceptions return structured JSON.
- **Verification Command/Test:**
  Request unknown route and verify JSON output.
- **Status:** DONE

---

### Task P0-03: Frontend Scaffolding (Vite + React)
- **Requirement & User Value:** Set up the client-side single page application with modern component architecture, routing, and styling tokens.
- **Files/Modules Involved:**
  - `Client/package.json`
  - `Client/vite.config.js`
  - `Client/index.html`
  - `Client/src/main.jsx`
  - `Client/src/App.jsx`
  - `Client/src/index.css`
  - `Client/.env.example`
- **Dependencies / Blockers:** None
- **Implementation Steps:**
  1. Set up Vite React client manifest in `Client/package.json` with `react`, `react-dom`, `react-router-dom`, `lucide-react` (or custom icons), `axios`.
  2. Set up `Client/vite.config.js` with proxy to backend `http://localhost:5000`.
  3. Create `Client/src/index.css` containing design tokens (vibrant cinema palette: deep obsidian background, crimson/gold accents, glassmorphic cards, responsive typography).
  4. Create `Client/src/App.jsx` with React Router routes (`/`, `/login`, `/register`, `/movies/:id`, `/shows/:id/seats`, `/booking/confirmation/:id`, `/my-bookings`, `/admin`).
  5. Install Client dependencies and verify build.
- **Acceptance Criteria:**
  - `npm --prefix Client run build` completes with 0 errors.
- **Verification Command/Test:**
  `npm --prefix Client run build`
- **Status:** DONE

---

### Task P0-04: API Client Service
- **Requirement & User Value:** Centralize HTTP communication between React frontend and Express backend with automatic token injection.
- **Files/Modules Involved:**
  - `Client/src/services/api.js`
- **Dependencies / Blockers:** P0-01, P0-03
- **Implementation Steps:**
  1. Create Axios instance with baseURL defaulting to `/api` or `VITE_API_URL`.
  2. Add request interceptor attaching Bearer token from localStorage.
  3. Add response interceptor handling 401 unauthorized errors gracefully.
- **Acceptance Criteria:**
  - API calls automatically send `Authorization: Bearer <token>` when user is logged in.
- **Verification Command/Test:**
  Verify unit test / build of API client.
- **Status:** DONE

---

## P1: Authentication & Authorization

### Task P1-01: User Model & Secure Password Hashing
- **Requirement & User Value:** Store user records securely with bcrypt password hashing and role definition.
- **Files/Modules Involved:**
  - `Server/models/User.js`
- **Dependencies / Blockers:** P0-01
- **Implementation Steps:**
  1. Define User schema with fields: `name`, `email` (unique, lowercase, trimmed), `password` (hashed), `role` (enum: `['USER', 'ADMIN']`, default: `'USER'`), `createdAt`, `updatedAt`.
  2. Add pre-save hook to hash password with bcryptjs when modified.
  3. Add method `comparePassword(candidatePassword)`.
  4. Ensure `toJSON` transform strips `password`.
- **Acceptance Criteria:**
  - Passwords stored in DB are bcrypt hashes.
  - JSON serialization excludes password.
- **Verification Command/Test:**
  Run automated test for user creation and password comparison.
- **Status:** DONE

---

### Task P1-02: Auth Controller & Routes
- **Requirement & User Value:** Allow users to register, log in, and retrieve their profile safely.
- **Files/Modules Involved:**
  - `Server/controllers/authController.js`
  - `Server/routes/authRoutes.js`
- **Dependencies / Blockers:** P1-01
- **Implementation Steps:**
  1. `POST /api/auth/register`: Validate name, email format, password length (min 6 chars). Reject duplicates with 400. Return token & user data.
  2. `POST /api/auth/login`: Validate credentials. Reject invalid email or password with 401. Return JWT token & user data.
  3. `GET /api/auth/me`: Return authenticated user info.
- **Acceptance Criteria:**
  - Duplicate email returns 400.
  - Invalid password returns 401.
  - Successful login returns signed JWT token.
- **Verification Command/Test:**
  Automated auth test script.
- **Status:** DONE

---

### Task P1-03: Auth & Role Authorization Middleware
- **Requirement & User Value:** Protect private user endpoints and administrative routes on the server.
- **Files/Modules Involved:**
  - `Server/middleware/authMiddleware.js`
- **Dependencies / Blockers:** P1-02
- **Implementation Steps:**
  1. Create `protect` middleware: verify Bearer JWT token from header; retrieve user from DB (minus password); reject missing or invalid tokens with 401.
  2. Create `requireAdmin` middleware: check `req.user.role === 'ADMIN'`. Return 403 Forbidden for non-admins.
- **Acceptance Criteria:**
  - Unauthenticated requests to protected endpoints return 401.
  - Authenticated regular users calling admin endpoints return 403.
- **Verification Command/Test:**
  Integration test verifying token and role restrictions.
- **Status:** DONE

---

### Task P1-04: Automated Auth Tests
- **Requirement & User Value:** Guarantee registration, login, and authorization rules are regression-tested.
- **Files/Modules Involved:**
  - `Server/tests/auth.test.js`
- **Dependencies / Blockers:** P1-03
- **Implementation Steps:**
  1. Write automated test suite testing registration, duplicate rejection, login success/failure, profile retrieval, and admin protection.
- **Acceptance Criteria:**
  - All test assertions pass against local MongoDB.
- **Verification Command/Test:**
  `node Server/tests/auth.test.js`
- **Status:** DONE

---

### Task P1-05: Frontend Auth Context & Screens
- **Requirement & User Value:** Provide user login, registration, persistent session, and route guards in React UI.
- **Files/Modules Involved:**
  - `Client/src/context/AuthContext.jsx`
  - `Client/src/components/ProtectedRoute.jsx`
  - `Client/src/pages/LoginPage.jsx`
  - `Client/src/pages/RegisterPage.jsx`
  - `Client/src/components/Navbar.jsx`
- **Dependencies / Blockers:** P0-03, P1-02
- **Implementation Steps:**
  1. Build `AuthContext` maintaining `user`, `token`, `login`, `register`, `logout` states.
  2. Build modern, responsive `LoginPage` and `RegisterPage` with form validation, error banners, and loading spinners.
  3. Build `ProtectedRoute` redirecting unauthenticated users to `/login`, and checking `adminOnly` when specified.
  4. Update `Navbar` showing user avatar, role badge, Admin link (if admin), My Bookings, and Logout.
- **Acceptance Criteria:**
  - User can register, log in, see navbar reflect session, and log out.
- **Verification Command/Test:**
  `npm --prefix Client run build`
- **Status:** DONE

---

## P2: Core Movie, Theatre & Showtime Engine

### Task P2-01: Movie Model, Controller & Endpoints
- **Requirement & User Value:** Allow public browsing, searching, and filtering of movies; allow admins to create, update, and delete movies.
- **Files/Modules Involved:**
  - `Server/models/Movie.js`
  - `Server/controllers/movieController.js`
  - `Server/routes/movieRoutes.js`
- **Dependencies / Blockers:** P1-03
- **Implementation Steps:**
  1. Define Movie schema: `title`, `description`, `genre` (array of strings), `language`, `durationMinutes`, `releaseDate`, `posterUrl`, `bannerUrl`, `rating`, `cast` (array), `isFeatured` (boolean).
  2. Implement `GET /api/movies`: Support `search` (regex on title/cast), `genre`, `language`, sorting.
  3. Implement `GET /api/movies/:id`: Fetch movie by ObjectId.
  4. Implement `POST /api/movies` (Admin only): Create movie with validation.
  5. Implement `PUT /api/movies/:id` (Admin only): Update movie.
  6. Implement `DELETE /api/movies/:id` (Admin only): Delete movie.
- **Acceptance Criteria:**
  - Public can view and filter movies; non-admins cannot mutate movies.
- **Verification Command/Test:**
  Automated movie API test.
- **Status:** DONE

---

### Task P2-02: Theatre & Screen Model, Controller & Endpoints
- **Requirement & User Value:** Model physical theatres with multiple screens and seating configurations.
- **Files/Modules Involved:**
  - `Server/models/Theatre.js`
  - `Server/controllers/theatreController.js`
  - `Server/routes/theatreRoutes.js`
- **Dependencies / Blockers:** P1-03
- **Implementation Steps:**
  1. Define Theatre schema: `name`, `city`, `address`, `screens` array (screenNumber, name, totalSeats, seatLayout configuration).
  2. Implement `GET /api/theatres`: List all theatres (optional city filter).
  3. Implement `GET /api/theatres/:id`: Get theatre with screen details.
  4. Implement `POST /api/theatres` & `PUT /api/theatres/:id` (Admin only).
- **Acceptance Criteria:**
  - Theatres can be queried publicly and managed by administrators.
- **Verification Command/Test:**
  Automated test script.
- **Status:** DONE

---

### Task P2-03: Showtime Model, Controller & Scheduling Engine
- **Requirement & User Value:** Schedule movie screenings in specific theatre screens with date/time, seat pricing, and conflict prevention.
- **Files/Modules Involved:**
  - `Server/models/Show.js`
  - `Server/controllers/showController.js`
  - `Server/routes/showRoutes.js`
- **Dependencies / Blockers:** P2-01, P2-02
- **Implementation Steps:**
  1. Define Show schema: `movieId` (ref: Movie), `theatreId` (ref: Theatre), `screenNumber`, `startTime` (Date), `endTime` (Date), `pricing` ({ standard: Number, premium: Number, vip: Number }), `totalSeats`, `bookedSeats` (array of seat strings, e.g. `['A1', 'A2']`), `status` ('ACTIVE', 'CANCELLED').
  2. Implement `GET /api/shows`: Query by `movieId`, `theatreId`, `date`. Populates movie and theatre.
  3. Implement `GET /api/shows/:id`: Single show details.
  4. Implement `POST /api/shows` (Admin only): Validate scheduling overlap on same theatre & screen before creating.
  5. Implement `PUT /api/shows/:id` and `DELETE /api/shows/:id` (Admin only).
- **Acceptance Criteria:**
  - Overlapping shows on the same screen return 400 schedule conflict error.
  - Active shows can be retrieved with populated movie and theatre info.
- **Verification Command/Test:**
  Automated show scheduling conflict test.
- **Status:** DONE

---

### Task P2-04: Database Seed Script
- **Requirement & User Value:** Provide rich, verified sample data (admin account, demo user, 8+ movies across genres, 3 theatres in different cities, realistic showtimes).
- **Files/Modules Involved:**
  - `Server/scripts/seed.js`
  - `Server/package.json`
- **Dependencies / Blockers:** P2-01, P2-02, P2-03
- **Implementation Steps:**
  1. Create `seed.js` script that connects to MongoDB, cleans collections safely if specified, and populates Admin (`admin@imovies.com` / `Admin@123`), Demo User (`user@imovies.com` / `User@123`), movies with posters, theatres with seat rows, and active showtimes.
  2. Add `"seed": "node scripts/seed.js"` to `Server/package.json`.
- **Acceptance Criteria:**
  - Running `npm --prefix Server run seed` populates clean demo database and exits with code 0.
- **Verification Command/Test:**
  `npm --prefix Server run seed`
- **Status:** DONE

---

### Task P2-05: Frontend Movie Discovery, Filter & Details UI
- **Requirement & User Value:** Provide visually engaging movie browsing, search, genre filter, and rich movie details with showtimes grouped by theatre.
- **Files/Modules Involved:**
  - `Client/src/pages/HomePage.jsx`
  - `Client/src/pages/MovieDetailsPage.jsx`
  - `Client/src/components/MovieCard.jsx`
  - `Client/src/components/HeroBanner.jsx`
  - `Client/src/components/ShowtimePicker.jsx`
- **Dependencies / Blockers:** P0-03, P2-01, P2-03
- **Implementation Steps:**
  1. Build `HeroBanner` with featured movie backdrop and call-to-action.
  2. Build `HomePage` with search bar, genre chips, language filter, and responsive grid of `MovieCard`.
  3. Build `MovieDetailsPage` showing banner, metadata, cast, synopsis, date selector tab, and list of theatres offering showtimes for that day.
- **Acceptance Criteria:**
  - Filter and search reactively update movie list.
  - Clicking a showtime navigates to the seat selection screen (`/shows/:id/seats`).
- **Verification Command/Test:**
  `npm --prefix Client run build`
- **Status:** DONE

---

### Task P2-06: Frontend Admin Dashboard & Management UI
- **Requirement & User Value:** Allow administrators to add/edit movies, manage theatres, and schedule shows through the UI.
- **Files/Modules Involved:**
  - `Client/src/pages/admin/AdminDashboard.jsx`
  - `Client/src/pages/admin/ManageMovies.jsx`
  - `Client/src/pages/admin/ManageShows.jsx`
- **Dependencies / Blockers:** P1-05, P2-01, P2-03
- **Implementation Steps:**
  1. Build `AdminDashboard` with navigation tabs (Movies, Theatres, Shows, Bookings Overview).
  2. Build modal / form to add/edit movies with poster previews.
  3. Build show scheduler form selecting movie, theatre, screen, start time, and pricing.
- **Acceptance Criteria:**
  - Admin can create a movie and immediately see it in the public catalogue.
- **Verification Command/Test:**
  `npm --prefix Client run build`
- **Status:** DONE

---

## P3: Concurrency-Safe Booking & Seat Workflow

### Task P3-01: Seat Availability API (`GET /api/shows/:id/seats`)
- **Requirement & User Value:** Serve screen layout and real-time seat availability for a show so the client can render the seating grid.
- **Files/Modules Involved:**
  - `Server/controllers/showController.js`
  - `Server/routes/showRoutes.js`
- **Dependencies / Blockers:** P2-03
- **Implementation Steps:**
  1. For the specified show, generate or load the seat grid (e.g. Rows A-H, 10-12 seats per row, tiered into Standard, Premium, VIP).
  2. Map each seat's status (`available` vs `booked`) based on `show.bookedSeats`.
  3. Return layout, seat statuses, pricing per tier, movie info, and theatre info.
- **Acceptance Criteria:**
  - Already booked seats are correctly marked `isBooked: true`.
- **Verification Command/Test:**
  API test for show seats.
- **Status:** DONE

---

### Task P3-02: Booking Model & Server-Side Price Calculation
- **Requirement & User Value:** Store completed booking records with server-computed prices and tamper prevention.
- **Files/Modules Involved:**
  - `Server/models/Booking.js`
- **Dependencies / Blockers:** P1-01, P2-03
- **Implementation Steps:**
  1. Define Booking schema: `bookingReference` (unique string e.g. `IMV-XXXXXX`), `userId` (ref User), `showId` (ref Show), `seats` (array of seat strings), `totalAmount` (Number), `seatDetails` (array of `{ seatNumber, tier, price }`), `bookingStatus` (`CONFIRMED`, `CANCELLED`), `paymentStatus` (`PAID`), timestamps.
- **Acceptance Criteria:**
  - Booking model enforces unique booking reference and references valid User and Show.
- **Verification Command/Test:**
  Mongoose model validation test.
- **Status:** DONE

---

### Task P3-03: Atomic Seat Reservation & Booking Controller (`POST /api/bookings`)
- **Requirement & User Value:** Prevent double booking under concurrent requests and create confirmed booking atomically.
- **Files/Modules Involved:**
  - `Server/controllers/bookingController.js`
  - `Server/routes/bookingRoutes.js`
- **Dependencies / Blockers:** P3-01, P3-02
- **Implementation Steps:**
  1. Inspect incoming `showId` and `seats` (array of strings). Validate non-empty.
  2. Retrieve show and compute exact price on server using show pricing rules for each seat's tier.
  3. Perform atomic reservation on Show:
     ```javascript
     const updatedShow = await Show.findOneAndUpdate(
       {
         _id: showId,
         bookedSeats: { $nin: seats }
       },
       {
         $push: { bookedSeats: { $each: seats } }
       },
       { new: true }
     );
     ```
  4. If `updatedShow` is null, return `409 Conflict` with `"One or more selected seats have already been booked"`.
  5. If reservation succeeds, create and save `Booking` document.
  6. Return `201 Created` with full booking details.
- **Acceptance Criteria:**
  - Attempting to book already-booked seat returns 409.
  - Price matches server computation, ignoring any price passed from client.
- **Verification Command/Test:**
  Automated concurrency test simulating simultaneous booking of the same seat.
- **Status:** DONE

---

### Task P3-04: Booking Concurrency Automated Test
- **Requirement & User Value:** Scientifically verify that concurrent requests cannot reserve the same seat twice.
- **Files/Modules Involved:**
  - `Server/tests/booking.concurrency.test.js`
- **Dependencies / Blockers:** P3-03
- **Implementation Steps:**
  1. Create automated test that launches `Promise.all` with 5 concurrent requests attempting to book the exact same seat (`C5`) on the same show.
  2. Assert that exactly 1 request succeeds with 201, and the other 4 fail with 409 Conflict.
  3. Assert that `show.bookedSeats` contains `C5` exactly once.
- **Acceptance Criteria:**
  - Concurrency test passes reliably.
- **Verification Command/Test:**
  `node Server/tests/booking.concurrency.test.js`
- **Status:** DONE

---

### Task P3-05: Booking History, Details & Cancellation APIs
- **Requirement & User Value:** Allow users to view their booking history, view ticket details, and cancel eligible bookings with automatic seat release.
- **Files/Modules Involved:**
  - `Server/controllers/bookingController.js`
  - `Server/routes/bookingRoutes.js`
- **Dependencies / Blockers:** P3-03
- **Implementation Steps:**
  1. `GET /api/bookings/my`: Return all bookings where `userId === req.user._id`, populated with show, movie, and theatre, ordered by createdAt desc.
  2. `GET /api/bookings/:id`: Retrieve booking. Enforce ownership: `booking.userId.toString() === req.user._id.toString() || req.user.role === 'ADMIN'`. Return 403 otherwise.
  3. `PATCH /api/bookings/:id/cancel`: Enforce ownership. If already cancelled, return 400. Atomically pull seats from `show.bookedSeats` using `$pullAll`. Set `bookingStatus = 'CANCELLED'`.
- **Acceptance Criteria:**
  - Users cannot access other users' bookings.
  - Cancellation releases seats back to show availability.
- **Verification Command/Test:**
  Automated booking ownership & cancellation test.
- **Status:** DONE

---

### Task P3-06: Frontend Seat Selection & Booking Journey
- **Requirement & User Value:** Provide an interactive, responsive cinema seat grid with tier pricing, live subtotal, booking confirmation, and ticket view.
- **Files/Modules Involved:**
  - `Client/src/pages/SeatSelectionPage.jsx`
  - `Client/src/pages/BookingConfirmationPage.jsx`
  - `Client/src/pages/MyBookingsPage.jsx`
  - `Client/src/components/SeatGrid.jsx`
  - `Client/src/components/TicketCard.jsx`
- **Dependencies / Blockers:** P0-03, P3-01, P3-03, P3-05
- **Implementation Steps:**
  1. Build `SeatGrid` displaying theatre screen orientation curve, categorized seat tiers (Standard, Premium, VIP), seat selection states (available, selected, booked), max seat limit (e.g. 8).
  2. Display live breakdown of selected seats, tier prices, convenience fee, and grand total.
  3. Handle booking submission with loading spinner; on 409 conflict, highlight conflicting seats and refresh grid.
  4. Build `BookingConfirmationPage` with generated QR mock, booking reference code, date/time, theatre screen, and download/print ticket button.
  5. Build `MyBookingsPage` listing past and upcoming bookings, active/cancelled badges, and cancellation action modal.
- **Acceptance Criteria:**
  - Seamless user experience from movie → showtime → seat pick → confirmation → my bookings.
- **Verification Command/Test:**
  `npm --prefix Client run build`
- **Status:** DONE

---

## P4: Developer Experience, Seed Data, and Final Verification

### Task P4-01: Root Orchestration & Production Build
- **Requirement & User Value:** Single-command workspace management, clean package scripts, and production build verification.
- **Files/Modules Involved:**
  - `package.json` (Root)
  - `README.md`
- **Dependencies / Blockers:** P0 through P3
- **Implementation Steps:**
  1. Create root `package.json` with scripts:
     - `install:all`: installs Server and Client
     - `dev:server`: runs backend
     - `dev:client`: runs frontend
     - `dev`: runs both concurrently
     - `build:client`: builds frontend
     - `test:server`: runs all automated backend tests
     - `seed`: seeds demo data
  2. Run `npm run build:client` to verify production assets compile without error.
- **Acceptance Criteria:**
  - Root scripts function reliably.
- **Verification Command/Test:**
  `npm run build:client`
- **Status:** DONE

---

### Task P4-02: End-to-End Automated Test Suite
- **Requirement & User Value:** Automated regression test suite validating Auth, Roles, Movies, Shows, Booking Concurrency, Ownership Isolation, and Cancellation.
- **Files/Modules Involved:**
  - `Server/tests/e2e.test.js`
- **Dependencies / Blockers:** All backend tasks
- **Implementation Steps:**
  1. Create unified test runner running all integration checks sequentially against local MongoDB.
- **Acceptance Criteria:**
  - All tests exit with code 0.
- **Verification Command/Test:**
  `npm --prefix Server test`
- **Status:** DONE

---

### Task P4-03: Complete Documentation Synchronization
- **Requirement & User Value:** Keep README, Project Audit, and Implementation Plan 100% aligned with verified reality.
- **Files/Modules Involved:**
  - `README.md`
  - `docs/PROJECT_AUDIT.md`
  - `docs/IMPLEMENTATION_PLAN.md`
- **Dependencies / Blockers:** P4-01, P4-02
- **Implementation Steps:**
  1. Update `README.md` with verified setup instructions, scripts, API documentation, screenshots/mockup paths, and placeholder notes for demo/repo URLs.
  2. Mark all completed task IDs in `docs/IMPLEMENTATION_PLAN.md`.
  3. Update `docs/PROJECT_AUDIT.md` reflecting verified final status.
- **Acceptance Criteria:**
  - Documentation accurately describes all working features and setup steps.
- **Verification Command/Test:**
  Verify document consistency.
- **Status:** DONE

---

### Task P4-04: End-to-End Visual Verification & Demo Run
- **Requirement & User Value:** Run application, verify frontend in browser, test visual aesthetics, responsive design, and full user flow.
- **Files/Modules Involved:**
  - Frontend UI components and backend server
- **Dependencies / Blockers:** P4-01
- **Implementation Steps:**
  1. Seed database.
  2. Launch backend and frontend.
  3. Validate full user flow: discovery, seat selection, booking, viewing history, admin dashboard.
- **Acceptance Criteria:**
  - Visuals look stunning, modern, and bug-free.
- **Verification Command/Test:**
  Browser verification & automated checks.
- **Status:** DONE

---

## P5: Complete Admin Management Console & Theatre Operations

### Task P5-01: Admin Statistics, Users & Payment Backend APIs
- **Requirement & User Value:** Provide server-aggregated statistics, user lists, and transaction records to power the Admin Dashboard without client-side guesswork.
- **Files/Modules Involved:**
  - `Server/controllers/adminController.js`
  - `Server/routes/adminRoutes.js`
  - `Server/server.js`
- **Dependencies / Blockers:** P1-03
- **Implementation Steps:**
  1. Implement `GET /api/admin/stats`: Aggregate counts of movies, theatres, shows, bookings, users, and actual revenue from confirmed paid bookings.
  2. Implement `GET /api/admin/users`: Return all users (minus password hashes) sorted by registration date.
  3. Implement `GET /api/admin/payments`: Return transaction ledger from bookings.
- **Acceptance Criteria:**
  - Only authenticated Admins can call `/api/admin/*`. Non-admins receive 403.
- **Verification Command/Test:**
  API test with Admin vs User token.
- **Status:** DONE

---

### Task P5-02: Review Model & Moderation APIs
- **Requirement & User Value:** Model customer reviews on movies and provide administrative moderation controls.
- **Files/Modules Involved:**
  - `Server/models/Review.js`
  - `Server/controllers/reviewController.js`
  - `Server/routes/reviewRoutes.js`
  - `Server/server.js`
- **Dependencies / Blockers:** P1-03, P2-01
- **Implementation Steps:**
  1. Create `Review` schema: `movieId`, `userId`, `userName`, `rating`, `comment`, `status`.
  2. Public `GET /api/reviews/movie/:movieId` to list reviews.
  3. Private `POST /api/reviews` to submit a review.
  4. Admin `GET /api/admin/reviews` and `DELETE /api/admin/reviews/:id`.
- **Acceptance Criteria:**
  - Admins can delete inappropriate reviews.
- **Verification Command/Test:**
  Review API test.
- **Status:** DONE

---

### Task P5-03: Complete Theatre Management UI (Add, Edit, Delete)
- **Requirement & User Value:** Empower administrators to add new multiplex theatres, configure screens, edit existing details, and safely delete theatres with instant MongoDB persistence.
- **Files/Modules Involved:**
  - `Client/src/pages/admin/AdminDashboard.jsx`
  - `Client/src/services/api.js`
- **Dependencies / Blockers:** P2-02
- **Implementation Steps:**
  1. Add `updateTheatre` and `deleteTheatre` in `api.js`.
  2. Add visible "Create Theatre" button in Admin UI.
  3. Build Theatre creation modal with name, city, address, and interactive screen builder (screen number, screen name, seat count).
  4. Implement Edit Theatre modal.
  5. Implement Delete Theatre action with confirmation dialog.
  6. Empty state and error banners.
- **Acceptance Criteria:**
  - Newly created theatres persist in MongoDB Atlas and render in the list after refresh.
- **Verification Command/Test:**
  Browser walkthrough creating and inspecting a theatre.
- **Status:** DONE

---

### Task P5-04: Movie Management Enhancements (Edit Movie Modal)
- **Requirement & User Value:** Allow administrators to update movie details, genres, poster URLs, and ratings directly from the UI.
- **Files/Modules Involved:**
  - `Client/src/pages/admin/AdminDashboard.jsx`
  - `Client/src/services/api.js`
- **Dependencies / Blockers:** P2-01
- **Implementation Steps:**
  1. Add Edit button per movie card in the table.
  2. Pre-fill modal with existing movie data.
  3. Send `PUT /api/movies/:id` and update state.
- **Acceptance Criteria:**
  - Updated movie metadata is reflected immediately in the public catalogue.
- **Verification Command/Test:**
  Browser test updating a movie.
- **Status:** DONE

---

### Task P5-05: Show Scheduling Enhancements (Dynamic Screens & Shows List)
- **Requirement & User Value:** Provide visibility into existing show schedules, dynamic screen picking based on the selected theatre, and safe show deletion.
- **Files/Modules Involved:**
  - `Client/src/pages/admin/AdminDashboard.jsx`
- **Dependencies / Blockers:** P2-03
- **Implementation Steps:**
  1. Fetch all scheduled shows and render an interactive table (Movie, Theatre, Screen, Showtime, Booked Seats, Status).
  2. Make screen selection dropdown dynamically populate from selected theatre's `screens` array.
  3. Add Delete/Cancel Show button calling `DELETE /api/shows/:id`.
- **Acceptance Criteria:**
  - Admins can view and delete scheduled shows.
- **Verification Command/Test:**
  Schedule show and verify list appearance.
- **Status:** DONE

---

### Task P5-06: User Management, Payments & Review Moderation UI
- **Requirement & User Value:** Add dedicated tabs in Admin Dashboard for Users, Payments/Revenue, and Review Moderation.
- **Files/Modules Involved:**
  - `Client/src/pages/admin/AdminDashboard.jsx`
- **Dependencies / Blockers:** P5-01, P5-02
- **Implementation Steps:**
  1. Build Users table tab (name, email, role, joined date).
  2. Build Payments & Revenue tab (revenue cards, transaction ledger).
  3. Build Review Moderation tab (review cards, delete button).
- **Acceptance Criteria:**
  - All 8 admin tabs function smoothly without errors.
- **Verification Command/Test:**
  Browser walkthrough of all 8 tabs.
- **Status:** DONE

---

### Task P5-07: Full Regression & Browser Verification of Both Roles
- **Requirement & User Value:** Guarantee normal user and admin workflows are completely isolated, regression-tested, and passing.
- **Files/Modules Involved:**
  - All Server and Client test suites.
- **Dependencies / Blockers:** P5-01 through P5-06
- **Implementation Steps:**
  1. Run automated backend test suites.
  2. Run production build.
  3. Test full browser walkthrough for both roles.
- **Acceptance Criteria:**
  - All tests exit with code 0.
- **Verification Command/Test:**
  Browser test and npm test runs.
- **Status:** DONE

