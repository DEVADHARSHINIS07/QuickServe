import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, CheckCircle2, Save, Bell, ShieldCheck } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';

export const AdminScheduleSettings: React.FC = () => {
  const { canteenConfig, updateCanteenConfig } = useCanteen();

  const [canteenName, setCanteenName] = useState(canteenConfig.canteenName);
  const [collegeName, setCollegeName] = useState(canteenConfig.collegeName);
  const [openingTime, setOpeningTime] = useState(canteenConfig.openingTime);
  const [closingTime, setClosingTime] = useState(canteenConfig.closingTime);
  const [upiId, setUpiId] = useState(canteenConfig.upiId);
  const [noticeMessage, setNoticeMessage] = useState(canteenConfig.noticeMessage || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCanteenConfig({
      canteenName,
      collegeName,
      openingTime,
      closingTime,
      upiId,
      noticeMessage
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-10">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="text-amber-500" size={26} /> Canteen Working Hours & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure daily operating hours, UPI payment parameters, and top announcement banner
        </p>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 size={18} /> Canteen settings saved successfully!
        </motion.div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
        {/* Operating Hours Box */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-amber-600">
            ⏰ Canteen Operating Hours
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen Opens At</label>
              <input
                type="time"
                value={openingTime}
                onChange={e => setOpeningTime(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl font-extrabold text-base"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen Closes At</label>
              <input
                type="time"
                value={closingTime}
                onChange={e => setClosingTime(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl font-extrabold text-base"
              />
            </div>
          </div>
        </div>

        {/* Canteen Identity Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-amber-600">
            🏫 Branding & UPI Payment Gateway
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen Name</label>
              <input
                type="text"
                value={canteenName}
                onChange={e => setCanteenName(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">College / Campus Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen Official UPI VPA ID</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Announcement Notice */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs">
          <label className="font-extrabold text-slate-900 dark:text-white block uppercase tracking-wider text-amber-600">
            📢 Campus Top Notice Banner
          </label>
          <input
            type="text"
            value={noticeMessage}
            onChange={e => setNoticeMessage(e.target.value)}
            placeholder="e.g. Freshly cooked lunch meals available from 12:00 PM!"
            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
        >
          <Save size={18} />
          <span>Save Configuration</span>
        </button>
      </form>
    </div>
  );
};
