// Automated Test Suite for Ranaji POS & Showroom Platform Requirements
import { calculateBill, calculateLineTotal, TAX_RATES, numberToIndianWords } from './src/utils/billingCalculator.js';
import { defaultProducts } from './src/data/initialShopData.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('═══════════════════════════════════════════════════');
console.log('   RUNNING RANAJI POS & BILLING VERIFICATION SUITE  ');
console.log('═══════════════════════════════════════════════════\n');

// 1. Line Item calculation
const lineCalc1 = calculateLineTotal({
  price: 15000,
  quantity: 2,
  discount: 1000,
  discountType: 'flat'
});
assert(lineCalc1.grossTotal === 30000, 'Line gross total: 15000 * 2 = 30000');
assert(lineCalc1.discountAmount === 1000, 'Line discount applied = 1000');
assert(lineCalc1.netTotal === 29000, 'Line net total = 29000');

// 2. Bill with GST & Bill-level discount
const bill1 = calculateBill({
  items: [
    { price: 15000, quantity: 1, discount: 0 },
    { price: 2800, quantity: 1, discount: 0 }
  ],
  billDiscountType: 'flat',
  billDiscountValue: 800,
  taxRate: 0.12, // 12% GST
  amountPaid: 19040
});

assert(bill1.itemsGross === 17800, 'Bill items gross total = 17800');
assert(bill1.billDiscountAmount === 800, 'Bill discount = 800');
assert(bill1.taxableAmount === 17000, 'Taxable amount = 17000 (17800 - 800)');
assert(bill1.totalTax === 2040, '12% GST = 2040');
assert(bill1.cgst === 1020, 'CGST 6% = 1020');
assert(bill1.sgst === 1020, 'SGST 6% = 1020');
assert(bill1.grandTotal === 19040, 'Grand total = 19040');
assert(bill1.paymentStatus === 'PAID', 'Payment status is PAID when amount matches grandTotal');
assert(bill1.balanceRemaining === 0, 'Balance remaining is 0');

// 3. Partial payment test
const partialBill = calculateBill({
  items: [{ price: 10000, quantity: 1 }],
  taxRate: 0.12,
  amountPaid: 5000
});
assert(partialBill.grandTotal === 11200, 'Grand total is 11200');
assert(partialBill.amountPaid === 5000, 'Amount paid is 5000');
assert(partialBill.balanceRemaining === 6200, 'Remaining balance is correctly 6200');
assert(partialBill.paymentStatus === 'PARTIAL', 'Status marked as PARTIAL payment');

// 4. Cash change due calculation
const cashBill = calculateBill({
  items: [{ price: 4500, quantity: 1 }],
  taxRate: 0.12,
  amountPaid: 6000 // Tendered 6000
});
assert(cashBill.grandTotal === 5040, 'Grand total = 5040');
assert(cashBill.changeDue === 960, 'Change due = 960 (6000 - 5040)');

// 5. Currency in Indian Words
const words = numberToIndianWords(19040);
assert(words.includes('Nineteen Thousand') && words.includes('Forty'), 'Number to words conversion handles 19040');

// 6. Stock check on initial product catalog
assert(defaultProducts.length >= 8, 'Default products has comprehensive collection');
const groomSherwani = defaultProducts.find(p => p.name.includes('Sherwani'));
assert(groomSherwani && groomSherwani.stock > 0, 'Sherwani has positive showroom stock');
assert(groomSherwani.rentPrice < groomSherwani.price, 'Rental price is distinct and lower than purchase price');

console.log('\n───────────────────────────────────────────────────');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('───────────────────────────────────────────────────');

if (failed > 0) process.exit(1);
