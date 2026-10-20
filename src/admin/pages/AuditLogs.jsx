import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Filter, 
  RefreshCw, 
  Lock, 
  AlertTriangle, 
  Info, 
  AlertOctagon, 
  Terminal,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';
import { auditLogsAPI } from '../../services/api';

const SEVERITY_BADGES = {
  INFO: {
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: Info
  },
  WARNING: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: AlertTriangle
  },
  CRITICAL: {
    bg: 'bg-red-500/10 text-red-400 border-red-500/30',
    icon: AlertOctagon
  }
};

const AuditLogs = () => {
  const { canViewAuditLogs } = useAdmin();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditLogsAPI.getAll();
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch audit log trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      log.action?.toLowerCase().includes(q) ||
      log.actor?.name?.toLowerCase().includes(q) ||
      log.actor?.email?.toLowerCase().includes(q) ||
      log.target?.label?.toLowerCase().includes(q);

    return matchSeverity && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-cream tracking-wide">Immutable Security Audit Trail</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30 flex items-center gap-1">
              <Lock size={10} /> Tamper-Proof
            </span>
          </div>
          <p className="text-xs text-cream/50 font-body mt-1">
            Permanent forensic log of showroom staff operations, invoice refunds, discounts, and inventory write-offs
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 text-xs font-mono transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Security Notice Banner */}
      <div className="bg-night border border-gold/30 rounded-2xl p-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
          <Shield size={20} />
        </div>
        <div className="text-xs font-body text-cream/80">
          <span className="font-bold text-gold">Cryptographically Immutability Policy:</span> All logged events are appended directly to the database with write-once permissions. Any attempt by staff, cashiers, or managers to modify, truncate, or delete audit records is blocked at both ORM and API gateway levels.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-night border border-gold/20 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by staff name, email, action type, or target..."
            className="w-full bg-night/80 border border-gold/20 rounded-xl pl-9 pr-4 py-2 text-xs text-cream outline-none focus:border-gold transition-colors font-body"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-body">
          <span className="text-cream/50 text-[11px] uppercase tracking-wider font-semibold">Severity:</span>
          {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                severityFilter === sev
                  ? 'bg-gold text-night'
                  : 'text-cream/60 hover:text-cream hover:bg-cream/5'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-night border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-cream/5 text-gold border-b border-gold/20 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold text-center">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Staff Actor</th>
                <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                <th className="py-3.5 px-4 font-semibold">Operation Details</th>
                <th className="py-3.5 px-4 font-semibold text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-cream/40">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                    Querying immutable audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-cream/40">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badgeInfo = SEVERITY_BADGES[log.severity] || SEVERITY_BADGES.INFO;
                  const Icon = badgeInfo.icon;
                  const dateStr = new Date(log.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log._id} className="hover:bg-gold/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-cream/70 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeInfo.bg}`}>
                          <Icon size={10} />
                          {log.severity}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-gold text-xs">
                        {log.action}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-cream text-xs">
                          {log.actor?.name || 'System / Anonymous'}
                        </div>
                        <div className="text-[10px] text-cream/50 font-mono">
                          {log.actor?.email} &bull; <span className="uppercase text-gold/80">{log.actor?.role}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-cream font-semibold text-xs">{log.target?.label || log.target?.entity}</div>
                        <div className="text-[10px] text-cream/40 font-mono">{log.target?.entity} #{log.target?.entityId?.slice(-6)}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-[11px] font-mono text-cream/80 truncate bg-cream/5 p-1.5 rounded border border-gold/10" title={JSON.stringify(log.details)}>
                          {JSON.stringify(log.details)}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-[11px] text-cream/50">
                        {log.ip || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
