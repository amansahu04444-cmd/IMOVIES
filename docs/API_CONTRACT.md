# IMovies REST API Contract

**Base URL:** `http://localhost:5000/api`  
**Data Format:** `application/json`  
**Authentication Scheme:** Bearer Token (`Authorization: Bearer <JWT>`)

---

## Centralized Response Formats

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "stack": null
}
```

---

## 1. System & Health

### Health Check
- **Endpoint:** `GET /api/health`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "status": "ok",
  "service": "IMovies REST API",
  "uptime": 124.5,
  "timestamp": "2026-10-25T15:30:00.000Z"
}
```

---

## 2. Authentication (`/api/auth`)

### Register User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6ade188d6f9482374bbeede1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "createdAt": "2026-10-25T15:30:00.000Z"
  }
}
```
- **Error (400 Bad Request):** If email already exists or password < 6 characters.

### Login User
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6ade188d6f9482374bbeede1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER"
  }
}
```
- **Error (401 Unauthorized):** Invalid credentials.

### Get Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Private (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "6ade188d6f9482374bbeede1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER"
  }
}
```

---

## 3. Movies (`/api/movies`)

### List Movies
- **Endpoint:** `GET /api/movies`
- **Access:** Public
- **Query Parameters:**
  - `search`: Filter title, cast, or description (case-insensitive substring)
  - `genre`: Filter by genre (e.g. `Action`, `Sci-Fi`)
  - `language`: Filter by language (e.g. `English`, `Hindi`)
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 6,
  "movies": [
    {
      "_id": "6ade188d6f9482374bbeede2",
      "title": "Cyberpulse: Neo Tokyo",
      "description": "In a neon-drenched metropolis...",
      "genre": ["Sci-Fi", "Action", "Thriller"],
      "language": "English",
      "durationMinutes": 142,
      "releaseDate": "2026-05-15T00:00:00.000Z",
      "posterUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      "rating": 8.8,
      "isFeatured": true
    }
  ]
}
```

### Get Movie Details
- **Endpoint:** `GET /api/movies/:id`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "movie": {
    "_id": "6ade188d6f9482374bbeede2",
    "title": "Cyberpulse: Neo Tokyo",
    "description": "...",
    "genre": ["Sci-Fi", "Action"],
    "language": "English",
    "durationMinutes": 142,
    "rating": 8.8
  }
}
```

### Create Movie
- **Endpoint:** `POST /api/movies`
- **Access:** Admin Only
- **Request Body:** Full movie details
- **Response (201 Created):** Created movie object.

### Delete Movie
- **Endpoint:** `DELETE /api/movies/:id`
- **Access:** Admin Only
- **Response (200 OK):** `{ "success": true, "message": "Movie deleted successfully" }`

---

## 4. Theatres (`/api/theatres`)

### List Theatres
- **Endpoint:** `GET /api/theatres`
- **Access:** Public
- **Query Parameters:** `city` (optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "theatres": [
    {
      "_id": "6ade188d6f9482374bbeede5",
      "name": "PVR Inox Megaplex",
      "city": "Mumbai",
      "address": "Phoenix Marketcity, Kurla West",
      "screens": [
        {
          "screenNumber": 1,
          "name": "IMAX Laser Screen",
          "totalSeats": 80
        }
      ]
    }
  ]
}
```

### Create Theatre
- **Endpoint:** `POST /api/theatres`
- **Access:** Admin Only

---

## 5. Shows (`/api/shows`)

### List Shows
- **Endpoint:** `GET /api/shows`
- **Access:** Public
- **Query Parameters:**
  - `movieId`: ObjectId
  - `theatreId`: ObjectId
  - `date`: `YYYY-MM-DD`
- **Response (200 OK):** List of show objects populated with `movieId` and `theatreId`.

