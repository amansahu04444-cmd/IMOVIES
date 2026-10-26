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
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

const runAdminSuite = async () => {
  console.log('--- Starting Admin Management & Security Test Suite ---');

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
    // 1. Authenticate regular user and admin
    console.log('[Test 1] Authenticating Admin & Normal User...');
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
    console.log('  -> PASSED: Verified admin and user credentials');

    // 2. Normal user strictly blocked from ALL admin endpoints (403 Forbidden)
    console.log('[Test 2] Normal User calling Admin-only endpoints (Expect 403 on all)...');
    const userStats = await makeRequest('/api/admin/stats', 'GET', null, userToken);
    assert.strictEqual(userStats.status, 403, 'Regular user must be blocked from /api/admin/stats');

    const userUsers = await makeRequest('/api/admin/users', 'GET', null, userToken);
    assert.strictEqual(userUsers.status, 403, 'Regular user must be blocked from /api/admin/users');

    const userPayments = await makeRequest('/api/admin/payments', 'GET', null, userToken);
    assert.strictEqual(userPayments.status, 403, 'Regular user must be blocked from /api/admin/payments');

    const userCreateTheatre = await makeRequest('/api/theatres', 'POST', { name: 'Illegal Theatre' }, userToken);
    assert.strictEqual(userCreateTheatre.status, 403, 'Regular user must be blocked from creating theatre');

    const userCreateMovie = await makeRequest('/api/movies', 'POST', { title: 'Illegal Movie' }, userToken);
    assert.strictEqual(userCreateMovie.status, 403, 'Regular user must be blocked from creating movie');

    const userCreateShow = await makeRequest('/api/shows', 'POST', { price: 100 }, userToken);
    assert.strictEqual(userCreateShow.status, 403, 'Regular user must be blocked from creating show');

    const userReviewsAdmin = await makeRequest('/api/admin/reviews', 'GET', null, userToken);
    assert.strictEqual(userReviewsAdmin.status, 403, 'Regular user must be blocked from /api/admin/reviews');

    console.log('  -> PASSED: Verified 403 Forbidden on stats, users, payments, theatres, movies, shows, reviews');

    // 3. Admin accessing /api/admin/stats
    console.log('[Test 3] Admin fetching real-time platform statistics...');
    const adminStats = await makeRequest('/api/admin/stats', 'GET', null, adminToken);
    assert.strictEqual(adminStats.status, 200);
    assert.ok(adminStats.data.stats, 'Stats object must be returned');
    assert.strictEqual(typeof adminStats.data.stats.totalMovies, 'number');
    assert.strictEqual(typeof adminStats.data.stats.totalTheatres, 'number');
    assert.strictEqual(typeof adminStats.data.stats.totalRevenue, 'number');
    console.log(`  -> PASSED: Real stats returned (Movies: ${adminStats.data.stats.totalMovies}, Theatres: ${adminStats.data.stats.totalTheatres}, Revenue: ₹${adminStats.data.stats.totalRevenue})`);

    // 4. Admin fetching users list (passwords stripped)
    console.log('[Test 4] Admin fetching user management list...');
    const adminUsers = await makeRequest('/api/admin/users', 'GET', null, adminToken);
    assert.strictEqual(adminUsers.status, 200);
    assert.ok(Array.isArray(adminUsers.data.users));
    assert.strictEqual(adminUsers.data.users[0].password, undefined, 'Password must never be exposed');
    console.log(`  -> PASSED: ${adminUsers.data.users.length} registered accounts retrieved with secure fields`);

    // 5. Admin fetching payments ledger
    console.log('[Test 5] Admin fetching payments & revenue stream...');
    const adminPayments = await makeRequest('/api/admin/payments', 'GET', null, adminToken);
    assert.strictEqual(adminPayments.status, 200);
    assert.ok(adminPayments.data.summary);
    assert.strictEqual(typeof adminPayments.data.summary.totalRevenue, 'number');
    console.log('  -> PASSED: Payment summary and transactions ledger verified');

    // 6. Complete Theatre CRUD Verification (Priority)
    console.log('[Test 6] Creating new Theatre via Admin API...');
    const newTheatreRes = await makeRequest('/api/theatres', 'POST', {
      name: 'PVR Superplex Cybercity',
      city: 'Gurgaon',
      address: 'DLF Cybercity, Phase 2, Sector 24',
      screens: [
        { screenNumber: 1, name: 'IMAX with Laser', totalSeats: 120, rows: 10, seatsPerRow: 12 },
        { screenNumber: 2, name: '4K Dolby Atmos', totalSeats: 80, rows: 8, seatsPerRow: 10 }
      ]
    }, adminToken);
    assert.strictEqual(newTheatreRes.status, 201);
    assert.strictEqual(newTheatreRes.data.theatre.name, 'PVR Superplex Cybercity');
    const createdTheatreId = newTheatreRes.data.theatre._id;
    console.log(`  -> PASSED: Theatre created with ID ${createdTheatreId}`);

    // Verify theatre in MongoDB
    console.log('[Test 7] Verifying Theatre persistence in MongoDB...');
    const getTheatre = await makeRequest(`/api/theatres/${createdTheatreId}`);
    assert.strictEqual(getTheatre.status, 200);
    assert.strictEqual(getTheatre.data.theatre.city, 'Gurgaon');
    assert.strictEqual(getTheatre.data.theatre.screens.length, 2);
    console.log('  -> PASSED: Theatre persistence verified');

    // Update Theatre
    console.log('[Test 8] Updating Theatre details...');
    const updateTheatreRes = await makeRequest(`/api/theatres/${createdTheatreId}`, 'PUT', {
      name: 'PVR INOX Superplex Cybercity'
    }, adminToken);
    assert.strictEqual(updateTheatreRes.status, 200);
    assert.strictEqual(updateTheatreRes.data.theatre.name, 'PVR INOX Superplex Cybercity');
    console.log('  -> PASSED: Theatre updated successfully');

    // Delete Theatre
    console.log('[Test 9] Deleting Theatre...');
    const delTheatre = await makeRequest(`/api/theatres/${createdTheatreId}`, 'DELETE', null, adminToken);
    assert.strictEqual(delTheatre.status, 200);
    const verifyDel = await makeRequest(`/api/theatres/${createdTheatreId}`);
    assert.strictEqual(verifyDel.status, 404);
    console.log('  -> PASSED: Theatre safely deleted');

    // 10. Review Model & Moderation Test
    console.log('[Test 10] Testing Review submission and Admin Moderation...');
    const anyMovie = await Movie.findOne();
    assert.ok(anyMovie, 'A movie must exist for review test');

    const reviewRes = await makeRequest('/api/reviews', 'POST', {
      movieId: anyMovie._id,
      rating: 9,
      comment: 'Incredible cinematography and sound design!'
    }, userToken);
    assert.strictEqual(reviewRes.status, 201);
    const createdReviewId = reviewRes.data.review._id;

    // Admin fetches reviews
    const adminReviews = await makeRequest('/api/admin/reviews', 'GET', null, adminToken);
    assert.strictEqual(adminReviews.status, 200);
    assert.ok(adminReviews.data.reviews.length >= 1);

    // Admin deletes review (moderation)
    const delRev = await makeRequest(`/api/admin/reviews/${createdReviewId}`, 'DELETE', null, adminToken);
    assert.strictEqual(delRev.status, 200);
    console.log('  -> PASSED: Review submitted, fetched, and moderated successfully');

    console.log('--- ALL ADMIN MANAGEMENT & SECURITY TESTS PASSED ---');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runAdminSuite().catch(err => {
  console.error('Admin Test Suite Failed:', err);
  process.exit(1);
});
