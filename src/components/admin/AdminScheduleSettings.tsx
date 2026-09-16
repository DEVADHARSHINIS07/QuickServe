import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, Save, QrCode } from 'lucide-react';
import { useCanteen } from '../../context/CanteenContext';
import { buildUPIPaymentURI, generateQRSVGString } from '../../utils/qrCode';

export const AdminScheduleSettings: React.FC = () => {
  const { canteenConfig, updateCanteenConfig } = useCanteen();

  const [canteenName, setCanteenName] = useState(canteenConfig.canteenName);
  const [collegeName, setCollegeName] = useState(canteenConfig.collegeName);
  const [openingTime, setOpeningTime] = useState(canteenConfig.openingTime);
  const [closingTime, setClosingTime] = useState(canteenConfig.closingTime);
  const [upiId, setUpiId] = useState(canteenConfig.upiId);
  const [noticeMessage, setNoticeMessage] = useState(canteenConfig.noticeMessage || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const adminPreviewSvg = useMemo(() => {
    if (!upiId.trim()) return '';
    const uri = buildUPIPaymentURI({
      upiId: upiId.trim(),
      payeeName: canteenName || 'AAA College Canteen',
      amount: 10,
      note: 'Admin Test Scan'
    });
    return generateQRSVGString(uri, 1);
  }, [upiId, canteenName]);

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
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Clock className="text-slate-900 dark:text-white" size={24} /> Working Hours & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure daily operating hours, UPI payment parameters, and top announcement banner
        </p>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-500" /> Canteen settings saved successfully!
        </motion.div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Operating Hours Box */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Canteen Operating Hours
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen Opens At</label>
              <input
                type="time"
                value={openingTime}
                onChange={e => setOpeningTime(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-extrabold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen Closes At</label>
              <input
                type="time"
                value={closingTime}
                onChange={e => setClosingTime(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-extrabold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Canteen Identity Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Branding & UPI Payment Gateway
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen Name</label>
              <input
                type="text"
                value={canteenName}
                onChange={e => setCanteenName(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">College / Campus Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>

            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen Official UPI VPA ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. canteen.aaacet@okaxis"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              {/* Live Scannable Original QR Code Preview for Admin Verification */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-xs shrink-0 flex items-center justify-center border border-slate-200">
                  {adminPreviewSvg ? (
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: adminPreviewSvg }}
                    />
                  ) : (
                    <QrCode size={36} className="text-slate-300" />
                  )}
                </div>
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Live Original QR Preview
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Scan with PhonePe, GPay, or Paytm to verify canteen receiving account
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Target VPA: {upiId || 'Not configured'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Notice */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="font-bold text-slate-500 block uppercase tracking-wider">
            Campus Top Notice Banner
          </label>
          <input
            type="text"
            value={noticeMessage}
            onChange={e => setNoticeMessage(e.target.value)}
            placeholder="e.g. Freshly cooked lunch meals available from 12:00 PM!"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
        >
          <Save size={18} />
          <span>Save Configuration</span>
        </button>
      </form>
    </div>
  );
};
