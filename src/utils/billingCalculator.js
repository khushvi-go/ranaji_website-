/**
 * Ranaji Centralized Financial & Billing Calculation Service
 * 
 * Implements decimal-safe money calculations (in integer paise internally where needed),
 * explicit GST tax rates (0%, 5%, 12%, 18%), item discounts, bill-level discounts,
 * tender change calculation, and payment status tracking.
 */

export const TAX_RATES = [
  { label: 'No GST (0%)', rate: 0 },
  { label: 'GST 5% (Apparel ≤ ₹1,000)', rate: 0.05 },
  { label: 'GST 12% (Apparel > ₹1,000 / Standard)', rate: 0.12 },
  { label: 'GST 18% (Luxury / Accessories)', rate: 0.18 },
];

/**
 * Calculates line item total
 */
export const calculateLineTotal = (item) => {
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const unitPrice = Math.max(0, Number(item.price) || 0);
  const discountType = item.discountType || 'flat'; // 'flat' | 'percent'
  const discountVal = Math.max(0, Number(item.discount) || 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = Math.round((unitPrice * quantity * discountVal) / 100);
  } else {
    discountAmount = Math.min(unitPrice * quantity, discountVal);
  }

  const grossTotal = unitPrice * quantity;
  const netTotal = Math.max(0, grossTotal - discountAmount);

  return {
    quantity,
    unitPrice,
    discountAmount,
    grossTotal,
    netTotal
  };
};

/**
 * Calculates complete bill totals
 */
export const calculateBill = ({
  items = [],
  billDiscountType = 'flat', // 'flat' | 'percent'
  billDiscountValue = 0,
  taxRate = 0.12, // 12% default for premium Indian apparel
  amountPaid = 0
}) => {
  // 1. Calculate each line
  let itemsGross = 0;
  let itemsDiscount = 0;
  let itemsNet = 0;

  const processedItems = items.map((item, idx) => {
    const calc = calculateLineTotal(item);
    itemsGross += calc.grossTotal;
    itemsDiscount += calc.discountAmount;
    itemsNet += calc.netTotal;
    return {
      ...item,
      lineIndex: idx + 1,
      ...calc
    };
  });

  // 2. Bill-level discount
  let billDiscountAmount = 0;
  const discVal = Math.max(0, Number(billDiscountValue) || 0);
  if (billDiscountType === 'percent') {
    billDiscountAmount = Math.round((itemsNet * discVal) / 100);
  } else {
    billDiscountAmount = Math.min(itemsNet, discVal);
  }

  // 3. Taxable amount (Net after bill discount)
  const taxableAmount = Math.max(0, itemsNet - billDiscountAmount);

  // 4. GST calculation (Split into CGST & SGST for intra-state Rajasthan)
  const effectiveTaxRate = Number(taxRate) || 0;
  const totalTax = Math.round(taxableAmount * effectiveTaxRate);
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst; // handles odd rupee rounding

  // 5. Final Total with round-off
  const rawTotal = taxableAmount + totalTax;
  const roundedTotal = Math.round(rawTotal);
  const roundOff = Number((roundedTotal - rawTotal).toFixed(2));

  // 6. Payment & Balance
  const paid = Math.max(0, Number(amountPaid) || 0);
  const balanceRemaining = Math.max(0, roundedTotal - paid);
  const changeDue = Math.max(0, paid - roundedTotal);

  let paymentStatus = 'UNPAID';
  if (paid >= roundedTotal && roundedTotal > 0) {
    paymentStatus = 'PAID';
  } else if (paid > 0 && paid < roundedTotal) {
    paymentStatus = 'PARTIAL';
  }

  return {
    items: processedItems,
    itemsCount: items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0),
    itemsGross,
    itemsDiscount,
    itemsNet,
    billDiscountAmount,
    totalDiscount: itemsDiscount + billDiscountAmount,
    taxableAmount,
    taxRate: effectiveTaxRate,
    cgst,
    sgst,
    totalTax,
    rawTotal,
    roundOff,
    grandTotal: roundedTotal,
    amountPaid: paid,
    balanceRemaining,
    changeDue,
    paymentStatus
  };
};

/**
 * Format currency in Indian Rupees
 */
export const formatINR = (amount) => {
  const val = Math.round(Number(amount) || 0);
  return `₹${val.toLocaleString('en-IN')}`;
};

/**
 * Convert number to Indian currency words
 */
export const numberToIndianWords = (num) => {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  
  return (str.trim() ? str.trim() + ' Rupees Only' : 'Zero Rupees Only');
};
