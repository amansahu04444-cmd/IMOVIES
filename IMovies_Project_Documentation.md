# IMovies --- Movie Ticket Booking Made Simple

**Project type:** Full-stack web application\
**Domain:** Entertainment\
**Architecture:** React client, Node.js/Express REST API, MongoDB
database\
**Stack:** MongoDB, Express.js, React.js, Node.js (MERN)\
**Live demo:** To be added after deployment verification\
**GitHub repository:** To be added using the actual repository URL

> **Documentation accuracy note:** This document describes the intended
> system based on the supplied project brief. The implementation agent
> must inspect the existing repository and distinguish features that are
> implemented, partially implemented, missing, or only proposed. Do not
> claim that a feature works without verifying it in code and tests.

------------------------------------------------------------------------

## 1. Project Overview

IMovies is a movie ticket booking and cinema management web application.
It aims to let users discover movies, view details, browse theatres and
showtimes, select seats, create bookings, and manage their booking
history. An administrative interface supports management of movie
listings, theatres, screens, and show schedules.

The frontend is built with React. The backend uses Node.js and
Express.js to expose APIs. MongoDB stores application data, with
Mongoose providing schemas, validation, and database operations.
Authentication and role-based authorization protect user and
administrative functions.

### Objectives

-   Provide a responsive movie discovery and ticket booking experience.
-   Support movie search and filtering.
-   Display movie details, theatres, showtimes, and seat availability.
-   Implement secure authentication and role-based access control.
-   Store booking records and provide booking history.
-   Provide administrative tools for managing movies, theatres, and
    shows.
-   Keep the backend modular using an MVC-oriented structure.
-   Validate data, handle errors consistently, and optimize database
    queries.

## 2. Problem Statement

Users may need to search across multiple sources or visit a cinema
counter to check movie schedules and seat availability. IMovies aims to
centralize movie discovery, showtime selection, seat selection, and
booking management in one interface. It also provides a management
interface for cinema-related information.

## 3. Scope

### Core functional scope

-   User registration and login.
-   Movie listings, search, filters, and movie details.
-   Theatre and showtime discovery.
-   Seat selection and availability validation.
-   Booking creation, confirmation, and history.
-   Administrative management of movies, theatres, screens, and shows.
-   Authentication, authorization, validation, and error handling.

### Optional or extended scope

-   Online payment integration.
-   Real-time seat updates using Socket.IO.
-   Temporary seat locks and expiry.
-   Booking cancellation and refunds.
-   Email/SMS notifications.
-   Favorites or watchlists.
-   Reviews and ratings.
-   Revenue reporting and booking analytics.

Treat optional features as implemented only if the existing code and
configuration prove that they are implemented and tested.

## 4. Technology Stack

  -----------------------------------------------------------------------
  Technology                          Intended purpose
  ----------------------------------- -----------------------------------
  HTML5, CSS3, JavaScript             Web structure, styling, and
                                      application logic

  React.js                            Component-based frontend

  Vite                                Frontend development server/build
                                      tool, if used by the repository

  Bootstrap                           Responsive UI styling, if present

  React Router                        Client-side navigation, if present

  Axios                               HTTP requests, if present

  Node.js                             Server-side JavaScript runtime

  Express.js                          REST API and middleware

  MongoDB                             Persistent data storage

  Mongoose                            MongoDB schemas and data access

  JWT                                 Token-based authentication

  bcrypt/bcryptjs                     Password hashing

  dotenv                              Environment configuration

  Multer                              File uploads, if required

  Socket.IO                           Real-time updates, optional

  Postman                             Manual API testing

  Git/GitHub                          Version control and repository
                                      hosting
  -----------------------------------------------------------------------

The actual package manifests are the source of truth. Do not add
dependencies merely because they appear in this list.

## 5. System Roles

### User

A user may register and log in, browse movies, view movie details and
showtimes, select seats, create bookings, and view their own booking
history. Cancellation, payment, favorites, and reviews are available
only if implemented.

### Admin

