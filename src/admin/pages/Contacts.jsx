import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, CheckCircle, Trash2, User, Clock, Filter, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const Contacts = () => {
  const { contacts, markContactAsRead, deleteContact, stats } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [readFilter, setReadFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRead = readFilter === 'all' || 
      (readFilter === 'read' && contact.read) || 
      (readFilter === 'unread' && !contact.read);
    return matchesSearch && matchesRead;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    // Unread first, then by date
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleView = (contact) => {
    if (!contact.read) {
      markContactAsRead(contact.id);
    }
    setViewingContact(contact);
  };

  const handleDelete = (id) => {
    deleteContact(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Messages</h1>
          <p className="text-cream/50 font-body">Manage contact form submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg">
            <span className="text-gold font-body text-sm">{stats.unreadContacts} Unread</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream placeholder-cream/30 focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
          <select
            value={readFilter}
            onChange={e => setReadFilter(e.target.value)}
            className="pl-12 pr-8 py-3 bg-cream/5 border border-gold/20 rounded-lg text-cream focus:border-gold focus:outline-none transition-colors appearance-none"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {sortedContacts.length === 0 ? (
        <div className="text-center py-16 bg-cream/5 border border-gold/10 rounded-xl">
          <Mail className="mx-auto text-gold/30 mb-4" size={48} />
          <p className="text-cream/50 font-body">No messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleView(contact)}
              className={`bg-cream/5 border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-gold/30 ${
                contact.read ? 'border-gold/10' : 'border-gold/30 bg-gold/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    contact.read ? 'bg-cream/10' : 'bg-gold/20'
                  }`}>
                    <User className={contact.read ? 'text-cream/50' : 'text-gold'} size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-body font-medium text-cream">{contact.name}</h3>
                      {!contact.read && (
                        <span className="w-2 h-2 bg-gold rounded-full" />
                      )}
                    </div>
                    <p className="text-cream/50 text-sm font-body">{contact.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-cream/40 text-sm font-body">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-cream/30 text-xs font-body">
                    {new Date(contact.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pl-13">
                <h4 className="font-body font-medium text-cream/80 mb-2">{contact.subject}</h4>
                <p className="text-cream/50 text-sm font-body line-clamp-2">{contact.message}</p>
              </div>
              
              <div className="mt-4 flex items-center justify-end gap-2">
                {contact.read ? (
                  <span className="flex items-center gap-1 text-cream/40 text-xs font-body">
                    <CheckCircle size={12} />
                    Read
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gold text-xs font-body">
                    <Clock size={12} />
                    Unread
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(contact);
                  }}
                  className="p-2 text-cream/50 hover:text-crimson hover:bg-crimson/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Message Modal */}
      {viewingContact && (
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-night border border-gold/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gold/20 flex items-center justify-between">
              <h2 className="font-display text-2xl text-cream">Message Details</h2>
              <button 
                onClick={() => setViewingContact(null)} 
                className="text-cream/50 hover:text-cream transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center">
                  <User className="text-gold" size={28} />
                </div>
                <div>
                  <h3 className="font-body font-medium text-cream text-lg">{viewingContact.name}</h3>
                  <p className="text-cream/50 font-body">{viewingContact.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-cream/5 rounded-xl">
                <div>
                  <p className="text-cream/40 text-xs font-body mb-1">Received</p>
                  <p className="text-cream font-body text-sm">
                    {new Date(viewingContact.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-cream/40 text-xs font-body mb-1">Status</p>
                  <p className="text-cream font-body text-sm flex items-center gap-2">
                    {viewingContact.read ? (
                      <><CheckCircle size={14} className="text-green-400" /> Read</>
                    ) : (
                      <><Clock size={14} className="text-gold" /> Unread</>
                    )}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-cream/40 text-xs font-body mb-2">Subject</p>
                <h4 className="font-body font-medium text-cream">{viewingContact.subject}</h4>
              </div>
              
              <div>
                <p className="text-cream/40 text-xs font-body mb-2">Message</p>
                <div className="p-4 bg-cream/5 rounded-xl border border-gold/10">
                  <p className="text-cream/80 font-body whitespace-pre-wrap">{viewingContact.message}</p>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <a
                  href={`mailto:${viewingContact.email}?subject=Re: ${viewingContact.subject}`}
                  className="flex-1 px-6 py-3 bg-gold text-night rounded-lg hover:bg-copper transition-colors font-body font-medium text-center"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => setViewingContact(null)}
                  className="flex-1 px-6 py-3 border border-gold/30 text-cream rounded-lg hover:bg-cream/5 transition-colors font-body"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-night border border-crimson/30 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl text-cream mb-2">Delete Message?</h3>
            <p className="text-cream/50 font-body mb-6">
              Are you sure you want to delete this message from {deleteConfirm.name}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border border-gold/30 text-cream rounded-lg hover:bg-cream/5 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
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
