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

const runConcurrencySuite = async () => {
  console.log('--- Starting Concurrency & Booking Integrity Tests ---');

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

  const userAEmail = 'concurrency_user_a@imovies.com';
  const userBEmail = 'concurrency_user_b@imovies.com';

  try {
    // Cleanup old test records
    await User.deleteMany({ email: { $in: [userAEmail, userBEmail] } });
    await Movie.deleteMany({ title: 'Concurrency Benchmark Movie' });
    await Theatre.deleteMany({ name: 'Concurrency Test Multiplex' });

    // Register User A and User B
    const userARes = await makeRequest('/api/auth/register', 'POST', {
      name: 'User A',
      email: userAEmail,
      password: 'Password123'
    });
    const tokenA = userARes.data.token;

    const userBRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'User B',
      email: userBEmail,
      password: 'Password123'
    });
    const tokenB = userBRes.data.token;

    // Create test movie
    const movie = await Movie.create({
      title: 'Concurrency Benchmark Movie',
      description: 'Test movie for concurrency and booking logic',
      genre: ['Action', 'Thriller'],
      language: 'English',
      durationMinutes: 130,
      releaseDate: new Date('2026-11-01'),
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1'
    });

    // Create test theatre
    const theatre = await Theatre.create({
      name: 'Concurrency Test Multiplex',
      city: 'Mumbai',
      address: 'Tech Park Avenue'
    });

    // Create test show
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 150 * 60 * 1000);

    const show = await Show.create({
      movieId: movie._id,
      theatreId: theatre._id,
      screenNumber: 1,
      startTime,
      endTime,
      pricing: { standard: 150, premium: 250, vip: 400 },
      totalSeats: 80,
      bookedSeats: []
    });

    console.log(`[Setup Complete] Created Show ID: ${show._id}`);

    // --- TEST 1: Simultaneous Double-Booking Prevention ---
    console.log('[Test 1] Launching 5 concurrent requests for seat D5...');
    const targetSeat = ['D5'];

    // Send 5 concurrent requests attempting to book seat D5
    const concurrentAttempts = [1, 2, 3, 4, 5].map(i =>
      makeRequest('/api/bookings', 'POST', { showId: show._id, seats: targetSeat }, tokenA)
    );

    const results = await Promise.all(concurrentAttempts);
    const successResponses = results.filter(r => r.status === 201);
    const conflictResponses = results.filter(r => r.status === 409);

    console.log(`  -> 201 Success Count: ${successResponses.length}`);
    console.log(`  -> 409 Conflict Count: ${conflictResponses.length}`);

    assert.strictEqual(successResponses.length, 1, 'Exactly one concurrent request must succeed');
    assert.strictEqual(conflictResponses.length, 4, 'All four competing concurrent requests must be rejected with 409');

    // Verify DB state
    const freshShow = await Show.findById(show._id);
    const d5Occurrences = freshShow.bookedSeats.filter(s => s === 'D5').length;
    assert.strictEqual(d5Occurrences, 1, 'Seat D5 must appear exactly once in bookedSeats');
    console.log('  -> PASSED: Concurrency safety verified with zero double-booking!');

    const successfulBookingId = successResponses[0].data.booking._id;

    // --- TEST 2: Price Tampering Prevention ---
    console.log('[Test 2] Price tampering prevention (attempting to pay ₹1 for a VIP seat F1)...');
    const vipRes = await makeRequest('/api/bookings', 'POST', {
      showId: show._id,
      seats: ['F1'],
      totalAmount: 1 // Malicious client attempt
    }, tokenA);

    assert.strictEqual(vipRes.status, 201);
    assert.strictEqual(vipRes.data.booking.totalAmount, 400, 'Server must enforce ₹400 for VIP seat F1');
    console.log('  -> PASSED: Server calculated price overrides client-supplied amount');

    // --- TEST 3: Booking Ownership Protection ---
    console.log('[Test 3] Ownership isolation: User B viewing User A booking...');
    const forbiddenView = await makeRequest(`/api/bookings/${successfulBookingId}`, 'GET', null, tokenB);
    assert.strictEqual(forbiddenView.status, 403, 'Non-owner must be forbidden from accessing another user booking');
    console.log('  -> PASSED: 403 Forbidden received when accessing other user booking');

    // --- TEST 4: Booking Cancellation & Seat Release ---
    console.log('[Test 4] Cancelling booking and verifying seat release...');
    const cancelRes = await makeRequest(`/api/bookings/${successfulBookingId}/cancel`, 'PATCH', null, tokenA);
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelRes.data.booking.bookingStatus, 'CANCELLED');

    // Verify seat D5 is released
    const showAfterCancel = await Show.findById(show._id);
    assert.ok(!showAfterCancel.bookedSeats.includes('D5'), 'D5 must be released from show.bookedSeats');
    console.log('  -> PASSED: Seat D5 released in database after cancellation');

    // --- TEST 5: Rebooking Released Seat ---
    console.log('[Test 5] Rebooking previously released seat D5 by User B...');
    const rebookRes = await makeRequest('/api/bookings', 'POST', {
      showId: show._id,
      seats: ['D5']
    }, tokenB);

    assert.strictEqual(rebookRes.status, 201, 'Released seat must be available for new booking');
    console.log('  -> PASSED: Released seat D5 successfully booked by User B');

    // Cleanup
    await Booking.deleteMany({ showId: show._id });
    await Show.findByIdAndDelete(show._id);
    await Theatre.findByIdAndDelete(theatre._id);
    await Movie.findByIdAndDelete(movie._id);
    await User.deleteMany({ email: { $in: [userAEmail, userBEmail] } });

    console.log('--- ALL CONCURRENCY & BOOKING INTEGRITY TESTS PASSED ---');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runConcurrencySuite().catch(err => {
  console.error('Concurrency Suite Failed:', err);
  process.exit(1);
});
