/**
 * Ranaji Showroom - Customer Isolation, Price Integrity & Route Hardening Verification Suite
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Sale = require('../src/models/Sale');
const Customer = require('../src/models/Customer');
const Settings = require('../src/models/Settings');
const connectDB = require('../src/config/database');

let server;
let baseUrl;

const TEST_SECRET = process.env.JWT_SECRET || 'ranaji_royal_jwt_secure_secret_2026';

const makeToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    },
    TEST_SECRET,
    { expiresIn: '1h' }
  );
};

let customerA, customerB, cashierUser, ownerUser;
let tokenA, tokenB, cashierToken, ownerToken;
let testProduct;

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

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${path}`, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {}
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🔒 RANAJI CUSTOMER DATA ISOLATION & HARDENING SUITE');
  console.log('======================================================\n');

  await connectDB();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      console.log(`[SETUP] Test Server running on ${baseUrl}`);
      resolve();
    });
  });

  const uniqueSuffix = Date.now().toString().slice(-5);

  customerA = await User.create({
    name: `Customer Alpha ${uniqueSuffix}`,
    email: `custA_${uniqueSuffix}@example.com`,
    password: 'Password123!',
    role: 'customer',
    phone: `91000${uniqueSuffix}`,
    provider: 'local',
    isActive: true
  });
  tokenA = makeToken(customerA);

  customerB = await User.create({
    name: `Customer Beta ${uniqueSuffix}`,
    email: `custB_${uniqueSuffix}@example.com`,
    password: 'Password123!',
    role: 'customer',
    phone: `92000${uniqueSuffix}`,
    provider: 'local',
    isActive: true
  });
  tokenB = makeToken(customerB);

  cashierUser = await User.create({
    name: `Cashier Staff ${uniqueSuffix}`,
    email: `cashier_${uniqueSuffix}@ranaji.com`,
    password: 'Password123!',
    role: 'cashier',
    phone: `93000${uniqueSuffix}`,
    provider: 'local',
    isActive: true
  });
  cashierToken = makeToken(cashierUser);

  ownerUser = await User.create({
    name: `Owner Admin ${uniqueSuffix}`,
    email: `owner_${uniqueSuffix}@ranaji.com`,
    password: 'Password123!',
    role: 'owner',
    phone: `94000${uniqueSuffix}`,
    provider: 'local',
    isActive: true
  });
  ownerToken = makeToken(ownerUser);

  testProduct = await Product.create({
    name: `Royal Heritage Achkan ${uniqueSuffix}`,
    slug: `royal-heritage-achkan-${uniqueSuffix}`,
    description: 'Gold Embroidered Royal Attire',
    price: { purchasePrice: 20000, rentPrice: 6000 },
    stock: 10,
    category: new mongoose.Types.ObjectId(),
    status: 'published'
  });

  console.log('[SETUP] Test fixtures created.\n');

  // --- SECTION 1: ANONYMOUS ACCESS RESTRICTIONS ---
  console.log('--- 1. Anonymous Access Rejections on Restricted Endpoints ---');

  const anonCust = await request('GET', '/api/customers');
  assert(anonCust.status === 401, 'Anonymous GET /api/customers is rejected with 401');

  const anonSales = await request('GET', '/api/sales');
  assert(anonSales.status === 401, 'Anonymous GET /api/sales is rejected with 401');

  const anonOrders = await request('GET', '/api/orders');
  assert(anonOrders.status === 401, 'Anonymous GET /api/orders is rejected with 401');

  const anonPostSale = await request('POST', '/api/sales', { items: [{ name: 'Test', price: 100 }] });
  assert(anonPostSale.status === 401, 'Anonymous POST /api/sales is rejected with 401');

  const anonCatPost = await request('POST', '/api/categories', { name: 'Test Category' });
  assert(anonCatPost.status === 401, 'Anonymous POST /api/categories is rejected with 401');

  const anonContacts = await request('GET', '/api/contacts');
  assert(anonContacts.status === 401, 'Anonymous GET /api/contacts is rejected with 401');

  const anonBookings = await request('GET', '/api/bookings');
  assert(anonBookings.status === 401, 'Anonymous GET /api/bookings is rejected with 401');

  const anonInventory = await request('GET', '/api/inventory');
  assert(anonInventory.status === 401, 'Anonymous GET /api/inventory is rejected with 401');

  const anonRentals = await request('GET', '/api/rentals');
  assert(anonRentals.status === 401, 'Anonymous GET /api/rentals is rejected with 401');

  // --- SECTION 2: CUSTOMER RECORD ISOLATION ---
  console.log('\n--- 2. Customer Record Isolation & Cross-Account Protection ---');

  // Create Order for Customer A
  const orderRes = await request('POST', '/api/orders', {
    items: [
      {
        productId: testProduct._id.toString(),
        quantity: 1,
        orderType: 'purchase'
      }
    ],
    customerName: customerA.name,
    customerPhone: customerA.phone,
    customerEmail: customerA.email
  }, tokenA);

  assert(orderRes.status === 201, 'Customer A places order successfully (201)');
  const orderId = orderRes.data?.order?.id || orderRes.data?.order?._id;

  // Customer A can view their order
  const getOrderA = await request('GET', `/api/orders/${orderId}`, null, tokenA);
  assert(getOrderA.status === 200, 'Customer A can view their own order (200 OK)');

  // Customer B CANNOT view Customer A's order
  const getOrderB = await request('GET', `/api/orders/${orderId}`, null, tokenB);
  assert(getOrderB.status === 403, 'Customer B is forbidden from viewing Customer A order (403)');

  // Customer B querying /api/orders receives empty list (does NOT see Customer A's order)
  const listOrdersB = await request('GET', '/api/orders', null, tokenB);
  assert(listOrdersB.status === 200, 'Customer B receives 200 from /api/orders');
  const foundCustAOrder = (listOrdersB.data?.data || []).some(o => o.id === orderId || o.orderNumber === orderRes.data?.order?.orderNumber);
  assert(!foundCustAOrder, 'Customer B list does NOT leak Customer A orders');

  // --- SECTION 3: SERVER-SIDE PRICE RECALCULATION ---
  console.log('\n--- 3. Server-Side Order Price Recalculation & Tampering Guard ---');

  // Malicious request attempting to buy a ₹20,000 product for ₹1
  const tamperedOrder = await request('POST', '/api/orders', {
    items: [
      {
        productId: testProduct._id.toString(),
        quantity: 2,
        orderType: 'purchase',
        unitPrice: 1, // Tampered client price!
        price: 1
      }
    ],
    subtotal: 2, // Tampered subtotal!
    total: 2,    // Tampered total!
    customerName: customerA.name,
    customerPhone: customerA.phone,
    customerEmail: customerA.email
  }, tokenA);

  assert(tamperedOrder.status === 201, 'Order created and processed on backend');
  // Expected price is 20,000 * 2 = 40,000
  const savedTotal = tamperedOrder.data?.order?.total;
  assert(savedTotal === 40000, `Backend recalcs authoritative total: expected ₹40,000, got ₹${savedTotal}`);

  // Rental price check: ₹6,000 * 1 = ₹6,000
  const rentalOrder = await request('POST', '/api/orders', {
    items: [
      {
        productId: testProduct._id.toString(),
        quantity: 1,
        orderType: 'rent',
        unitPrice: 50 // Tampered rental price!
      }
    ],
    total: 50,
    customerName: customerA.name,
    customerPhone: customerA.phone
  }, tokenA);
  assert(rentalOrder.data?.order?.total === 6000, `Rental order recalcs authoritative rent price: ₹${rentalOrder.data?.order?.total}`);

  // --- SECTION 4: POS BILLING DUPLICATE PROTECTION ---
  console.log('\n--- 4. POS Billing Duplicate Replay Protection ---');

  const invoiceNum = `RNJ-${new Date().getFullYear()}-DUP99`;
  const salePayload = {
    invoiceNumber: invoiceNum,
    items: [
      {
        productId: testProduct._id.toString(),
        name: testProduct.name,
        quantity: 1,
        unitPrice: 20000,
        total: 20000
      }
    ],
    calculation: {
      subtotal: 20000,
      totalTax: 0,
      grandTotal: 20000
    },
    customer: {
      name: 'Walk-in Patron',
      phone: '9999900000'
    }
  };

  const firstBill = await request('POST', '/api/sales', salePayload, cashierToken);
  assert(firstBill.status === 201, 'First POS bill is recorded successfully (201)');

  // Send identical billing request within 2 seconds
  const dupBill = await request('POST', '/api/sales', salePayload, cashierToken);
  assert(dupBill.status === 200, 'Duplicate bill caught by idempotency guard (200 OK)');
  assert(dupBill.data?.message?.includes('Duplicate billing prevented'), 'Idempotency message returned');

  // --- SECTION 5: SETTINGS PRIVACY & SANITIZATION ---
  console.log('\n--- 5. Settings Endpoint Privacy & Policy Leak Prevention ---');

  const publicSettings = await request('GET', '/api/settings/public');
  assert(publicSettings.status === 200, 'Public settings returns 200 OK');
  assert(publicSettings.data?.data?.showroomName !== undefined, 'Public settings includes showroom name');
  assert(publicSettings.data?.data?.phone !== undefined, 'Public settings includes contact phone');
  assert(publicSettings.data?.data?.maxCashierDiscountPercent === undefined, 'Public settings DOES NOT leak maxCashierDiscountPercent');
  assert(publicSettings.data?.data?.requireApprovalForRefunds === undefined, 'Public settings DOES NOT leak requireApprovalForRefunds');

  // Cashier cannot update settings
  const cashierSettingsPut = await request('PUT', '/api/settings', { showroomName: 'Hacked Showroom' }, cashierToken);
  assert(cashierSettingsPut.status === 403, 'Cashier is forbidden from modifying showroom settings (403)');

  // Owner can update settings
  const ownerSettingsPut = await request('PUT', '/api/settings', { phone: '+91 98765 43210' }, ownerToken);
  assert(ownerSettingsPut.status === 200, 'Owner successfully updates showroom settings (200)');

  // Clean up
  console.log('\n[TEARDOWN] Cleaning up test fixtures...');
  await User.deleteMany({ _id: { $in: [customerA._id, customerB._id, cashierUser._id, ownerUser._id] } });
  await Product.findByIdAndDelete(testProduct._id);
  await Order.deleteMany({ customerPhone: { $in: [customerA.phone, customerB.phone] } });
  await Sale.deleteOne({ invoiceNumber: invoiceNum });
  await server.close();

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
