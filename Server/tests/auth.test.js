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

const runTest = async () => {
  console.log('--- Starting Authentication & Authorization Tests ---');

  // Connect to DB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const cleanEmail = 'test_runner_auth@imovies.com';
  const adminEmail = 'test_admin_auth@imovies.com';
  await User.deleteMany({ email: { $in: [cleanEmail, adminEmail] } });

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
    // 1. Health check
    console.log('[Test 1] GET /api/health');
    const health = await makeRequest('/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.status, 'ok');
    console.log('  -> PASSED: Health endpoint OK');

    // 2. Register new user
    console.log('[Test 2] POST /api/auth/register (Valid user)');
    const regRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Auth Test User',
      email: cleanEmail,
      password: 'Password123'
    });
    assert.strictEqual(regRes.status, 201);
    assert.ok(regRes.data.token, 'Token must be returned');
    assert.strictEqual(regRes.data.user.email, cleanEmail);
    assert.strictEqual(regRes.data.user.password, undefined, 'Password must not leak');
    const userToken = regRes.data.token;
    console.log('  -> PASSED: Registration successful, password excluded');

    // 3. Duplicate registration
    console.log('[Test 3] POST /api/auth/register (Duplicate email)');
    const dupRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Duplicate User',
      email: cleanEmail,
      password: 'Password123'
    });
    assert.strictEqual(dupRes.status, 400);
    console.log('  -> PASSED: Duplicate registration rejected with 400');

    // 4. Short password
    console.log('[Test 4] POST /api/auth/register (Short password)');
    const shortPassRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Short Pass',
      email: 'shortpass@example.com',
      password: '123'
    });
    assert.strictEqual(shortPassRes.status, 400);
    console.log('  -> PASSED: Short password rejected');

    // 5. Login valid user
    console.log('[Test 5] POST /api/auth/login (Valid credentials)');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: cleanEmail,
      password: 'Password123'
    });
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginRes.data.token);
    assert.strictEqual(loginRes.data.user.password, undefined);
    console.log('  -> PASSED: Login succeeded, JWT issued');

    // 6. Login invalid password
    console.log('[Test 6] POST /api/auth/login (Wrong password)');
    const badLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: cleanEmail,
      password: 'WrongPassword'
    });
    assert.strictEqual(badLoginRes.status, 401);
    console.log('  -> PASSED: Wrong password rejected with 401');

    // 7. GET /api/auth/me with valid token
    console.log('[Test 7] GET /api/auth/me (Protected route)');
    const meRes = await makeRequest('/api/auth/me', 'GET', null, userToken);
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data.user.email, cleanEmail);
    console.log('  -> PASSED: /api/auth/me verified user context');

    // 8. GET /api/auth/me without token
    console.log('[Test 8] GET /api/auth/me (Missing token)');
    const noTokenRes = await makeRequest('/api/auth/me');
    assert.strictEqual(noTokenRes.status, 401);
    console.log('  -> PASSED: Missing token rejected with 401');

    // 9. Regular user accessing admin route (Forbidden check)
    console.log('[Test 9] POST /api/movies (Regular user -> Expect 403)');
    const forbiddenRes = await makeRequest('/api/movies', 'POST', {
      title: 'Hacked Movie',
      description: 'Test',
      genre: ['Action'],
      durationMinutes: 100,
      releaseDate: '2026-01-01',
      posterUrl: 'https://example.com/p.jpg'
    }, userToken);
    assert.strictEqual(forbiddenRes.status, 403);
    console.log('  -> PASSED: Regular user blocked from admin endpoint (403)');

    // 10. Public signup ignores self-assigned role & Admin login verification
    console.log('[Test 10] Public signup role protection & Admin authentication verified');
    // A user attempting to send role: 'ADMIN' through registration
    const maliciousSignup = await makeRequest('/api/auth/register', 'POST', {
      name: 'Attempted Admin',
      email: 'attempted_admin@imovies.com',
      password: 'Password123',
      role: 'ADMIN'
    });
    assert.strictEqual(maliciousSignup.status, 201);
    assert.strictEqual(maliciousSignup.data.user.role, 'USER', 'Public registration must never allow self-assigned ADMIN role');
    await User.deleteOne({ email: 'attempted_admin@imovies.com' });

    // Seed verified Admin account directly
    await User.create({
      name: 'Admin Test User',
      email: adminEmail,
      password: 'AdminPassword123',
      role: 'ADMIN'
    });

    // Authenticate Admin via login endpoint
    const adminLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: adminEmail,
      password: 'AdminPassword123'
    });
    assert.strictEqual(adminLoginRes.status, 200);
    assert.strictEqual(adminLoginRes.data.user.role, 'ADMIN', 'Admin login must return actual verified role');
    const adminToken = adminLoginRes.data.token;

    const adminMovieRes = await makeRequest('/api/movies', 'POST', {
      title: 'Auth Test Movie',
      description: 'Created by Admin in test',
      genre: ['Sci-Fi'],
      durationMinutes: 120,
      releaseDate: '2026-05-15',
      posterUrl: 'https://example.com/poster.jpg'
    }, adminToken);
    assert.strictEqual(adminMovieRes.status, 201);
    console.log('  -> PASSED: Public registration strictly assigns USER; Admin login authenticates actual role with admin privileges (201)');

    // Cleanup created test movie
    if (adminMovieRes.data.movie && adminMovieRes.data.movie._id) {
      await makeRequest(`/api/movies/${adminMovieRes.data.movie._id}`, 'DELETE', null, adminToken);
    }

    // Cleanup test users
    await User.deleteMany({ email: { $in: [cleanEmail, adminEmail] } });
    console.log('--- ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY ---');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runTest().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
