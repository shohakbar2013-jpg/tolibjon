import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationLog, Language } from '../types';
import { translations } from '../translations';
import LucideIcon from './LucideIcon';
import { playAppSound } from '../utils';

interface NotificationBellProps {
  notifications: NotificationLog[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  language: Language;
  cardClass: string;
}

export default function NotificationBell({
  notifications,
  onMarkAsRead,
  onClearAll,
  language,
  cardClass
}: NotificationBellProps) {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggle = () => {
    playAppSound('click');
    setIsOpen(!isOpen);
  };

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playAppSound('click');
    onMarkAsRead(id);
  };

  const handleClear = () => {
    playAppSound('delete');
    onClearAll();
  };

  return (
    <div className="relative">
      {/* Floating Bell Icon top bar */}
      <button
        onClick={handleToggle}
        className="p-2 rounded-full relative bg-slate-9003 hover:bg-white/5 transition-all text-slate-300"
        id="notification-bell-trigger"
      >
        <LucideIcon 
          name={unreadCount > 0 ? "BellRing" : "Bell"} 
          size={20} 
          className={unreadCount > 0 ? "text-amber-500 animate-bounce-slow" : "text-slate-400"} 
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-slate-950 font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-1.5 border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating bell tray */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay background block to catch outer clicks */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-xl z-50 overflow-hidden ${cardClass} border border-slate-800`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">
                  🔔 {t.notifications} ({unreadCount})
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors uppercase font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* List of triggered alarms */}
              <div className="mt-2.5 max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-6">
                    {t.no_notifications_logged}
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all flex items-start gap-2 ${
                        notif.read
                          ? 'bg-slate-950/20 border-slate-900/60 opacity-60'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700/80 text-slate-100 font-medium'
                      }`}
                    >
                      <span className="mt-0.5">
                        <LucideIcon name="Clock" size={13} className={notif.read ? 'text-slate-550' : 'text-amber-500'} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={notif.read ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {notif.taskTitle}
                        </p>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          {new Date(notif.time).toLocaleTimeString(language, {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping self-center shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