An administrator may manage movie listings, theatres, screens, and show
schedules, and review booking information according to the application's
authorization rules.

The intended roles are `USER` and `ADMIN`, unless the existing
implementation clearly uses different role identifiers. Enforce
permissions on the backend; hiding a frontend button is not
authorization.

## 6. Functional Requirements

### 6.1 Authentication

-   Validate registration and login input.
-   Hash passwords before storing them.
-   Issue and validate authentication tokens.
-   Reject invalid or expired tokens.
-   Protect private endpoints.
-   Restrict administrative operations to authorized administrators.
-   Never return passwords or password hashes in API responses.

### 6.2 Movie discovery

Movie data may include title, poster, description, genre, language,
duration, release date, rating, and cast. Users should be able to browse
movies and use available search/filter controls.

### 6.3 Theatre and show management

Administrators can create and update theatre information and manage show
schedules. The backend should validate show times, theatre/screen
associations, pricing, and scheduling conflicts.

### 6.4 Seat selection and booking

-   Display seat availability for a specific show.
-   Validate seat availability on the server before booking.
-   Prevent two bookings from successfully reserving the same seat.
-   Calculate totals on the server using trusted pricing data.
-   Associate each booking with the correct user and show.
-   Prevent users from accessing other users' bookings.
-   Use atomic database operations or transactions where appropriate.

Frontend-only seat checks are insufficient because multiple users can
attempt to reserve the same seat concurrently.

### 6.5 Payment (optional)

If a payment gateway is integrated:

1.  Create a pending booking/reservation.
2.  Initiate payment through the provider.
3.  Verify the result on the backend.
4.  Confirm the booking only after valid payment verification.
5.  Handle failed, cancelled, duplicated, and delayed callbacks.
6.  Store transaction references and status without storing sensitive
    payment credentials.

Never trust a frontend success message as proof of payment.

### 6.6 Booking history and cancellation

Users can view their own booking history. If cancellation is
implemented, validate booking ownership, booking state, and the
cancellation policy. Release seats only when permitted and track refunds
separately if applicable.

### 6.7 Admin dashboard

The admin dashboard may provide movie, theatre, screen, show, and
booking management. Payment reporting and analytics are optional. All
administrative APIs must validate permissions server-side.

## 7. Architecture

``` text
+--------------------------------------+
|             React Frontend           |
| Movies | Shows | Seats | Bookings    |
| Login | Profile | Admin Dashboard    |
+-------------------+------------------+
                    |
                    | HTTP / JSON REST API
                    v
+--------------------------------------+
|        Node.js + Express.js API       |
| Routes | Middleware | Controllers     |
| Services | Validation | Error Handler |
+-------------------+------------------+
                    |
                    | Mongoose
                    v
+--------------------------------------+
|                MongoDB               |
| Users | Movies | Theatres | Shows     |
| Seats | Bookings | Payments (optional)|
+--------------------------------------+

Optional integrations: Payment Gateway, Socket.IO, Email/SMS.
```

### Frontend layer

Responsible for page rendering, forms, navigation, user interactions,
loading/error states, and API requests.

### Backend layer

Responsible for authentication, authorization, validation, business
rules, booking correctness, data access, and consistent API responses.

### Database layer

Stores persistent records and enforces suitable schema validation and
indexes. Database design must support consistent relationships among
shows, seats, bookings, and payments.

### MVC organization

-   **Models:** Mongoose schemas and data access.
-   **Controllers:** Process requests and formulate responses.
-   **Routes:** Map HTTP methods and paths to middleware/controllers.
-   **Middleware:** Authentication, authorization, validation, and error
    handling.
-   **Services:** Optional separation for complex booking/payment
    business logic.
-   **Views:** The user interface is implemented separately in React
    rather than rendered as traditional Express HTML views.

## 8. Proposed Data Model

These are logical entities, not a claim about the existing schema.
Inspect current Mongoose models before changing anything.

### Users

Suggested fields: `_id`, `name`, `email`, `passwordHash`, `role`,
`createdAt`, `updatedAt`.

