/**
 * Initial Showroom Customers & Business Records
 */

export const defaultCustomers = [
  {
    id: 'cust-101',
    name: 'Yuvraj Vikramaditya Rathore',
    phone: '+91 98290 12345',
    email: 'vikram.rathore@rajasthan.royal.in',
    city: 'Udaipur, Rajasthan',
    address: 'City Palace Enclave, Udaipur',
    totalSpent: 48500,
    ordersCount: 2,
    balance: 0,
    measurements: {
      chest: '42 in',
      waist: '36 in',
      shoulder: '19 in',
      sherwaniLength: '45 in',
      sleeveLength: '26 in',
      safaSize: '23 in',
      notes: 'Prefers regal velvet cuffs and custom pearl-button spacing'
    },
    notes: 'Royal Groom client for December 2026 wedding',
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'cust-102',
    name: 'Baisa Meenakshi Shekhawat',
    phone: '+91 94140 56789',
    email: 'meenakshi.s@gmail.com',
    city: 'Jaipur, Rajasthan',
    address: 'C-Scheme, Ashok Nagar, Jaipur',
    totalSpent: 62000,
    ordersCount: 1,
    balance: 0,
    measurements: {
      chest: '36 in',
      waist: '30 in',
      shoulder: '15 in',
      lehengaLength: '42 in',
      blouseLength: '15 in',
      notes: 'Heavy pure gota patti bridal poshak tailoring required'
    },
    notes: 'Bride order - royal crimson poshak with gold odhna',
    createdAt: '2026-10-05T11:30:00.000Z'
  },
  {
    id: 'cust-103',
    name: 'Thakur Ranvijay Singh',
    phone: '+91 98292 77889',
    email: 'ranvijay.singh@gmail.com',
    city: 'Jodhpur, Rajasthan',
    address: 'Ratanada, Jodhpur',
    totalSpent: 18500,
    ordersCount: 1,
    balance: 0,
    measurements: {
      chest: '40 in',
      waist: '34 in',
      shoulder: '18 in',
      sherwaniLength: '43 in',
      safaSize: '22.5 in'
    },
    notes: 'Jodhpuri bandhgala & royal accessory rental',
    createdAt: '2026-10-10T14:15:00.000Z'
  },
  {
    id: 'cust-104',
    name: 'Walk-in Counter Customer',
    phone: '+91 99999 00000',
    email: 'counter@ranaji.in',
    city: 'Udaipur Showroom',
    address: 'Direct Counter Sale',
    totalSpent: 0,
    ordersCount: 0,
    balance: 0,
    measurements: {},
    notes: 'Default walk-in showroom shopper',
    createdAt: '2026-10-01T09:00:00.000Z'
  }
];

export const defaultSales = [
  {
    id: 'sale-001',
    invoiceNumber: 'RNJ-2026-0001',
    date: '2026-10-17T11:45:00.000Z',
    customer: {
      id: 'cust-101',
      name: 'Yuvraj Vikramaditya Rathore',
      phone: '+91 98290 12345',
      address: 'City Palace Enclave, Udaipur'
    },
    items: [
      {
        id: 1,
        name: 'The Maharaja Sherwani',
        sku: 'RNJ-GRM-001',
        mode: 'purchase',
        size: '42 (XL)',
        color: 'Deep Royal Maroon & Antique Gold',
        unitPrice: 15000,
        quantity: 1,
        discountAmount: 0,
        grossTotal: 15000,
        netTotal: 15000
      },
      {
        id: 7,
        name: 'Royal Heritage Saafa & Kalangi',
        sku: 'RNJ-ACC-007',
        mode: 'purchase',
        size: '23 in',
        color: 'Royal Kesariya & Saffron Silk',
        unitPrice: 2800,
        quantity: 1,
        discountAmount: 0,
        grossTotal: 2800,
        netTotal: 2800
      }
    ],
    calculation: {
      itemsGross: 17800,
      itemsDiscount: 0,
      itemsNet: 17800,
      billDiscountAmount: 800,
      totalDiscount: 800,
      taxableAmount: 17000,
      taxRate: 0.12,
      cgst: 1020,
      sgst: 1020,
      totalTax: 2040,
      grandTotal: 19040,
      amountPaid: 19040,
      balanceRemaining: 0,
      changeDue: 0,
      paymentStatus: 'PAID'
    },
    payments: [
      {
        method: 'UPI',
        amount: 19040,
        reference: 'UPI/382910482910/Rathore',
        timestamp: '2026-10-17T11:45:00.000Z'
      }
    ],
    cashier: 'Admin (Master Showroom)',
    register: 'Counter 01'
  }
];

export const defaultRentals = [
  {
    id: 'rent-201',
    rentalNumber: 'RNT-2026-0001',
    customer: {
      id: 'cust-103',
      name: 'Thakur Ranvijay Singh',
      phone: '+91 98292 77889'
    },
    product: {
      id: 2,
      name: 'Jodhpuri Bandhgala Suit',
      sku: 'RNJ-GRM-002',
      size: '40 (L)',
      color: 'Midnight Black & Handcrafted Brass Buttons'
    },
    startDate: '2026-10-17',
    returnDate: '2026-10-21',
    rentalFee: 3200,
    securityDeposit: 5000,
    depositStatus: 'HELD_CASH',
    status: 'ISSUED', // RESERVED | ISSUED | RETURNED | OVERDUE
    notes: 'Garment dry-cleaned and steam pressed before handover',
    createdAt: '2026-10-17T14:00:00.000Z'
  }
];

export const defaultInventoryMovements = [
  {
    id: 'mov-1',
    date: '2026-10-17T11:45:00.000Z',
    productName: 'The Maharaja Sherwani',
    sku: 'RNJ-GRM-001',
    change: -1,
    balance: 4,
    type: 'SALE',
    reference: 'Invoice #RNJ-2026-0001',
    actor: 'Admin'
  },
  {
    id: 'mov-2',
    date: '2026-10-17T11:45:00.000Z',
    productName: 'Royal Heritage Saafa & Kalangi',
    sku: 'RNJ-ACC-007',
    change: -1,
    balance: 14,
    type: 'SALE',
    reference: 'Invoice #RNJ-2026-0001',
    actor: 'Admin'
  },
  {
    id: 'mov-3',
    date: '2026-10-15T09:00:00.000Z',
    productName: 'Royal Rajputi Bridal Poshak',
    sku: 'RNJ-BRD-004',
    change: +3,
    balance: 4,
    type: 'PURCHASE',
    reference: 'Workshop Delivery Batch #44',
    actor: 'Inventory Staff'
  }
];
