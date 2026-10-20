import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  PlusCircle,
  FileCheck,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';
import { approvalsAPI } from '../../services/api';

const ACTION_LABELS = {
  LARGE_DISCOUNT: 'Excessive Discount Override',
  INVOICE_REFUND: 'Showroom Invoice Refund / Return',
  STOCK_WRITE_OFF: 'Stock Damage / Shrinkage Write-off',
  INVOICE_CANCELLATION: 'Invoice Void / Cancellation'
};

const Approvals = () => {
  const { adminUser, canApprove } = useAdmin();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');

  // Request modal for staff
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({
    action: 'LARGE_DISCOUNT',
    reason: '',
    detailsText: ''
  });

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await approvalsAPI.getAll();
      if (res.success) {
        setRequests(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED' || r.status === 'EXECUTED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  const handleOpenReview = (request, action) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    setIsReviewModalOpen(true);
  };

  const handleProcessReview = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      let res;
      if (reviewAction === 'APPROVE') {
        res = await approvalsAPI.approve(selectedRequest._id || selectedRequest.id, reviewNotes);
        if (res.success) {
          toast.success(`Request approved! Code: ${res.data?.approvalCode}`);
        }
      } else {
        res = await approvalsAPI.reject(selectedRequest._id || selectedRequest.id, reviewNotes);
        if (res.success) {
          toast.success('Request rejected.');
        }
      }

      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      fetchApprovals();
    } catch (err) {
      toast.error(err.message || 'Failed to process approval request');
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      let parsedDetails = {};
      try {
        parsedDetails = newRequestForm.detailsText ? JSON.parse(newRequestForm.detailsText) : { note: newRequestForm.reason };
      } catch {
        parsedDetails = { rawDetails: newRequestForm.detailsText, note: newRequestForm.reason };
      }

      const res = await approvalsAPI.request({
        action: newRequestForm.action,
        reason: newRequestForm.reason,
        details: parsedDetails
      });

      if (res.success) {
        toast.success('Approval request submitted to showroom management.');
        setIsRequestModalOpen(false);
        setNewRequestForm({ action: 'LARGE_DISCOUNT', reason: '', detailsText: '' });
        fetchApprovals();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit request');
    }
  };

  const copyApprovalCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied authorization code: ${code}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-cream tracking-wide">High-Risk Approvals Center</h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                {pendingCount} Pending Action
              </span>
            )}
          </div>
          <p className="text-xs text-cream/50 font-body mt-1">
            Enforces dual-custody authorization for large discounts, customer refunds, and stock write-offs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 text-xs font-body transition-colors"
          >
            <PlusCircle size={15} />
            <span>Submit Request</span>
          </button>
          <button
            onClick={fetchApprovals}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cream/5 text-cream/70 hover:bg-cream/10 text-xs font-mono transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-night border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400 font-semibold font-body">Pending Manager Review</div>
            <div className="font-display text-2xl text-cream font-bold mt-1">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-night border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-semibold font-body">Authorized / Completed</div>
            <div className="font-display text-2xl text-cream font-bold mt-1">{approvedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-night border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-red-400 font-semibold font-body">Rejected Requests</div>
            <div className="font-display text-2xl text-cream font-bold mt-1">{rejectedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-gold/20 pb-2 overflow-x-auto text-xs font-body">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'EXECUTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === st
                ? 'bg-gold text-night font-bold'
                : 'text-cream/60 hover:text-cream hover:bg-cream/5'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-cream/40 bg-night border border-gold/20 rounded-2xl">
            <RefreshCw className="animate-spin inline-block mr-2" size={16} />
            Loading approval workflows...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-cream/40 bg-night border border-gold/20 rounded-2xl">
            No approval records found for this filter.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isExecuted = req.status === 'EXECUTED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req._id || req.id}
                className="bg-night border border-gold/20 rounded-2xl p-5 hover:border-gold/40 transition-all shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-cream text-base">
                        {ACTION_LABELS[req.action] || req.action}
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Clock size={10} /> Pending Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Authorized
                        </span>
                      )}
                      {isExecuted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                          <FileCheck size={10} /> Executed
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <XCircle size={10} /> Rejected
                        </span>
                      )}
                    </div>

                    {/* Requester & Timestamp */}
                    <div className="text-xs text-cream/60 flex flex-wrap items-center gap-x-4 gap-y-1 font-body">
                      <span>
                        Requested by:{' '}
                        <span className="font-semibold text-cream">
                          {req.requestedBy?.name || 'Staff'} ({req.requestedBy?.role || 'cashier'})
                        </span>
                      </span>
                      <span>&bull;</span>
                      <span>
                        {new Date(req.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Action Details */}
                    <div className="p-3 rounded-xl bg-cream/5 border border-gold/10 text-xs font-mono space-y-1">
                      <div className="text-cream/90">
                        <span className="text-gold font-bold">Details:</span> {JSON.stringify(req.details)}
                      </div>
                      {req.reason && (
                        <div className="text-cream/70 font-sans italic">
                          <span className="text-cream/50 not-italic font-bold">Reason:</span> &ldquo;{req.reason}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Approval Code display */}
                    {(isApproved || isExecuted) && req.approvalCode && (
                      <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                        <span className="text-xs text-emerald-400 font-semibold font-body">Authorization Code:</span>
                        <code className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
                          {req.approvalCode}
                        </code>
                        <button
                          onClick={() => copyApprovalCode(req.approvalCode)}
                          className="text-emerald-400 hover:text-emerald-200"
                          title="Copy Code"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions for Manager/Owner */}
                  {isPending && canApprove && (
                    <div className="flex sm:flex-col lg:flex-row items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenReview(req, 'APPROVE')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-night font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        <CheckCircle2 size={14} />
                        <span>Authorize</span>
                      </button>
                      <button
                        onClick={() => handleOpenReview(req, 'REJECT')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/40 font-bold rounded-xl text-xs hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Authorize or Reject Request */}
      <AnimatePresence>
        {isReviewModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-night border border-gold/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                <h3 className="font-display text-lg text-cream">
                  {reviewAction === 'APPROVE' ? 'Authorize High-Risk Request' : 'Reject Request'}
                </h3>
                <button onClick={() => setIsReviewModalOpen(false)} className="text-cream/50 hover:text-cream">&times;</button>
              </div>

              <form onSubmit={handleProcessReview} className="space-y-4 text-xs font-body">
                <div className="p-3 rounded-xl bg-cream/5 border border-gold/10 space-y-1">
                  <div className="font-bold text-gold">{ACTION_LABELS[selectedRequest.action]}</div>
                  <div className="text-cream/70">Requester: {selectedRequest.requestedBy?.name}</div>
                  <div className="text-cream/70 font-mono text-[11px]">{JSON.stringify(selectedRequest.details)}</div>
                </div>

                <div>
                  <label className="text-cream/70 block mb-1">Manager Review Notes</label>
                  <input
                    type="text"
                    required
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="e.g. Verified with patron / Approved as per festival policy"
                    className="w-full bg-night border border-gold/20 rounded-xl px-3 py-2 text-cream outline-none focus:border-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gold/10">
                  <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 text-cream/70">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 font-bold rounded-xl transition-all ${
                      reviewAction === 'APPROVE'
                        ? 'bg-emerald-500 text-night hover:bg-emerald-400'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    Confirm {reviewAction === 'APPROVE' ? 'Authorization' : 'Rejection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Submit New Approval Request (Staff) */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-night border border-gold/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                <h3 className="font-display text-lg text-cream">Submit Approval Request</h3>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-cream/50 hover:text-cream">&times;</button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-3 text-xs font-body">
                <div>
                  <label className="text-cream/70 block mb-1">High-Risk Operation</label>
                  <select
                    value={newRequestForm.action}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, action: e.target.value })}
                    className="w-full bg-night border border-gold/20 rounded-xl px-3 py-2 text-cream focus:border-gold outline-none"
                  >
                    <option value="LARGE_DISCOUNT">Large Discount Override</option>
                    <option value="INVOICE_REFUND">Customer Invoice Refund</option>
                    <option value="STOCK_WRITE_OFF">Stock Damage / Write-off</option>
                  </select>
                </div>

                <div>
                  <label className="text-cream/70 block mb-1">Operation Details (JSON or Key-Value)</label>
                  <textarea
                    rows={3}
                    required
                    value={newRequestForm.detailsText}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, detailsText: e.target.value })}
                    placeholder='e.g. {"percent": 20, "amount": 4000, "customer": "VIP Patron"}'
                    className="w-full bg-night border border-gold/20 rounded-xl px-3 py-2 text-cream font-mono outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-cream/70 block mb-1">Justification Reason</label>
                  <input
                    type="text"
                    required
                    value={newRequestForm.reason}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, reason: e.target.value })}
                    placeholder="e.g. Bulk wedding wardrobe purchase discount approved verbally"
                    className="w-full bg-night border border-gold/20 rounded-xl px-3 py-2 text-cream outline-none focus:border-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gold/10">
                  <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-cream/70">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-gold text-night font-bold rounded-xl hover:brightness-110">
                    Submit to Manager
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Approvals;
