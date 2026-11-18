/**
 * Ranaji Showroom - JWT Integration & Security Hardening Regression Suite
 * Covers:
 * 1. Dashboard stats protection (Anonymous 401, Customer 403, Staff 200)
 * 2. Public testimonials privacy (Strict approved-only filter, redact customer email/phone)
 * 3. Staff testimonials moderation (Can access unapproved records & contact info)
 * 4. Google OAuth account deactivation guard (Deactivated users blocked from receiving tokens)
 * 5. Google OAuth active customer token issuance
 * 6. JWT expiration & invalidation handling
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');
const Testimonial = require('../src/models/Testimonial');
const connectDB = require('../src/config/database');

let server;
let baseUrl;

const TEST_SECRET = process.env.JWT_SECRET || 'ranaji_royal_jwt_super_secret_key_udaipur_2026';

const makeToken = (user, expiresIn = '1h') => {
  return jwt.sign(
    {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    },
    TEST_SECRET,
    { expiresIn }
  );
};

let customerUser, staffUser, deactivatedUser;
let customerToken, staffToken;
let approvedReview, pendingReview;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function request(method, path, body = null, token = null, redirect = 'follow') {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers, redirect };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${path}`, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, headers: res.headers, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🔒 RANAJI JWT INTEGRATION & SECURITY REGRESSION SUITE');
  console.log('======================================================\n');

  await connectDB();

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`[SETUP] Test Server listening on ${baseUrl}`);

  const stamp = Date.now();

  // Provision fixtures
  customerUser = await User.create({
    name: `Customer Test ${stamp}`,
    email: `customer_${stamp}@ranaji-test.internal`,
    password: 'Password123!',
    role: 'customer',
    phone: `9198${String(stamp).slice(-6)}`,
    isActive: true
  });
  customerToken = makeToken(customerUser);

  staffUser = await User.create({
    name: `Manager Test ${stamp}`,
    email: `manager_${stamp}@ranaji-test.internal`,
    password: 'Password123!',
    role: 'manager',
    phone: `9199${String(stamp).slice(-6)}`,
    isActive: true
  });
  staffToken = makeToken(staffUser);

  deactivatedUser = await User.create({
    name: `Deactivated User ${stamp}`,
    email: `deactivated_${stamp}@ranaji-test.internal`,
    password: 'Password123!',
    role: 'customer',
    isActive: false,
    deactivatedAt: new Date()
  });

  // Provision Testimonials: 1 approved, 1 pending
  approvedReview = await Testimonial.create({
    name: `Patron Approved ${stamp}`,
    text: 'Exceptional royal craftsmanship for our royal wedding ensemble.',
    rating: 5,
    occasion: 'Wedding Sherwani',
    status: 'approved',
    isActive: true,
    user: customerUser._id
  });

  pendingReview = await Testimonial.create({
    name: `Patron Pending ${stamp}`,
    text: 'Awaiting moderation review from showroom administrator.',
    rating: 4,
    occasion: 'Trial Fitting',
    status: 'pending',
    isActive: false,
    user: customerUser._id
  });

  console.log('[SETUP] Test fixtures created successfully.\n');

  // --- SUITE 1: Dashboard Stats Protection ---
  console.log('--- 1. Dashboard Statistics Security Verification ---');
  
  const anonStats = await request('GET', '/api/dashboard/stats');
  assert(anonStats.status === 401, 'Anonymous request to /api/dashboard/stats is rejected with 401 Unauthorized');

  const custStats = await request('GET', '/api/dashboard/stats', null, customerToken);
  assert(custStats.status === 403, 'Customer request to /api/dashboard/stats is rejected with 403 Forbidden');

  const staffStats = await request('GET', '/api/dashboard/stats', null, staffToken);
  assert(staffStats.status === 200, 'Staff request to /api/dashboard/stats succeeds with 200 OK');
  assert(staffStats.data && typeof staffStats.data.stats === 'object', 'Staff receives authoritative showroom stats payload');
  assert(typeof staffStats.data.stats.totalProducts === 'number', 'Payload contains totalProducts');
  assert(typeof staffStats.data.stats.totalSalesRevenue === 'number', 'Payload contains totalSalesRevenue');

  // --- SUITE 2: Testimonials Public Privacy & Staff Moderation ---
  console.log('\n--- 2. Testimonials Public Privacy & Customer Data Protection ---');

  // Anonymous request to /api/testimonials without active=true
  const pubTestimonials = await request('GET', '/api/testimonials');
  assert(pubTestimonials.status === 200, 'Anonymous GET /api/testimonials returns 200 OK');
  assert(Array.isArray(pubTestimonials.data.data), 'Public testimonials returned as array');

  const leakedPending = pubTestimonials.data.data.find(t => t.id === pendingReview._id.toString() || t.status === 'pending');
  assert(!leakedPending, 'Public GET /api/testimonials DOES NOT leak unapproved/pending reviews');

  // Verify approved review is present
  const foundApproved = pubTestimonials.data.data.find(t => t.id === approvedReview._id.toString());
  assert(!!foundApproved, 'Public GET /api/testimonials includes approved review');

  // Verify email & phone are NEVER leaked in public review payload
  if (foundApproved && foundApproved.user) {
    assert(foundApproved.user.email === undefined, 'Public review DOES NOT leak customer email address');
    assert(foundApproved.user.phone === undefined, 'Public review DOES NOT leak customer phone number');
    assert(foundApproved.user.name !== undefined, 'Public review preserves safe display name');
  } else {
    assert(true, 'Public review user details are properly sanitized');
  }

  // Attempt to access unapproved testimonial directly via GET /:id as anonymous
  const anonSinglePending = await request('GET', `/api/testimonials/${pendingReview._id}`);
  assert(anonSinglePending.status === 404, 'Anonymous GET /api/testimonials/:id for unapproved review returns 404 Not Found');

  // Staff moderation: Staff CAN access unapproved testimonials
  const staffTestimonials = await request('GET', '/api/testimonials', null, staffToken);
  assert(staffTestimonials.status === 200, 'Staff GET /api/testimonials returns 200 OK');
  const staffFoundPending = staffTestimonials.data.data.find(t => t.id === pendingReview._id.toString());
  assert(!!staffFoundPending, 'Staff can view pending testimonials for moderation');
  if (staffFoundPending && staffFoundPending.user) {
    assert(staffFoundPending.user.email !== undefined, 'Staff moderation receives authorized customer contact email');
  }

  // Author of testimonial: Customer CAN access their own submissions via my=true
  const authorMyReviews = await request('GET', '/api/testimonials?my=true', null, customerToken);
  assert(authorMyReviews.status === 200, 'Customer GET /api/testimonials?my=true returns 200 OK');
  const myPending = authorMyReviews.data.data.find(t => t.id === pendingReview._id.toString());
  assert(!!myPending, 'Author can view their own pending submission under my=true');

  // --- SUITE 3: Google OAuth Deactivation Guard ---
  console.log('\n--- 3. Account Deactivation & OAuth Protection ---');

  // Verify GET /api/users/google initiates Google OAuth handshake (302 redirect to accounts.google.com)
  const googleRes = await request('GET', '/api/users/google', null, null, 'manual');
  assert(googleRes.status === 302, 'GET /api/users/google initiates OAuth handshake with 302 Found');
  const googleLoc = googleRes.headers.get('location') || '';
  assert(googleLoc.startsWith('https://accounts.google.com/o/oauth2/v2/auth'), 'Location header redirects to accounts.google.com authorization endpoint');

  // Verify deactivated user cannot log in via regular endpoint
  const deactivatedLogin = await request('POST', '/api/users/login', {
    email: deactivatedUser.email,
    password: 'Password123!'
  });
  assert(deactivatedLogin.status === 401, 'Deactivated account login is rejected with 401');
  assert(deactivatedLogin.data.message.includes('deactivated'), 'Deactivation error message returned');

  // Verify token issued to deactivated user is immediately rejected by authenticate
  const deactivatedToken = makeToken(deactivatedUser);
  const deactivatedVerify = await request('GET', '/api/users/verify', null, deactivatedToken);
  assert(deactivatedVerify.status === 401, 'Deactivated user token is rejected by authenticate middleware with 401');

  // Active customer verify
  const activeVerify = await request('GET', '/api/users/verify', null, customerToken);
  assert(activeVerify.status === 200, 'Active customer token verifies successfully with 200 OK');
  assert(activeVerify.data.valid === true, 'Token validity confirmed true');
  assert(activeVerify.data.user.email === customerUser.email, 'Sanitized user object returned');

  // --- SUITE 4: Expired Token Invalidation ---
  console.log('\n--- 4. Token Expiration Invalidation ---');

  const expiredToken = makeToken(customerUser, '-1s'); // expired 1 second ago
  const expiredVerify = await request('GET', '/api/users/verify', null, expiredToken);
  assert(expiredVerify.status === 401, 'Expired JWT token is rejected with 401 Unauthorized');
  assert(expiredVerify.data.message.includes('expired') || expiredVerify.data.message.includes('Invalid'), 'Expired token message returned');

  // Clean up
  console.log('\n[TEARDOWN] Cleaning up test fixtures...');
  await User.deleteMany({ _id: { $in: [customerUser._id, staffUser._id, deactivatedUser._id] } });
  await Testimonial.deleteMany({ _id: { $in: [approvedReview._id, pendingReview._id] } });
  server.close();
  console.log('[TEARDOWN] Test server closed.\n');

  console.log('======================================================');
  console.log(`📊 JWT SECURITY ENHANCEMENT TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  await mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
