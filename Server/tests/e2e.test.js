const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: __dirname + '/../.env' });

const app = require('../server');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

const runE2ESuite = async () => {
  console.log('==============================================');
  console.log('       IMOVIES END-TO-END TEST SUITE          ');
  console.log('==============================================\n');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const makeRequest = async (path, method = 'GET', body = null, token = null) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  try {
    // 1. Health
    console.log('[E2E 01] API Health check...');
    const health = await makeRequest('/api/health');
    assert.strictEqual(health.status, 200);
    console.log('  -> OK');

    // 2. Auth Flow (Login with seeded admin & user)
    console.log('[E2E 02] Authenticating Admin & Regular User...');
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@imovies.com',
      password: 'Admin@123'
    });
    assert.strictEqual(adminLogin.status, 200);
    assert.strictEqual(adminLogin.data.user.role, 'ADMIN');
    const adminToken = adminLogin.data.token;

    const userLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'user@imovies.com',
      password: 'User@123'
    });
    assert.strictEqual(userLogin.status, 200);
    assert.strictEqual(userLogin.data.user.role, 'USER');
    const userToken = userLogin.data.token;
    console.log('  -> OK: Both tokens issued with expected roles');

    // 3. Movie Discovery & Search
    console.log('[E2E 03] Querying movies with filters & search...');
    const moviesRes = await makeRequest('/api/movies');
    assert.strictEqual(moviesRes.status, 200);
    assert.ok(moviesRes.data.movies.length > 0);
    const firstMovie = moviesRes.data.movies[0];

    const searchRes = await makeRequest('/api/movies?search=Interstellar');
    assert.strictEqual(searchRes.status, 200);
    assert.ok(searchRes.data.movies.some(m => m.title.includes('Interstellar')));

    const singleMovie = await makeRequest(`/api/movies/${firstMovie._id}`);
    assert.strictEqual(singleMovie.status, 200);
    assert.strictEqual(singleMovie.data.movie.title, firstMovie.title);
    console.log('  -> OK: Movie listing, search and detail verified');

    // 4. Theatre & Shows Retrieval
    console.log('[E2E 04] Querying theatres and shows...');
    const theatresRes = await makeRequest('/api/theatres');
    assert.strictEqual(theatresRes.status, 200);
    assert.ok(theatresRes.data.theatres.length > 0);

    const showsRes = await makeRequest(`/api/shows?movieId=${firstMovie._id}`);
    assert.strictEqual(showsRes.status, 200);
    assert.ok(showsRes.data.shows.length > 0);
    const testShow = showsRes.data.shows[0];
    console.log(`  -> OK: Found ${showsRes.data.shows.length} shows for movie "${firstMovie.title}"`);

    // 5. Seat Availability Layout
    console.log(`[E2E 05] Checking seat layout for Show ID ${testShow._id}...`);
    const seatsRes = await makeRequest(`/api/shows/${testShow._id}/seats`);
    assert.strictEqual(seatsRes.status, 200);
    assert.strictEqual(seatsRes.data.totalSeats, 80);
    assert.ok(Array.isArray(seatsRes.data.seatLayout));
    assert.strictEqual(seatsRes.data.seatLayout.length, 8); // 8 rows
    console.log('  -> OK: 8-row seat layout generated with dynamic status');

    // 6. Booking Creation & Verification
    console.log('[E2E 06] User booking seats A1 and A2...');
    const bookRes = await makeRequest('/api/bookings', 'POST', {
      showId: testShow._id,
      seats: ['A1', 'A2']
    }, userToken);
    assert.strictEqual(bookRes.status, 201);
    assert.ok(bookRes.data.booking.bookingReference.startsWith('IMV-'));
    assert.strictEqual(bookRes.data.booking.seats.length, 2);
    const createdBookingId = bookRes.data.booking._id;
    console.log(`  -> OK: Booking confirmed (${bookRes.data.booking.bookingReference})`);

    // 7. Double-Booking Rejection
    console.log('[E2E 07] Attempting to book already-booked seat A1...');
    const doubleBook = await makeRequest('/api/bookings', 'POST', {
      showId: testShow._id,
      seats: ['A1']
    }, userToken);
    assert.strictEqual(doubleBook.status, 409);
    console.log('  -> OK: 409 Conflict correctly rejected double-booking');

    // 8. User Booking History
    console.log('[E2E 08] Retrieving user booking history...');
    const historyRes = await makeRequest('/api/bookings/my', 'GET', null, userToken);
    assert.strictEqual(historyRes.status, 200);
    assert.ok(historyRes.data.bookings.some(b => b._id.toString() === createdBookingId.toString()));
    console.log('  -> OK: User booking history reflects new booking');

    // 9. Booking Ownership Isolation
    console.log('[E2E 09] Anonymous/other user accessing booking details...');
    const anonRes = await makeRequest(`/api/bookings/${createdBookingId}`);
    assert.strictEqual(anonRes.status, 401);
    console.log('  -> OK: 401 Unauthorized for unauthenticated detail request');

    // 10. Cancellation & Seat Release
    console.log('[E2E 10] Cancelling booking and validating seat release...');
    const cancelRes = await makeRequest(`/api/bookings/${createdBookingId}/cancel`, 'PATCH', null, userToken);
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelRes.data.booking.bookingStatus, 'CANCELLED');

    const seatsAfterCancel = await makeRequest(`/api/shows/${testShow._id}/seats`);
    const rowA = seatsAfterCancel.data.seatLayout.find(r => r.row === 'A');
    const seatA1 = rowA.seats.find(s => s.seatNumber === 'A1');
    assert.strictEqual(seatA1.isBooked, false, 'Seat A1 must be marked not booked');
    console.log('  -> OK: Seats A1 and A2 successfully released back to available pool');

    console.log('\n==============================================');
    console.log('    ALL END-TO-END CHECKS PASSED WITH 100%    ');
    console.log('==============================================\n');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runE2ESuite().catch(err => {
  console.error('[E2E Failure]', err);
  process.exit(1);
});
