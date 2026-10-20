import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mail, 
  CheckCircle, 
  Trash2, 
  User, 
  Clock, 
  Filter, 
  Phone, 
  MessageCircle, 
  Send, 
  CornerDownRight, 
  CheckCheck,
  X,
  ExternalLink
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import toast from 'react-hot-toast';

const Contacts = () => {
  const { contacts, markContactAsRead, markContactAsReplied, deleteContact, stats } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unread', 'read', 'unreplied', 'replied'
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const getContactId = (c) => c._id || c.id;

  const unreadCount = contacts.filter(c => !c.read).length;
  const unrepliedCount = contacts.filter(c => !c.replied).length;
  const repliedCount = contacts.filter(c => c.replied).length;

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (statusFilter === 'unread') matchesFilter = !contact.read;
    else if (statusFilter === 'read') matchesFilter = Boolean(contact.read);
    else if (statusFilter === 'unreplied') matchesFilter = !contact.replied;
    else if (statusFilter === 'replied') matchesFilter = Boolean(contact.replied);

    return matchesSearch && matchesFilter;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    // Unread and unreplied first, then by date
    if (a.read !== b.read) return a.read ? 1 : -1;
    if (a.replied !== b.replied) return a.replied ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleView = (contact) => {
    const id = getContactId(contact);
    if (!contact.read) {
      markContactAsRead(id, true);
    }
    setViewingContact(contact);
    setReplyText(contact.replyNotes || '');
  };

  const handleToggleRead = async (contact, e) => {
    if (e) e.stopPropagation();
    const id = getContactId(contact);
    const newRead = !contact.read;
    const res = await markContactAsRead(id, newRead);
    if (res.success) {
      toast.success(newRead ? 'Marked as read' : 'Marked as unread');
      if (viewingContact && getContactId(viewingContact) === id) {
        setViewingContact(prev => ({ ...prev, read: newRead }));
      }
    } else {
      toast.error('Failed to update status: ' + res.message);
    }
  };

  const handleMarkReplied = async (contact) => {
    const id = getContactId(contact);
    setIsSubmittingReply(true);
    const res = await markContactAsReplied(id, replyText);
    setIsSubmittingReply(false);
    if (res.success) {
      toast.success('Inquiry marked as replied and saved to MongoDB Atlas');
      if (viewingContact && getContactId(viewingContact) === id) {
        setViewingContact(prev => ({ 
          ...prev, 
          replied: true, 
          read: true, 
          replyNotes: replyText, 
          repliedAt: new Date().toISOString() 
        }));
      }
    } else {
      toast.error('Failed to record reply: ' + res.message);
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteContact(id);
    if (res.success) {
      toast.success('Inquiry removed from database');
      if (viewingContact && getContactId(viewingContact) === id) {
        setViewingContact(null);
      }
    } else {
      toast.error('Failed to delete inquiry: ' + res.message);
    }
    setDeleteConfirm(null);
  };

  const cleanPhoneForWhatsApp = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Customer Inquiries</h1>
          <p className="text-cream/50 font-body">Read, respond to, and manage customer messages from the contact form</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold font-body text-sm font-medium">{unreadCount} Unread</span>
          </div>
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <span className="text-amber-400 font-body text-sm font-medium">{unrepliedCount} Awaiting Reply</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gold/10 pb-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-body text-sm transition-all flex items-center gap-2 ${
            statusFilter === 'all'
              ? 'bg-gold/20 text-gold border border-gold/40'
              : 'text-cream/60 hover:text-cream hover:bg-cream/5'
          }`}
        >
          <span>All Messages</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cream/10 text-cream/70">
            {contacts.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('unread')}
          className={`px-4 py-2 rounded-lg font-body text-sm transition-all flex items-center gap-2 ${
            statusFilter === 'unread'
              ? 'bg-gold/20 text-gold border border-gold/40'
              : 'text-cream/60 hover:text-cream hover:bg-cream/5'
          }`}
        >
          <Clock size={14} className="text-gold" />
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gold text-night">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('unreplied')}
          className={`px-4 py-2 rounded-lg font-body text-sm transition-all flex items-center gap-2 ${
            statusFilter === 'unreplied'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-cream/60 hover:text-cream hover:bg-cream/5'
          }`}
        >
          <CornerDownRight size={14} className="text-amber-400" />
          <span>Awaiting Response</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cream/10 text-cream/70">
            {unrepliedCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('replied')}
          className={`px-4 py-2 rounded-lg font-body text-sm transition-all flex items-center gap-2 ${
            statusFilter === 'replied'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-cream/60 hover:text-cream hover:bg-cream/5'
          }`}
        >
          <CheckCheck size={14} className="text-emerald-400" />
          <span>Replied</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cream/10 text-cream/70">
            {repliedCount}
          </span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
        <input
          type="text"
          placeholder="Search inquiries by patron name, email, phone, subject or message text..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors"
        />
      </div>

      {sortedContacts.length === 0 ? (
        <div className="text-center py-16 bg-cream/5 border border-gold/10 rounded-xl">
          <Mail className="mx-auto text-gold/30 mb-4" size={48} />
          <p className="text-cream/70 font-body text-lg">No messages found</p>
          <p className="text-cream/40 font-body text-sm mt-1">Customer inquiries submitted through the contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedContacts.map((contact, index) => {
            const id = getContactId(contact);
            const isUnread = !contact.read;
            const isReplied = contact.replied;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => handleView(contact)}
                className={`border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-gold/40 relative ${
                  isUnread
                    ? 'border-gold/30 bg-gold/5 shadow-md shadow-amber-950/20'
                    : 'border-gold/10 bg-cream/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnread 
                        ? 'bg-gold/20 text-gold border-gold/40' 
                        : 'bg-cream/10 text-cream/50 border-gold/10'
                    }`}>
                      <User size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-body font-semibold text-cream text-base">{contact.name}</h3>
                        {isUnread && (
                          <span className="w-2.5 h-2.5 bg-gold rounded-full" title="Unread inquiry" />
                        )}
                        {contact.phone && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-cream/5 text-gold/80 border border-gold/20">
                            <Phone size={10} />
                            {contact.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-cream/60 text-sm font-body">{contact.email}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right">
                    <span className="text-cream/50 text-xs font-body">
                      {new Date(contact.createdAt).toLocaleDateString()} at {new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {isReplied ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCheck size={12} /> Replied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock size={12} /> Awaiting Reply
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gold/10">
                  <h4 className="font-body font-medium text-cream/90 text-sm mb-1 flex items-center gap-2">
                    <span className="text-gold/60 font-serif">Re:</span>
                    <span>{contact.subject || 'General Inquiry'}</span>
                  </h4>
                  <p className="text-cream/70 text-sm font-body line-clamp-2 leading-relaxed">
                    {contact.message}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-body text-cream/40">
                    <button
                      onClick={(e) => handleToggleRead(contact, e)}
                      className="hover:text-gold transition-colors underline"
                    >
                      {contact.read ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                    <span>•</span>
                    <span className="text-gold/80 hover:text-gold transition-colors">
                      Click to view full message & reply
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(contact);
                      }}
                      className="p-2 text-cream/40 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View & Respond Modal */}
      {viewingContact && (
        <div className="fixed inset-0 bg-night/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-night border border-gold/30 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl shadow-gold/10"
          >
            <div className="p-6 border-b border-gold/20 flex items-center justify-between sticky top-0 bg-night/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center text-gold">
                  <Mail size={20} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-cream">Patron Inquiry</h2>
                  <p className="text-xs text-cream/50 font-body">Received via Ranaji website contact form</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingContact(null)} 
                className="text-cream/50 hover:text-cream transition-colors p-1"
              >
                <X size={22} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patron Info Card */}
              <div className="bg-cream/5 border border-gold/10 rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-body font-semibold text-cream text-lg">{viewingContact.name}</h3>
                    <p className="text-cream/70 text-sm font-body">{viewingContact.email}</p>
                    {viewingContact.phone && (
                      <p className="text-gold text-sm font-body mt-0.5 flex items-center gap-1">
                        <Phone size={13} /> {viewingContact.phone}
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-cream/40 text-xs font-body">Received Date</p>
                    <p className="text-cream font-body text-sm">
                      {new Date(viewingContact.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-1.5 flex sm:justify-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${
                        viewingContact.read 
                          ? 'bg-cream/10 text-cream/70' 
                          : 'bg-gold/20 text-gold'
                      }`}>
                        {viewingContact.read ? 'Read' : 'Unread'}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${
                        viewingContact.replied 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {viewingContact.replied ? 'Replied' : 'Pending Reply'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Chips */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gold/10">
                  <a
                    href={`mailto:${viewingContact.email}?subject=Re: ${encodeURIComponent(viewingContact.subject || 'Your Inquiry to Ranaji')}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold text-xs font-body rounded-lg border border-gold/20 transition-colors"
                  >
                    <Mail size={13} />
                    Open in Mail Client
                    <ExternalLink size={11} />
                  </a>

                  {viewingContact.phone && (
                    <>
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(viewingContact.phone)}?text=${encodeURIComponent(`Hello ${viewingContact.name}, thank you for contacting Ranaji Royal Wedding Showroom.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-body rounded-lg border border-emerald-500/30 transition-colors"
                      >
                        <MessageCircle size={13} />
                        Chat on WhatsApp
                        <ExternalLink size={11} />
                      </a>
                      <a
                        href={`tel:${viewingContact.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cream/10 hover:bg-cream/20 text-cream text-xs font-body rounded-lg transition-colors"
                      >
                        <Phone size={13} />
                        Call Patron
                      </a>
                    </>
                  )}
                </div>
              </div>
              
              {/* Message Subject & Content */}
              <div>
                <p className="text-cream/40 text-xs font-body uppercase tracking-wider mb-1.5">Subject</p>
                <div className="p-3 bg-night/50 rounded-lg border border-gold/15">
                  <h4 className="font-body font-medium text-cream">{viewingContact.subject || 'General Inquiry'}</h4>
                </div>
              </div>
              
              <div>
                <p className="text-cream/40 text-xs font-body uppercase tracking-wider mb-1.5">Inquiry Message</p>
                <div className="p-4 bg-night/70 rounded-xl border border-gold/20">
                  <p className="text-cream/90 font-body text-sm whitespace-pre-wrap leading-relaxed">{viewingContact.message}</p>
                </div>
              </div>

              {/* Response Section */}
              <div className="p-5 bg-gold/5 border border-gold/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base text-cream flex items-center gap-2">
                    <Send size={16} className="text-gold" />
                    Record Showroom Response
                  </h4>
                  {viewingContact.replied && (
                    <span className="text-xs text-emerald-400 font-body flex items-center gap-1">
                      <CheckCheck size={14} /> Response Recorded
                    </span>
                  )}
                </div>
                <p className="text-cream/50 text-xs font-body">
                  Log your showroom response notes (e.g. details sent via email, lookbook shared, or phone call agreement). This will update status in MongoDB Atlas.
                </p>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 bg-night/80 border border-gold/25 rounded-lg text-cream placeholder-cream/30 text-sm focus:border-gold focus:outline-none transition-colors resize-none"
                  placeholder="e.g., Contacted patron via email with wedding sherwani rental catalog and availability for Dec 2026..."
                />
                <div className="flex justify-end gap-3 pt-1">
                  <button
                    disabled={isSubmittingReply}
                    onClick={() => handleMarkReplied(viewingContact)}
                    className="px-5 py-2.5 bg-gold text-night font-body text-sm font-semibold rounded-lg hover:bg-copper transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCheck size={16} />
                    {isSubmittingReply ? 'Saving...' : viewingContact.replied ? 'Update Response Notes' : 'Mark as Replied & Save'}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gold/10">
                <button
                  onClick={() => handleToggleRead(viewingContact)}
                  className="text-xs font-body text-cream/50 hover:text-gold transition-colors"
                >
                  {viewingContact.read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
                <button
                  onClick={() => setViewingContact(null)}
                  className="px-6 py-2.5 border border-gold/30 text-cream rounded-lg hover:bg-cream/5 transition-colors font-body text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-night border border-crimson/30 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl text-cream mb-2">Delete Inquiry?</h3>
            <p className="text-cream/50 font-body mb-6">
              Are you sure you want to permanently delete this message from <span className="text-cream font-medium">{deleteConfirm.name}</span>? This will remove it from MongoDB Atlas.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border border-gold/30 text-cream rounded-lg hover:bg-cream/5 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(getContactId(deleteConfirm))}
                className="flex-1 px-6 py-3 bg-crimson text-cream rounded-lg hover:bg-crimson/80 transition-colors font-body font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
