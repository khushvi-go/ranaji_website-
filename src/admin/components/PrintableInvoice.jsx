import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, Download, Crown, CheckCircle2 } from 'lucide-react';
import { formatINR, numberToIndianWords } from '../../utils/billingCalculator';

const PrintableInvoice = ({ sale, isOpen, onClose }) => {
  const invoiceRef = useRef(null);

  if (!isOpen || !sale) return null;

  const {
    invoiceNumber,
    date,
    customer,
    items = [],
    calculation = {},
    payments = [],
    cashier = 'Admin',
    register = 'Counter 01'
  } = sale;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(date || Date.now()).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-night border border-gold/30 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header Action Bar (Hidden on print) */}
          <div className="flex items-center justify-between p-4 bg-crimson/20 border-b border-gold/20 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400" size={20} />
              <span className="text-cream font-display tracking-wider text-sm">
                Sale Persisted & Verified — Invoice #{invoiceNumber}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-gold to-copper text-night font-bold rounded-lg hover:brightness-110 shadow-lg text-sm transition-all"
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-cream/60 hover:text-cream hover:bg-cream/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div
            ref={invoiceRef}
            className="p-8 md:p-12 bg-white text-slate-800 font-serif print:p-0 print:m-0 print:w-full print:text-black"
            id="printable-tax-invoice"
          >
            {/* Showroom Header */}
            <div className="border-b-2 border-amber-800/30 pb-6 mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center md:text-left">
                  <div className="w-14 h-14 bg-amber-900 rounded-full flex items-center justify-center text-amber-300 shadow-md">
                    <Crown size={30} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-widest text-amber-950 font-serif uppercase">
                      RANAJI
                    </h1>
                    <p className="text-xs tracking-wider uppercase text-amber-800 font-sans font-semibold">
                      Royal Rajputi Couture & Wedding Showroom
                    </p>
                    <p className="text-xs text-slate-600 font-sans mt-0.5">
                      Palace Road, Near City Palace Enclave, Udaipur, Rajasthan — 313001
                    </p>
                    <p className="text-xs text-slate-500 font-sans">
                      Phone: +91 98290 12345 | Email: contact@ranaji.in | GSTIN: 08AAACR1234F1Z5
                    </p>
                  </div>
                </div>

                <div className="text-center md:text-right font-sans">
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider rounded border border-amber-300 mb-2">
                    Official Tax Invoice / Cash Memo
                  </span>
                  <div className="text-sm font-semibold text-slate-800">
                    Invoice No: <span className="font-mono text-amber-900">{invoiceNumber}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Date: {formattedDate}</div>
                  <div className="text-xs text-slate-500">Register: {register} | Cashier: {cashier}</div>
                </div>
              </div>
            </div>

            {/* Customer & Billing Info */}
            <div className="grid grid-cols-2 gap-6 pb-6 mb-6 border-b border-slate-200 font-sans text-xs">
              <div className="bg-amber-50/50 p-4 rounded border border-amber-200/50">
                <h3 className="font-bold text-amber-950 uppercase tracking-wider mb-2">
                  Billed To (Customer Details)
                </h3>
                <div className="text-sm font-bold text-slate-900 mb-1">
                  {customer?.name || 'Walk-in Showroom Guest'}
                </div>
                {customer?.phone && (
                  <div className="text-slate-600">Contact: {customer.phone}</div>
                )}
                {customer?.city && (
                  <div className="text-slate-600">Location: {customer.city}</div>
                )}
                {customer?.address && (
                  <div className="text-slate-500 mt-1">{customer.address}</div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-2 gap-y-1">
                    <span className="text-slate-500">Invoice Type:</span>
                    <span className="font-semibold text-slate-800">Showroom POS Counter</span>

                    <span className="text-slate-500">Payment Status:</span>
                    <span className={`font-bold uppercase ${
                      calculation.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {calculation.paymentStatus || 'PAID'}
                    </span>

                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-semibold text-slate-800">
                      {payments.map(p => p.method).join(', ') || 'Direct'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 font-sans">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-950 text-amber-100 uppercase tracking-wider border-b border-amber-900">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Product Description & SKU</th>
                    <th className="py-2.5 px-3 text-center">Size / Details</th>
                    <th className="py-2.5 px-3 text-center">Type</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Discount</th>
                    <th className="py-2.5 px-3 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/30">
                      <td className="py-3 px-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-serif text-sm">
                          {item.name}
                        </div>
                        {item.sku && (
                          <div className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</div>
                        )}
                        {item.color && (
                          <div className="text-[11px] text-amber-900">{item.color}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">
                        {item.size || 'Standard'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.mode === 'rent'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}>
                          {item.mode === 'rent' ? 'Rental' : 'Sale'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 font-mono">
                        {formatINR(item.unitPrice || item.price)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 font-mono">
                        {item.discountAmount > 0 ? `-${formatINR(item.discountAmount)}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                        {formatINR(item.netTotal || (item.unitPrice * item.quantity))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Taxes Breakdown */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-300 font-sans text-xs">
              <div>
                <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
                  <div className="text-slate-500 mb-1">Amount in Words:</div>
                  <div className="font-bold text-slate-900 italic font-serif">
                    {numberToIndianWords(calculation.grandTotal || 0)}
                  </div>
                </div>

                {payments.length > 0 && (
                  <div className="bg-amber-50/50 p-4 rounded border border-amber-200/60">
                    <div className="font-bold text-amber-950 uppercase tracking-wider mb-2">
                      Payment Settlement
                    </div>
                    {payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-slate-700">
                        <span>{p.method} Payment:</span>
                        <span className="font-bold font-mono">{formatINR(p.amount)}</span>
                      </div>
                    ))}
                    {calculation.changeDue > 0 && (
                      <div className="flex justify-between py-1 text-emerald-800 font-bold border-t border-amber-200 mt-1 pt-1">
                        <span>Change Returned:</span>
                        <span className="font-mono">{formatINR(calculation.changeDue)}</span>
                      </div>
                    )}
                    {calculation.balanceRemaining > 0 && (
                      <div className="flex justify-between py-1 text-crimson font-bold border-t border-amber-200 mt-1 pt-1">
                        <span>Balance Remaining:</span>
                        <span className="font-mono">{formatINR(calculation.balanceRemaining)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Numerical Calculations Column */}
              <div className="space-y-1.5 text-right font-sans">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Items Subtotal:</span>
                  <span className="font-mono">{formatINR(calculation.itemsGross || 0)}</span>
                </div>

                {calculation.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Total Discount Applied:</span>
                    <span className="font-mono">-{formatINR(calculation.totalDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-700 font-semibold border-t border-slate-200 pt-1">
                  <span>Taxable Base Value:</span>
                  <span className="font-mono">{formatINR(calculation.taxableAmount || 0)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>CGST ({((calculation.taxRate || 0.12) * 50).toFixed(1)}%):</span>
                  <span className="font-mono">{formatINR(calculation.cgst || 0)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>SGST ({((calculation.taxRate || 0.12) * 50).toFixed(1)}%):</span>
                  <span className="font-mono">{formatINR(calculation.sgst || 0)}</span>
                </div>

                {calculation.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Round Off:</span>
                    <span className="font-mono">
                      {calculation.roundOff > 0 ? `+₹${calculation.roundOff}` : `-₹${Math.abs(calculation.roundOff)}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center bg-amber-950 text-amber-200 p-3 rounded font-serif text-lg font-bold mt-2 shadow">
                  <span className="uppercase tracking-wider text-sm font-sans">Grand Total:</span>
                  <span className="text-xl font-mono text-amber-100">{formatINR(calculation.grandTotal || 0)}</span>
                </div>
              </div>
            </div>

            {/* Showroom Terms & Authorized Signatory */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 font-sans text-[10px] text-slate-500">
              <div className="col-span-2 space-y-1">
                <p className="font-bold text-slate-700 uppercase tracking-wider">Terms & Showroom Policy:</p>
                <p>1. Exchange allowed within 7 days from purchase with original bill & tags intact.</p>
                <p>2. No exchange or returns on custom-tailored or altered garments.</p>
                <p>3. Rental garments must be returned on the scheduled date in clean condition.</p>
                <p>4. All disputes subject to Udaipur jurisdiction only.</p>
              </div>

              <div className="text-center flex flex-col justify-end items-center">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <p className="font-bold text-slate-800 uppercase tracking-wider">For RANAJI COUTURE</p>
                <p className="text-[9px] text-slate-500">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrintableInvoice;