-   Email should be unique.
-   Passwords must be hashed.
-   Never return `passwordHash` in API responses.

### Movies

Suggested fields: `_id`, `title`, `description`, `genre`, `language`,
`durationMinutes`, `releaseDate`, `posterUrl`, `rating`, `cast`,
timestamps.

### Theatres

Suggested fields: `_id`, `name`, `address`, `city`, `screens`,
timestamps. Screens may be modeled as separate documents if that better
fits the current design.

### Shows

Suggested fields: `_id`, `movieId`, `theatreId`, `screenId`,
`startTime`, `endTime`, `seatLayout` or seat references, `pricing`,
`status`, timestamps.

### Seats / ShowSeats

Seat layout belongs to a screen; availability is specific to a show. A
show-specific seat record may contain `showId`, `seatNumber`,
`seatType`, `status`, `lockedBy`, `lockExpiresAt`, and `bookingId`.

For concurrent booking, use atomic reservation logic and suitable
uniqueness constraints, for example a unique index on
`{ showId, seatNumber }` where compatible with the actual model.

### Bookings

Suggested fields: `_id`, `bookingReference`, `userId`, `showId`,
`seats`, `totalAmount`, `bookingStatus`, `paymentStatus`, timestamps.

### Payments (optional)

Suggested fields: `_id`, `bookingId`, `userId`, `provider`,
`providerTransactionId`, `amount`, `currency`, `status`, timestamps.

### Favorites (optional)

Suggested fields: `userId`, `movieId`, `createdAt`.

### Reviews (optional)

Suggested fields: `userId`, `movieId`, `rating`, `comment`, timestamps.

### Notifications (optional)

Suggested fields: `userId`, `type`, `message`, `status`, `createdAt`.

### Logical relationships

``` text
User 1 -------- N Booking
Movie 1 ------- N Show
Theatre 1 ----- N Show
Show 1 -------- N Booking
Show 1 -------- N ShowSeat
Booking 1 ----- N Payment Attempt (if supported)
User N -------- N Movie through Favorites
User 1 -------- N Review
Movie 1 ------- N Review
```

### Potential indexes

-   Unique index on `Users.email`.
-   Indexes for movie title/search and show lookup by movie, theatre,
    and start time.
-   Index on booking user and creation time.
-   Unique index on `{ showId, seatNumber }` for show-specific seat
    records.
-   Unique index on booking reference.

Choose indexes based on the actual schema and query patterns. Validate
any index change against existing data before applying it.

## 9. Proposed REST API

The following routes are examples of intended API behavior, not verified
routes. The existing implementation is authoritative.

  ----------------------------------------------------------------------------------
  Method            Example endpoint             Purpose           Access
  ----------------- ---------------------------- ----------------- -----------------
  POST              `/api/auth/register`         Register user     Public

  POST              `/api/auth/login`            Login             Public

  GET               `/api/movies`                List/search       Public
                                                 movies            

  GET               `/api/movies/:id`            Movie details     Public

  POST              `/api/movies`                Create movie      Admin

  PUT               `/api/movies/:id`            Update movie      Admin

  DELETE            `/api/movies/:id`            Delete movie      Admin

  GET               `/api/theatres`              List theatres     Public

  POST              `/api/theatres`              Create theatre    Admin

  GET               `/api/shows`                 List/filter shows Public

  POST              `/api/shows`                 Create show       Admin

  GET               `/api/shows/:id/seats`       Seat availability According to
                                                                   project policy

  POST              `/api/bookings`              Initiate booking  Authenticated
                                                                   user

  GET               `/api/bookings/my`           Current user's    Authenticated
                                                 bookings          user

  GET               `/api/bookings/:id`          Booking details   Owner or
                                                                   authorized admin

  PATCH             `/api/bookings/:id/cancel`   Cancel eligible   Owner/admin
                                                 booking           policy

  POST              `/api/payments/create`       Create payment    Authenticated
                                                 request           user

  POST              `/api/payments/verify`       Verify payment    Server-verified
                                                                   flow
  ----------------------------------------------------------------------------------