### Get Show Seat Layout
- **Endpoint:** `GET /api/shows/:id/seats`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "show": {
    "_id": "6ade188d6f9482374bbeedef",
    "screenNumber": 1,
    "startTime": "2026-10-25T13:00:00.000Z",
    "pricing": {
      "standard": 180,
      "premium": 250,
      "vip": 380
    },
    "bookedSeats": ["A1", "A2"]
  },
  "layout": [
    {
      "row": "A",
      "tier": "standard",
      "price": 180,
      "seats": [
        {
          "seatNumber": "A1",
          "row": "A",
          "number": 1,
          "tier": "standard",
          "price": 180,
          "isBooked": true
        },
        {
          "seatNumber": "A2",
          "row": "A",
          "number": 2,
          "tier": "standard",
          "price": 180,
          "isBooked": true
        },
        {
          "seatNumber": "A3",
          "row": "A",
          "number": 3,
          "tier": "standard",
          "price": 180,
          "isBooked": false
        }
      ]
    }
  ]
}
```

### Create Show (Schedule Screening)
- **Endpoint:** `POST /api/shows`
- **Access:** Admin Only
- **Request Body:**
```json
{
  "movieId": "6ade188d6f9482374bbeede2",
  "theatreId": "6ade188d6f9482374bbeede5",
  "screenNumber": 1,
  "startTime": "2026-10-26T18:30:00.000Z",
  "pricing": {
    "standard": 200,
    "premium": 300,
    "vip": 450
  }
}
```
- **Conflict Handling (400 Bad Request):** If start and end times overlap an existing show on the same screen.

---

## 6. Bookings (`/api/bookings`)

### Create Booking (Atomic Reservation)
- **Endpoint:** `POST /api/bookings`
- **Access:** Private (`Bearer <token>`)
- **Request Body:**
```json
{
  "showId": "6ade188d6f9482374bbeedef",
  "seats": ["C4", "C5"]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "booking": {
    "_id": "6ade199d6f9482374bbeefe1",
    "bookingReference": "IMV-AEE8DB",
    "userId": "6ade188d6f9482374bbeede1",
    "showId": "6ade188d6f9482374bbeedef",
    "seats": ["C4", "C5"],
    "totalAmount": 500,
    "bookingStatus": "CONFIRMED",
    "paymentStatus": "PAID",
    "createdAt": "2026-10-25T15:35:00.000Z"
  }
}
```
- **Error (409 Conflict):** If any selected seat is already booked:
```json
{
  "success": false,
  "message": "One or more selected seats have already been booked. Please choose alternative seats."
}
```

### Get User Bookings
- **Endpoint:** `GET /api/bookings/my`
- **Access:** Private (`Bearer <token>`)
- **Response (200 OK):** Array of user's bookings sorted newest first.

### Get Booking By ID
- **Endpoint:** `GET /api/bookings/:id`
- **Access:** Private (Owner or Admin)
- **Error (403 Forbidden):** If user is not the booking owner and not an admin.

### Cancel Booking
- **Endpoint:** `PATCH /api/bookings/:id/cancel`
- **Access:** Private (Owner or Admin)
- **Action:**
  1. Atomically pulls booked seats from `Show.bookedSeats`.
  2. Sets `bookingStatus = "CANCELLED"` and `paymentStatus = "REFUNDED"`.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully. Reserved seats have been released.",
  "booking": {
    "_id": "6ade199d6f9482374bbeefe1",
    "bookingStatus": "CANCELLED",
    "paymentStatus": "REFUNDED"
  }
}
```

### Admin: Get All Bookings
- **Endpoint:** `GET /api/bookings`
- **Access:** Admin Only
- **Response (200 OK):** Returns all platform bookings.

---

## 7. Theatre Management Updates (`/api/theatres`)

### Update Theatre
- **Endpoint:** `PUT /api/theatres/:id`
- **Access:** Admin Only (`Bearer <token>`)
- **Request Body:**
```json
{
  "name": "PVR Icon Gold",
  "city": "Mumbai",
  "location": "Oberoi Mall, Goregaon East",
  "screens": [
    { "screenNumber": 1, "name": "Audi 1 - Dolby Atmos", "rows": 8, "cols": 10, "capacity": 80 }
  ]
}
```
- **Response (200 OK):** Updated theatre document.

### Delete Theatre
- **Endpoint:** `DELETE /api/theatres/:id`
- **Access:** Admin Only (`Bearer <token>`)
- **Response (200 OK):** `{ "success": true, "message": "Theatre removed successfully" }`

---

## 8. Admin Platform Management (`/api/admin`)

### Aggregate Platform Statistics
- **Endpoint:** `GET /api/admin/stats`
- **Access:** Admin Only (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalMovies": 7,
    "totalTheatres": 4,
    "totalShows": 110,
    "totalBookings": 1,
    "totalUsers": 3,
    "totalRevenue": 500,
    "recentBookings": [
      {
        "_id": "6ade4f...",
        "bookingReference": "IMV-AEE8DB",
        "userId": { "name": "Alex Johnson", "email": "user@imovies.com" },
        "totalAmount": 500,
        "bookingStatus": "CONFIRMED",
        "createdAt": "2026-10-25T18:00:00.000Z"
      }
    ]
  }
}
```

### Registered Accounts Roster
- **Endpoint:** `GET /api/admin/users`
- **Access:** Admin Only (`Bearer <token>`)
- **Response (200 OK):** Array of registered users with passwords stripped (`select('-password')`).

### Payments & Realized Revenue Ledger
- **Endpoint:** `GET /api/admin/payments`
- **Access:** Admin Only (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "summary": {
    "totalRealizedRevenue": 500,
    "paidCount": 1,
    "refundedCount": 0,
    "pendingCount": 0
  },
  "payments": [
    {
      "bookingId": "6ade...",
      "bookingReference": "IMV-AEE8DB",
      "user": { "name": "Alex Johnson", "email": "user@imovies.com" },
      "amount": 500,
      "paymentStatus": "PAID",
      "bookingStatus": "CONFIRMED",
      "date": "2026-10-25T18:00:00.000Z"
    }
  ]
}
```

### Moderate / Remove Review
- **Endpoint:** `DELETE /api/admin/reviews/:id`
- **Access:** Admin Only (`Bearer <token>`)
- **Response (200 OK):** `{ "success": true, "message": "Review moderated and removed successfully" }`

---

## 9. Movie Reviews (`/api/reviews`)

### Get Reviews For Movie
- **Endpoint:** `GET /api/reviews/movie/:movieId`
- **Access:** Public
- **Response (200 OK):** Array of verified user reviews for the movie with populated user name.

### Create Review
- **Endpoint:** `POST /api/reviews`
- **Access:** Private (`Bearer <token>`)
- **Request Body:**
```json
{
  "movieId": "6ade188d6f9482374bbeede5",
  "rating": 5,
  "comment": "Masterpiece visual effects and sound design!"
}
```
- **Response (201 Created):** Newly created review document.

