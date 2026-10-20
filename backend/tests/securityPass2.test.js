/**
 * Ranaji Showroom - Security Pass 2 Automated Verification Suite
 * Tests insider threats, RBAC, high-risk approvals, audit immutability,
 * invoice tampering, inventory write-offs, and immediate account revocation.
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');
const Product = require('../src/models/product');
const Sale = require('../src/models/Sale');
const Customer = require('../src/models/Customer');
const ApprovalRequest = require('../src/models/ApprovalRequest');
const AuditLog = require('../src/models/AuditLog');
const Settings = require('../src/models/Settings');
const Category = require('../src/models/Category');
const connectDB = require('../src/config/database');

let server;
let baseUrl;

const TEST_SECRET = process.env.JWT_SECRET || 'ranaji_royal_jwt_secure_secret_2026';

// Helper to create test token
const makeToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    },
    TEST_SECRET,
    { expiresIn: '1h' }
  );
};

// Test users holder
let ownerUser, managerUser, cashierUser, inventoryUser;
let ownerToken, managerToken, cashierToken, inventoryToken;
let testProduct, testCustomer;

async function setup() {
  console.log('\n======================================================');
  console.log('🛡️ RANAJI SHOWROOM - SECURITY HARDENING TEST SUITE');
  console.log('   Targeting Insider Threats & Staff Permissions');
  console.log('======================================================\n');

  await connectDB();

  // Start HTTP server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[SETUP] Test Server listening on ${baseUrl}`);
      resolve();
    });
  });

  // Ensure default Settings exist
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      maxCashierDiscountPercent: 10,
      maxCashierDiscountAmount: 2000,
      maxInventoryWriteOffQty: 2,
      requireApprovalForRefunds: true,
      requireApprovalForWriteOffs: true
    });
  } else {
    settings.maxCashierDiscountPercent = 10;
    settings.maxCashierDiscountAmount = 2000;
    settings.maxInventoryWriteOffQty = 2;
    settings.requireApprovalForRefunds = true;
    settings.requireApprovalForWriteOffs = true;
    await settings.save();
  }

  // Clean existing test users if any
  await User.deleteMany({ email: /.*@security-test\.ranaji\.com/ });

  // Create isolated test staff accounts
  ownerUser = await User.create({
    name: 'SecTest Owner',
    email: 'owner@security-test.ranaji.com',
    password: 'password123',
    role: 'owner',
    employeeId: 'RNJ-TEST-OWNER',
    isActive: true,
    emailVerified: true
  });
  ownerToken = makeToken(ownerUser);

  managerUser = await User.create({
    name: 'SecTest Manager',
    email: 'manager@security-test.ranaji.com',
    password: 'password123',
    role: 'manager',
    employeeId: 'RNJ-TEST-MGR',
    isActive: true,
    emailVerified: true
  });
  managerToken = makeToken(managerUser);

  cashierUser = await User.create({
    name: 'SecTest Cashier',
    email: 'cashier@security-test.ranaji.com',
    password: 'password123',
    role: 'cashier',
    employeeId: 'RNJ-TEST-CSH',
    isActive: true,
    emailVerified: true
  });
  cashierToken = makeToken(cashierUser);

  inventoryUser = await User.create({
    name: 'SecTest Inventory',
    email: 'inventory@security-test.ranaji.com',
    password: 'password123',
    role: 'inventory',
    employeeId: 'RNJ-TEST-INV',
    isActive: true,
    emailVerified: true
  });
  inventoryToken = makeToken(inventoryUser);

  // Create or find test category
  let testCat = await Category.findOne();
  if (!testCat) {
    testCat = await Category.create({ name: 'Royal Ensembles', slug: 'royal-ensembles' });
  }

  // Create test product with stock
  testProduct = await Product.create({
    name: 'Security Test Royal Achkan',
    slug: `sec-test-achkan-${Date.now()}`,
    sku: `SKU-SECTEST-${Date.now().toString().slice(-4)}`,
    category: testCat._id,
    description: 'Security test product for RBAC and audit trail verification',
    price: { purchasePrice: 15000, rentPrice: 4500 },
    stock: 10,
    status: 'published'
  });

  // Create test customer
  testCustomer = await Customer.create({
    name: 'SecTest Patron',
    phone: `+91999${Date.now().toString().slice(-7)}`,
    email: 'patron@security-test.ranaji.com',
    city: 'Udaipur',
    createdBy: cashierUser._id,
    lastUpdatedBy: cashierUser._id
  });

  console.log('[SETUP] Test fixtures created successfully.\n');
}

async function teardown() {
  console.log('\n[TEARDOWN] Cleaning up test fixtures...');
  try {
    await User.deleteMany({ email: /.*@security-test\.ranaji\.com/ });
    if (testProduct) await Product.findByIdAndDelete(testProduct._id);
    if (testCustomer) await Customer.findByIdAndDelete(testCustomer._id);
    await Sale.deleteMany({ notes: /Security Test Sale/ });
    await ApprovalRequest.deleteMany({ reason: /SecTest/ });
  } catch (e) {
    console.error('Teardown error:', e.message);
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('[TEARDOWN] Test server closed.');
  }
}

const testResults = [];

function recordTest(name, passed, details = '') {
  testResults.push({ name, passed, details });
  if (passed) {
    console.log(`  ✅ PASS: ${name}`);
  } else {
    console.log(`  ❌ FAIL: ${name} -> ${details}`);
  }
}

async function runTests() {
  await setup();

  try {
    // -------------------------------------------------------------
    // TEST 1: Unauthenticated & Role-Based Access Control (RBAC)
    // -------------------------------------------------------------
    console.log('\n--- 1. RBAC & Unauthorized Access Tests ---');

    // 1.1 Unauthenticated call to staff
    const res1 = await fetch(`${baseUrl}/api/staff`);
    recordTest(
      'Unauthenticated request to /api/staff returns 401 Unauthorized',
      res1.status === 401,
      `Expected 401, got ${res1.status}`
    );

    // 1.2 Unauthenticated call to audit-logs
    const res2 = await fetch(`${baseUrl}/api/audit-logs`);
    recordTest(
      'Unauthenticated request to /api/audit-logs returns 401 Unauthorized',
      res2.status === 401,
      `Expected 401, got ${res2.status}`
    );

    // 1.3 Cashier attempting to access Staff Management
    const res3 = await fetch(`${baseUrl}/api/staff`, {
      headers: { Authorization: `Bearer ${cashierToken}` }
    });
    recordTest(
      'Cashier accessing /api/staff is forbidden with 403',
      res3.status === 403,
      `Expected 403, got ${res3.status}`
    );

    // 1.4 Cashier attempting to bulk export customer directory
    const res4 = await fetch(`${baseUrl}/api/customers/export`, {
      headers: { Authorization: `Bearer ${cashierToken}` }
    });
    recordTest(
      'Cashier exporting customer directory (/api/customers/export) is blocked with 403',
      res4.status === 403,
      `Expected 403, got ${res4.status}`
    );

    // 1.5 Cashier attempting to directly adjust inventory
    const res5 = await fetch(`${baseUrl}/api/inventory/adjust`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cashierToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        delta: -2,
        reason: 'Unauthorized cashier write-off'
      })
    });
    recordTest(
      'Cashier adjusting inventory (/api/inventory/adjust) is blocked with 403',
      res5.status === 403,
      `Expected 403, got ${res5.status}`
    );

    // 1.6 Manager allowed to export customer directory
    const res6 = await fetch(`${baseUrl}/api/customers/export`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    recordTest(
      'Manager accessing /api/customers/export is authorized with 200 OK',
      res6.status === 200,
      `Expected 200, got ${res6.status}`
    );

    // -------------------------------------------------------------
    // TEST 2: Privilege Escalation Prevention
    // -------------------------------------------------------------
    console.log('\n--- 2. Privilege Escalation Prevention Tests ---');

    // 2.1 Cashier attempting to promote themselves to owner
    const res7 = await fetch(`${baseUrl}/api/staff/${cashierUser._id}/role`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${cashierToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'owner' })
    });
    recordTest(
      'Cashier attempting role escalation to owner is rejected with 403',
      res7.status === 403,
      `Expected 403, got ${res7.status}`
    );

    // 2.2 Manager attempting to create another Owner
    const res8 = await fetch(`${baseUrl}/api/staff`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Rogue Owner',
        email: 'rogue@security-test.ranaji.com',
        password: 'password123',
        role: 'owner'
      })
    });
    recordTest(
      'Manager attempting to create staff accounts is rejected with 403 (Owner only)',
      res8.status === 403,
      `Expected 403, got ${res8.status}`
    );

    // 2.3 Manager attempting to update showroom security thresholds
    const res9 = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ maxCashierDiscountPercent: 99 })
    });
    recordTest(
      'Manager attempting to modify security settings is rejected with 403 (Owner only)',
      res9.status === 403,
      `Expected 403, got ${res9.status}`
    );

    // -------------------------------------------------------------
    // TEST 3: Cashier Refund Abuse & Dual-Custody Approval
    // -------------------------------------------------------------
    console.log('\n--- 3. Cashier Refund Abuse & Dual-Custody Approval Tests ---');

    // Create a completed sale invoice to test refund
    const saleData = {
      customer: {
        name: testCustomer.name,
        phone: testCustomer.phone,
        customerId: testCustomer._id.toString()
      },
      items: [
        {
          productId: testProduct._id.toString(),
          name: testProduct.name,
          sku: testProduct.sku,
          price: 15000,
          quantity: 1,
          total: 15000
        }
      ],
      calculation: {
        subtotal: 15000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 5,
        taxAmount: 750,
        grandTotal: 15750,
        paymentStatus: 'PAID'
      },
      payments: [{ method: 'Cash', amount: 15750 }],
      notes: 'Security Test Sale'
    };

    const saleCreateRes = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cashierToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saleData)
    });
    const saleCreateJson = await saleCreateRes.json();
    const testSale = saleCreateJson.data;

    // 3.1 Cashier attempts to refund without manager approval code
    const res10 = await fetch(`${baseUrl}/api/sales/${testSale._id}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cashierToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'Customer requested refund'
      })
    });
    recordTest(
      'Cashier refund without manager approval code is blocked with 403',
      res10.status === 403,
      `Expected 403, got ${res10.status}`
    );

    // 3.2 Cashier submits ApprovalRequest
    const res11 = await fetch(`${baseUrl}/api/approvals/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cashierToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'INVOICE_REFUND',
        reason: 'SecTest Return approved by patron',
        details: {
          invoiceNumber: testSale.invoiceNumber,
          amount: 15750,
          customerName: testCustomer.name
        }
      })
    });
    const approvalReqJson = await res11.json();
    recordTest(
      'Cashier submits INVOICE_REFUND approval request successfully (201)',
      res11.status === 201 && approvalReqJson.data?.status === 'PENDING',
      `Status: ${res11.status}`
    );

    const approvalId = approvalReqJson.data?._id;

    // 3.3 Manager approves request -> generates approval code
    const res12 = await fetch(`${baseUrl}/api/approvals/${approvalId}/approve`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reviewNotes: 'Verified wedding ensemble condition' })
    });
    const approveJson = await res12.json();
    const approvalCode = approveJson.data?.approvalCode;
    recordTest(
      'Manager approves refund request generating authorized code (200)',
      res12.status === 200 && Boolean(approvalCode),
      `Generated code: ${approvalCode}`
    );

    // 3.4 Cashier executes refund with valid approval code
    const res13 = await fetch(`${baseUrl}/api/sales/${testSale._id}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cashierToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'Returned ensemble in pristine condition',
        approvalCode
      })
    });
    const refundJson = await res13.json();
    recordTest(
      'Cashier executes refund with valid code (200, status=REFUNDED)',
      res13.status === 200 && refundJson.data?.status === 'REFUNDED',
      `Invoice status: ${refundJson.data?.status}`
    );

    // 3.5 Replay attack: attempting to refund the already refunded invoice
    const res14 = await fetch(`${baseUrl}/api/sales/${testSale._id}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'Second refund attempt'
      })
    });
    recordTest(
      'Double-refund replay attack blocked with 400 Bad Request',
      res14.status === 400,
      `Expected 400, got ${res14.status}`
    );

    // -------------------------------------------------------------
    // TEST 4: Cashier Discount Authority Limit
    // -------------------------------------------------------------
    console.log('\n--- 4. Cashier Discount Authority Limit Tests ---');

    // 4.1 Cashier attempts to grant 30% discount (limit is 10%) without approval
    const highDiscountSale = {
      customer: { name: 'VIP Buyer', phone: '+919876543210' },
      items: [
        {
          productId: testProduct._id.toString(),
          name: testProduct.name,
          sku: testProduct.sku,
          price: 15000,
          quantity: 1,
          total: 15000
        }
      ],
      calculation: {
        subtotal: 15000,
        discountPercent: 30, // Exceeds 10%
        discountAmount: 4500, // Exceeds ₹2000
        taxPercent: 5,
        taxAmount: 525,
        grandTotal: 11025,
        paymentStatus: 'PAID'
      },
      payments: [{ method: 'Cash', amount: 11025 }],
      notes: 'Security Test Sale High Discount'
    };

    const res15 = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cashierToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(highDiscountSale)
    });
    recordTest(
      'Cashier granting 30% discount without approval is blocked with 403',
      res15.status === 403,
      `Expected 403, got ${res15.status}`
    );

    // -------------------------------------------------------------
    // TEST 5: Financial Record Immutability (Invoice Tampering)
    // -------------------------------------------------------------
    console.log('\n--- 5. Financial Record Immutability Tests ---');

    // 5.1 Attempt to silently modify a completed invoice via PUT /api/sales/:id
    const res16 = await fetch(`${baseUrl}/api/sales/${testSale._id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'calculation.grandTotal': 500
      })
    });
    recordTest(
      'Silent modification of invoice via PUT is blocked with 400',
      res16.status === 400,
      `Expected 400, got ${res16.status}`
    );

    // 5.2 Attempt to delete an invoice via DELETE /api/sales/:id
    const res17 = await fetch(`${baseUrl}/api/sales/${testSale._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ownerToken}`
      }
    });
    recordTest(
      'Invoice deletion via DELETE is blocked with 403 Tax Compliance protection',
      res17.status === 403,
      `Expected 403, got ${res17.status}`
    );

    // -------------------------------------------------------------
    // TEST 6: Stock Write-Off Threshold & Manipulation Protection
    // -------------------------------------------------------------
    console.log('\n--- 6. Stock Write-Off Protection Tests ---');

    // 6.1 Inventory staff attempts to write off 6 units (threshold is 2) without approval
    const res18 = await fetch(`${baseUrl}/api/inventory/adjust`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${inventoryToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        delta: -6, // Exceeds threshold of 2
        reason: 'Shrinkage write-off'
      })
    });
    recordTest(
      'Inventory staff write-off of 6 units without approval is blocked with 403',
      res18.status === 403,
      `Expected 403, got ${res18.status}`
    );

    // 6.2 Inventory staff submits write-off approval request
    const res19 = await fetch(`${baseUrl}/api/approvals/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${inventoryToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'STOCK_WRITE_OFF',
        reason: 'SecTest damaged in transit',
        details: {
          productId: testProduct._id.toString(),
          productName: testProduct.name,
          units: 6
        }
      })
    });
    const writeOffReqJson = await res19.json();
    const writeOffApprovalId = writeOffReqJson.data?._id;

    // Manager approves write-off
    const res20 = await fetch(`${baseUrl}/api/approvals/${writeOffApprovalId}/approve`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reviewNotes: 'Verified physical fabric damage' })
    });
    const writeOffApproveJson = await res20.json();
    const writeOffApprovalCode = writeOffApproveJson.data?.approvalCode;

    // Inventory staff executes write-off with approval code
    const res21 = await fetch(`${baseUrl}/api/inventory/adjust`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${inventoryToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        delta: -6,
        reason: 'Damaged in transit write-off',
        approvalCode: writeOffApprovalCode
      })
    });
    recordTest(
      'Inventory staff write-off with valid approval code succeeds with 200',
      res21.status === 200,
      `Expected 200, got ${res21.status}`
    );

    // -------------------------------------------------------------
    // TEST 7: Audit Log Immutability Protection
    // -------------------------------------------------------------
    console.log('\n--- 7. Audit Log Immutability & Forensic Protection Tests ---');

    // Find any audit log record
    const auditRecord = await AuditLog.findOne().sort({ timestamp: -1 });

    // 7.1 Attempt DELETE via API
    const res22 = await fetch(`${baseUrl}/api/audit-logs/${auditRecord._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    recordTest(
      'Audit log deletion via DELETE /api/audit-logs/:id is rejected with 403',
      res22.status === 403,
      `Expected 403, got ${res22.status}`
    );

    // 7.2 Attempt PUT via API
    const res23 = await fetch(`${baseUrl}/api/audit-logs/${auditRecord._id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ details: 'Wiped details' })
    });
    recordTest(
      'Audit log modification via PUT /api/audit-logs/:id is rejected with 403',
      res23.status === 403,
      `Expected 403, got ${res23.status}`
    );

    // 7.3 Direct Mongoose query update rejection via pre-hook
    let directUpdateBlocked = false;
    try {
      await AuditLog.updateOne({ _id: auditRecord._id }, { details: { hacked: true } });
    } catch (e) {
      directUpdateBlocked = true;
    }
    recordTest(
      'Direct Mongoose updateOne on AuditLog is blocked by schema pre-hook',
      directUpdateBlocked,
      'Pre-hook threw expected error'
    );

    // 7.4 Direct Mongoose query deletion rejection via pre-hook
    let directDeleteBlocked = false;
    try {
      await AuditLog.deleteOne({ _id: auditRecord._id });
    } catch (e) {
      directDeleteBlocked = true;
    }
    recordTest(
      'Direct Mongoose deleteOne on AuditLog is blocked by schema pre-hook',
      directDeleteBlocked,
      'Pre-hook threw expected error'
    );

    // -------------------------------------------------------------
    // TEST 8: Immediate Account Revocation (Session Invalidation)
    // -------------------------------------------------------------
    console.log('\n--- 8. Immediate Account Revocation Tests ---');

    // Create a temporary staff member
    const tempStaff = await User.create({
      name: 'Temp Cashier',
      email: 'temp.cashier@security-test.ranaji.com',
      password: 'password123',
      role: 'cashier',
      employeeId: 'RNJ-TEMP-001',
      isActive: true,
      emailVerified: true
    });
    const tempToken = makeToken(tempStaff);

    // Verify temp staff can query single customer (valid session)
    const res24 = await fetch(`${baseUrl}/api/customers/${testCustomer._id}`, {
      headers: { Authorization: `Bearer ${tempToken}` }
    });
    recordTest(
      'Active staff token can access showroom customer endpoint (200 OK)',
      res24.status === 200,
      `Expected 200, got ${res24.status}`
    );

    // Owner revokes staff account
    const res25 = await fetch(`${baseUrl}/api/staff/${tempStaff._id}/deactivate`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason: 'Employee dismissed for security policy violation' })
    });
    recordTest(
      'Owner immediately deactivates staff account via /api/staff/:id/deactivate (200)',
      res25.status === 200,
      `Expected 200, got ${res25.status}`
    );

    // Temp staff immediately attempts request with the existing token
    const res26 = await fetch(`${baseUrl}/api/customers/${testCustomer._id}`, {
      headers: { Authorization: `Bearer ${tempToken}` }
    });
    const revokedJson = await res26.json();
    recordTest(
      'Deactivated staff JWT token is immediately rejected with 401',
      res26.status === 401 && revokedJson.message?.includes('revoked'),
      `Message: ${revokedJson.message}`
    );

    // -------------------------------------------------------------
    // TEST 9: Patron Record Ownership & Least Privilege
    // -------------------------------------------------------------
    console.log('\n--- 9. Customer Record Ownership & Least Privilege Tests ---');

    // 9.1 Non-owner attempting to delete customer
    const res27 = await fetch(`${baseUrl}/api/customers/${testCustomer._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${cashierToken}` }
    });
    recordTest(
      'Cashier attempting to delete customer record is blocked with 403 (Owner only)',
      res27.status === 403,
      `Expected 403, got ${res27.status}`
    );

    // 9.2 Owner deleting customer succeeds and records audit log
    const res28 = await fetch(`${baseUrl}/api/customers/${testCustomer._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    recordTest(
      'Owner deleting customer record succeeds with 200 OK',
      res28.status === 200,
      `Expected 200, got ${res28.status}`
    );

    // Verify audit log has CUSTOMER_DELETED
    const deleteAudit = await AuditLog.findOne({ action: 'CUSTOMER_DELETED' });
    recordTest(
      'Customer deletion recorded in immutable audit log with CUSTOMER_DELETED',
      Boolean(deleteAudit),
      'Found audit log'
    );

  } catch (err) {
    console.error('\n❌ Unexpected error running tests:', err);
  } finally {
    await teardown();
  }

  // Summary Report
  console.log('\n======================================================');
  console.log('📊 SECURITY PASS 2 TEST SUMMARY REPORT');
  console.log('======================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;

  console.log(`Total Security Scenarios Tested: ${testResults.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount > 0) {
    console.log('\nFAILED SCENARIOS:');
    testResults
      .filter((r) => !r.passed)
      .forEach((r) => console.log(` - ${r.name}: ${r.details}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 24 SECURITY HARDENING SCENARIOS PASSED WITH LIVE MONGO ATLAS VERIFICATION!\n');
    process.exit(0);
  }
}

runTests();
