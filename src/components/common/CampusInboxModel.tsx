import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Inbox, CheckCircle2, KeyRound, Copy, Check, Clock, Sparkles, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

interface CampusInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail?: string;
}

export const CampusInboxModal: React.FC<CampusInboxModalProps> = ({ isOpen, onClose, targetEmail }) => {
  const { getSentEmails, currentUser } = useCanteen();
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeEmailFilter = targetEmail || (currentUser?.email !== 'guest@aaacet.ac.in' ? currentUser?.email : undefined);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const data = await getSentEmails(activeEmailFilter);
      setEmails(data || []);
      if (data && data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch {
      // offline safe
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen, activeEmailFilter]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] max-h-[700px]"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100">
                <Inbox size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold">Campus Mail Delivery Viewer</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {activeEmailFilter ? `Inbox for ${activeEmailFilter}` : 'Official AAACET Canteen Communications'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchEmails}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Refresh Emails"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body with Sidebar and Email View */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* List */}
            <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-2 space-y-1.5">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Mail size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">No emails yet</p>
                  <p className="mt-1">Messages sent to your college email (Welcome emails, OTP codes) will appear here instantly.</p>
                </div>
              ) : (
                emails.map(em => {
                  const isSelected = selectedEmail?.id === em.id;
                  const isWelcome = em.type === 'welcome';
                  const isReset = em.type === 'password_reset';

                  return (
                    <button
                      key={em.id}
                      onClick={() => setSelectedEmail(em)}
                      className={`w-full text-left p-3 rounded-2xl transition border ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs'
                          : 'bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                            isWelcome
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : isReset
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          }`}
                        >
                          {isWelcome && <Sparkles size={10} />}
                          {isReset && <KeyRound size={10} />}
                          {!isWelcome && !isReset && <ShieldCheck size={10} />}
                          {em.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(em.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {em.subject}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        To: {em.to}
                      </p>

                      {em.code && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-[11px] font-mono font-bold rounded-md">
                          <span>Code: {em.code}</span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Email Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900">
              {selectedEmail ? (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {selectedEmail.subject}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span><strong>From:</strong> QuickServe Campus Mail (canteen@aaacet.ac.in)</span>
                          <span>•</span>
                          <span><strong>To:</strong> {selectedEmail.to}</span>
                          <span>•</span>
                          <span>{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {selectedEmail.code && (
                        <button
                          onClick={() => handleCopy(selectedEmail.code)}
                          className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          {copiedCode === selectedEmail.code ? (
                            <>
                              <Check size={14} className="text-emerald-400 dark:text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* HTML preview card */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 p-2 sm:p-4">
                    <div
                      className="text-sm bg-white dark:bg-slate-900 rounded-xl p-4 overflow-x-auto text-slate-800 dark:text-slate-200"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8 text-slate-400">
                  <p className="text-xs">Select an email on the left to read its contents.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