Do not add or rename endpoints without first checking frontend callers,
backend routes, tests, and any deployed clients.

Suggested HTTP statuses include `200`, `201`, `400`, `401`, `403`,
`404`, `409`, and `500`, used consistently with the situation.

## 10. Security Requirements

-   Hash passwords using bcrypt/bcryptjs.
-   Keep secrets in environment variables.
-   Validate tokens and token expiry.
-   Enforce role and ownership checks on the server.
-   Validate request bodies, parameters, query strings, and identifiers.
-   Configure CORS for intended origins.
-   Use HTTPS in production.
-   Consider rate limiting for login and other sensitive endpoints.
-   Avoid exposing stack traces, secrets, or internal database details.
-   Prevent duplicate seat reservations.
-   Verify payment callbacks/signatures server-side if payments exist.
-   Do not commit `.env` files or credentials.
-   Avoid logging passwords, access tokens, or payment secrets.

Select token storage deliberately. Secure, HTTP-only cookies can reduce
token exposure to client-side JavaScript; localStorage has XSS-related
risks. Follow the strategy already used in the application unless a
carefully tested migration is justified.

## 11. Optional Real-Time Seat Updates

If Socket.IO is used, a possible flow is:

1.  Client requests a temporary reservation for selected seats.
2.  Server atomically checks availability and reserves the seats until
    an expiry time.
3.  Server broadcasts availability updates.
4.  Booking confirmation changes the seats to booked.
5.  Expired or failed reservations release the seats.
6.  Clients receive the updated state.

Socket.IO alone does not prevent double-booking. Database-level
concurrency control is required.

## 12. UI Requirements

Suggested screens:

-   Home page.
-   Movie listing/search page.
-   Movie details page.
-   Theatre and showtime selection.
-   Seat selection.
-   Checkout/payment status, if supported.
-   Booking history.
-   User profile.
-   Login and registration.
-   Admin dashboard and management screens.

Use responsive layouts, accessible controls, clear loading/error/empty
states, and understandable seat-status indicators. React Router can
manage navigation. Context API or Redux may be used if the existing
state complexity warrants it.

## 13. Suggested Repository Structure

``` text
IMovies/
├── Client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── Server/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

This is illustrative. Do not reorganize a working repository just to
match this tree; document and respect its existing structure.

## 14. Local Setup

### Prerequisites

Install Node.js/npm, MongoDB locally or configure MongoDB Atlas, and
install Git and a code editor.

### Backend setup

``` bash
cd Server
npm install
```

Create a local `.env` file based on `.env.example`. Example variable
names:

``` env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

These names are examples; use the variable names required by the
existing code. Do not commit real credentials.

Start the backend using the script defined in `Server/package.json`, for
example:

``` bash
npm run dev
```

or:

``` bash
npm start
```

### Frontend setup

In a second terminal:

``` bash
cd Client
npm install
```

If the frontend uses Vite, the API base URL might be configured as:

``` env
VITE_API_URL=http://localhost:5000/api
```

Use the actual variable name expected by the frontend. Start the
frontend using the configured script, commonly:

``` bash
npm run dev
```

Open the local URL printed by the development server.

### Local verification

-   MongoDB connection succeeds.
-   Backend starts without errors.
-   Frontend loads.
-   Frontend requests reach the correct API base URL.
-   Authentication and role checks work.
-   Movie and show data load.
-   Booking changes persist in the database.
-   Error cases produce understandable responses.

## 15. Testing Plan

### Authentication tests

-   Registration succeeds with valid input.
-   Duplicate email is rejected.
-   Invalid credentials are rejected.
-   Invalid/expired token is rejected.
-   Non-admin users cannot access admin APIs.
-   Password hashes are never returned.

### Movie/show tests

-   Listing, detail, search, and filter work.
-   Invalid IDs and missing records are handled.
-   Admin create/update/delete is authorized.
-   Invalid show times and schedule conflicts are rejected where
    applicable.

### Booking tests

