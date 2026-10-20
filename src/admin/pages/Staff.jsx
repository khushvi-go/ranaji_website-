import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  UserPlus, 
  UserX, 
  UserCheck, 
  Key, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';
import { staffAPI } from '../../services/api';

const ROLE_COLORS = {
  owner: 'bg-gold/20 text-gold border-gold/30',
  admin: 'bg-gold/20 text-gold border-gold/30',
  manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cashier: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inventory: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
};

const Staff = () => {
  const { adminUser, isOwner, canManageStaff } = useAdmin();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // New staff form state
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
    employeeId: '',
    password: ''
  });

  const [newRole, setNewRole] = useState('cashier');
  const [deactivateReason, setDeactivateReason] = useState('Staff member resigned or access revoked');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await staffAPI.getAll();
      if (res.success) {
        setStaffList(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    try {
      const res = await staffAPI.create(newStaffForm);
      if (res.success) {
        toast.success(`Staff account for ${res.data.name} created successfully`);
        setIsAddModalOpen(false);
        setNewStaffForm({
          name: '',
          email: '',
          phone: '',
          role: 'cashier',
          employeeId: '',
          password: ''
        });
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create staff account');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      const res = await staffAPI.updateRole(selectedStaff.id || selectedStaff._id, newRole);
      if (res.success) {
        toast.success(`Role updated to ${newRole.toUpperCase()} for ${selectedStaff.name}`);
        setIsRoleModalOpen(false);
        setSelectedStaff(null);
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update staff role');
    }
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      const res = await staffAPI.deactivate(selectedStaff.id || selectedStaff._id, deactivateReason);
      if (res.success) {
        toast.success(`Account for ${selectedStaff.name} deactivated immediately`);
        setIsDeactivateModalOpen(false);
        setSelectedStaff(null);
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate account');
    }
  };

  const handleReactivate = async (staff) => {
    try {
      const res = await staffAPI.reactivate(staff.id || staff._id);
      if (res.success) {
        toast.success(`Account for ${staff.name} reactivated`);
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reactivate account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-cream tracking-wide">Staff & Identity Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30">
              RBAC Enforced
            </span>
          </div>
          <p className="text-xs text-cream/50 font-body mt-1">
            Individual credentials, role assignments, least-privilege policies, and instant session revocation
          </p>
        </div>

        {canManageStaff && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold to-copper text-night font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg font-body transition-all"
          >
            <UserPlus size={16} />
            <span>Add Staff Account</span>
          </button>
        )}
      </div>

      {/* Security Policies Info Box */}
      <div className="bg-night border border-gold/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0 mt-0.5">
            <Shield size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-cream">Showroom Security Hierarchy</div>
            <div className="text-xs text-cream/60 mt-0.5 space-x-2">
              <span className="text-gold font-bold">Owner:</span> Full authority & staff governance &bull;{' '}
              <span className="text-blue-400 font-bold">Manager:</span> Approvals & store audits &bull;{' '}
              <span className="text-emerald-400 font-bold">Cashier:</span> POS & checkout &bull;{' '}
              <span className="text-amber-400 font-bold">Inventory:</span> Catalog & stock control
            </div>
          </div>
        </div>
        <button
          onClick={fetchStaff}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 text-xs font-mono transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Staff List Table */}
      <div className="bg-night border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-cream/5 text-gold border-b border-gold/20 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                <th className="py-3.5 px-4 font-semibold">Employee ID</th>
                <th className="py-3.5 px-4 font-semibold text-center">Assigned Role</th>
                <th className="py-3.5 px-4 font-semibold text-center">Account Status</th>
                <th className="py-3.5 px-4 font-semibold">Last Active</th>
                <th className="py-3.5 px-4 font-semibold text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-cream/40">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                    Loading staff credentials...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-cream/40">
                    No staff records found.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const roleStyle = ROLE_COLORS[staff.role] || 'bg-cream/10 text-cream border-cream/20';
                  const isCurrentLoggedUser = adminUser?.email === staff.email;
                  const isActive = staff.isActive !== false;

                  return (
                    <tr key={staff.id || staff._id} className="hover:bg-gold/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-display font-bold text-cream text-sm flex items-center gap-2">
                          {staff.name}
                          {isCurrentLoggedUser && (
                            <span className="text-[10px] bg-gold text-night px-1.5 py-0.2 rounded font-bold">YOU</span>
                          )}
                        </div>
                        <div className="text-[11px] text-cream/50 font-mono mt-0.5">{staff.email}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-cream/70 font-semibold">
                        {staff.employeeId || 'RNJ-STAFF'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${roleStyle}`}>
                          {staff.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                            <AlertCircle size={10} /> Revoked
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-cream/60 text-[11px]">
                        {staff.lastLogin ? new Date(staff.lastLogin).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Never'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {canManageStaff ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedStaff(staff);
                                setNewRole(staff.role);
                                setIsRoleModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-xs font-body transition-colors inline-flex items-center gap-1"
                              title="Modify Role & Permissions"
                            >
                              <Edit2 size={12} />
                              <span>Role</span>
                            </button>

                            {isActive ? (
                              <button
                                onClick={() => {
                                  setSelectedStaff(staff);
                                  setIsDeactivateModalOpen(true);
                                }}
                                disabled={isCurrentLoggedUser}
                                className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-body transition-colors disabled:opacity-30 disabled:pointer-events-none inline-flex items-center gap-1"
                                title="Instantly Revoke Access"
                              >
                                <UserX size={12} />
                                <span>Revoke</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(staff)}
                                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-body transition-colors inline-flex items-center gap-1"
                                title="Reactivate Account"
                              >
                                <UserCheck size={12} />
                                <span>Reactivate</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-cream/30 text-[11px] italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Staff Member */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-night border border-gold/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-gold" size={20} />
                  <h3 className="font-display text-lg text-cream">Create Staff Account</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-cream/50 hover:text-cream text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-3 font-body text-xs">
                <div>
                  <label className="text-cream/70 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Singh"
                    className="w-full bg-night/80 border border-gold/20 rounded-xl px-3 py-2 text-cream focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="text-cream/70 block mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    placeholder="e.g. vikram@ranaji.com"
                    className="w-full bg-night/80 border border-gold/20 rounded-xl px-3 py-2 text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-cream/70 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={newStaffForm.phone}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                      placeholder="+91 98..."
                      className="w-full bg-night/80 border border-gold/20 rounded-xl px-3 py-2 text-cream focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-cream/70 block mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={newStaffForm.employeeId}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, employeeId: e.target.value })}
                      placeholder="RNJ-EMP-001"
                      className="w-full bg-night/80 border border-gold/20 rounded-xl px-3 py-2 text-cream focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-cream/70 block mb-1">Assigned Role</label>
                  <select
                    value={newStaffForm.role}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                    className="w-full bg-night border border-gold/20 rounded-xl px-3 py-2 text-cream focus:border-gold outline-none font-sans"
                  >
                    <option value="cashier">Cashier (Showroom POS & Invoices)</option>
                    <option value="inventory">Inventory Staff (Stock & Catalog)</option>
                    <option value="manager">Showroom Manager (Approvals & Oversight)</option>
                    <option value="owner">Showroom Owner (Full Administrative Authority)</option>
                  </select>
                </div>

                <div>
                  <label className="text-cream/70 block mb-1">Temporary Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newStaffForm.password}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full bg-night/80 border border-gold/20 rounded-xl px-3 py-2 text-cream focus:border-gold outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-gold/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-cream/70 hover:bg-cream/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-gold to-copper text-night font-bold uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Change Role */}
      <AnimatePresence>
        {isRoleModalOpen && selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-night border border-gold/30 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                <h3 className="font-display text-lg text-cream">Change Staff Role</h3>
                <button onClick={() => setIsRoleModalOpen(false)} className="text-cream/50 hover:text-cream">&times;</button>
              </div>

              <form onSubmit={handleUpdateRole} className="space-y-4 text-xs font-body">
                <div>
                  <p className="text-cream/70 mb-2">
                    Update operational privileges for <span className="font-bold text-cream">{selectedStaff.name}</span>:
                  </p>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-night border border-gold/20 rounded-xl px-3 py-2 text-cream focus:border-gold outline-none"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="inventory">Inventory Staff</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gold/10">
                  <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-cream/70">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-gold text-night font-bold rounded-xl">
                    Save Role
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Deactivate Account */}
      <AnimatePresence>
        {isDeactivateModalOpen && selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-night border border-red-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-2 text-red-400 border-b border-red-500/20 pb-3">
                <ShieldAlert size={20} />
                <h3 className="font-display text-lg text-cream">Revoke Staff Account</h3>
              </div>

              <form onSubmit={handleDeactivate} className="space-y-4 text-xs font-body">
                <p className="text-cream/80">
                  Are you sure you want to immediately revoke access for{' '}
                  <span className="font-bold text-cream">{selectedStaff.name}</span> ({selectedStaff.email})?
                </p>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]">
                  &bull; All active login sessions and JWT tokens will be invalidated immediately.<br/>
                  &bull; This staff member will be blocked from accessing POS, inventory, and customer records.
                </div>

                <div>
                  <label className="text-cream/70 block mb-1">Reason for Revocation (Logged in Audit Trail)</label>
                  <input
                    type="text"
                    required
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    className="w-full bg-night border border-gold/20 rounded-xl px-3 py-2 text-cream outline-none focus:border-red-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gold/10">
                  <button type="button" onClick={() => setIsDeactivateModalOpen(false)} className="px-4 py-2 text-cream/70">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600">
                    Confirm Revocation
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

export default Staff;