-   Available seats can be reserved.
-   Unavailable seats cannot be reserved.
-   Concurrent requests cannot confirm the same seat twice.
-   Booking totals are calculated server-side.
-   Booking belongs to the correct user and show.
-   Users cannot read or cancel another user's booking.
-   Cancellation updates seats and statuses consistently if supported.

### Payment tests (if integrated)

-   Success, failure, cancellation, invalid signature, and duplicate
    callback.
-   Booking/payment statuses remain consistent.
-   Refund flow is tested if implemented.

### UI tests

-   Forms, navigation, protected pages, search, seat selection,
    confirmation, responsive behavior, loading states, and error states.

Use the test framework already configured in the repository. Do not
claim a test passed unless it was actually run and its result inspected.

## 16. Performance and Reliability

Potential improvements:

-   Add indexes for actual query patterns.
-   Paginate movie listings and booking history.
-   Avoid unnecessary database queries and large responses.
-   Use consistent error handling.
-   Separate complex business logic into services.
-   Optimize images and frontend assets.
-   Add caching only where data invalidation is safe.
-   Monitor API errors and latency.
-   Prioritize booking correctness over premature optimization.

## 17. Deployment

Possible hosting choices:

  Component           Possible platform
  ------------------- --------------------------------
  React frontend      Vercel or Netlify
  Express backend     Render or another Node.js host
  MongoDB             MongoDB Atlas
  Source repository   GitHub
  CI checks           GitHub Actions, if configured

Deployment checklist:

1.  Push source code to the real GitHub repository.
2.  Configure the production database and access rules.
3.  Deploy the backend and set its environment variables.
4.  Deploy the frontend and configure the correct API URL.
5.  Configure CORS for the actual deployed frontend origin.
6.  Verify authentication and database connectivity.
7.  Test movie discovery, shows, booking, and admin permissions.
8.  Check logs for runtime errors.
9.  Ensure secrets are not exposed in the frontend build or repository.
10. Add the actual demo and repository URLs below after verifying them.

**Live demo:** `[Add verified deployed URL]`\
**GitHub repository:** `[Add actual repository URL]`

Do not invent or guess either URL.

## 18. Limitations and Future Enhancements

Potential next steps, depending on current status:

1.  Complete and test the core booking flow.
2.  Add reliable atomic seat reservation and lock expiry.
3.  Integrate a payment gateway and server-side verification.
4.  Add notifications and cancellation/refund handling.
5.  Add favorites, reviews, and ratings.
6.  Add reporting and analytics.
7.  Add monitoring and deployment automation.

## 19. Expected Learning Outcomes

The project can demonstrate:

-   React component-based development.
-   REST API design with Express.
-   MongoDB modeling using Mongoose.
-   Authentication and role-based authorization.
-   CRUD operations and data validation.
-   Frontend/backend/database integration.
-   Booking workflow and concurrency considerations.
-   API testing, debugging, version control, and deployment.

Only claim outcomes supported by the actual implementation.

## 20. Conclusion

IMovies aims to combine movie discovery, showtime browsing, seat
selection, and ticket booking in a single web application. The MERN
stack supports a clear separation between the frontend, backend APIs,
and persistent data layer. A modular backend and careful validation make
the application easier to maintain and extend.

Booking correctness, authorization, and data consistency are essential.
Payment processing, real-time updates, notifications, and analytics
should be added and documented only when they are implemented and
verified.

## 21. Mentor Submission Checklist

-   [ ] Add the actual GitHub repository URL.
-   [ ] Add the actual deployed demo URL.
-   [ ] Confirm the deployed app is accessible.
-   [ ] Test registration and login.
-   [ ] Test movie listing and showtime discovery.
-   [ ] Test seat availability and booking creation.
-   [ ] Verify role-based access restrictions.
-   [ ] Test payment flow if payment integration is claimed.
-   [ ] Add screenshots from the actual application.
-   [ ] Exclude `.env` files and secrets from Git.
-   [ ] Align documentation with the real codebase.
-   [ ] Mark missing features as planned rather than completed.
