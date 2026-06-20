import React from 'react';
import { motion } from 'motion/react';
import { UserSettings, Theme, Language } from '../types';
import { THEMES } from '../constants';
import { translations } from '../translations';
import LucideIcon from './LucideIcon';
import { playAppSound, requestNotificationPermission, triggerBrowserNotification } from '../utils';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onResetAllData: () => void;
  cardClass: string;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  onResetAllData,
  cardClass
}: SettingsViewProps) {
  const t = translations[settings.language];

  // Language selectors
  const languagesList: Array<{ code: Language; name: string; flag: string }> = [
    { code: 'uz', name: "O'zbekcha", flag: "🇺🇿" },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];

  const handleLanguageChange = (code: Language) => {
    playAppSound('click');
    onUpdateSettings({ language: code });
    triggerToast(code === 'uz' ? "Til muvaffaqiyatli o'zgartirildi!" : code === 'ru' ? "Язык успешно изменен!" : "Language updated successfully!");
  };

  const handleThemeChange = (themeId: string) => {
    playAppSound('click');
    onUpdateSettings({ themeId });
  };

  const handleNotificationPermissionToggle = async (checked: boolean) => {
    playAppSound('click');
    if (checked) {
      const allowed = await requestNotificationPermission();
      onUpdateSettings({ notificationsEnabled: allowed });
      if (allowed) {
        triggerBrowserNotification(t.test_sent || "Notification Enabled!", {
          body: "Kundalik task planner notifications are ready!"
        });
      }
    } else {
      onUpdateSettings({ notificationsEnabled: false });
    }
  };

  const triggerTestPush = () => {
    playAppSound('alarm');
    triggerBrowserNotification(t.test_sent, {
      body: "Bu eslatmalar va bildirishnomalarni tekshirish xabari!"
    });
    alert(t.test_sent);
  };

  const triggerToast = (msg: string) => {
    // Simple custom alert
    console.log(msg);
  };

  return (
    <div className="space-y-4">
      {/* Language Section */}
      <div className={`p-4 rounded-2xl ${cardClass} space-y-3`}>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
          <LucideIcon name="Globe" className="text-amber-500" size={14} />
          {t.language}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {languagesList.map((langItem) => {
            const isSelected = settings.language === langItem.code;
            return (
              <button
                key={langItem.code}
                onClick={() => handleLanguageChange(langItem.code)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 scale-[1.03] shadow-inner shadow-amber-500/5'
                    : 'bg-slate-900 border-slate-800 text-slate-350 hover:border-slate-705'
                }`}
              >
                <span className="text-xl leading-none">{langItem.flag}</span>
                <span>{langItem.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Management Box */}
      <div className={`p-4 rounded-2xl ${cardClass} space-y-4`}>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
          <LucideIcon name="Bell" className="text-amber-500" size={14} />
          {t.notifications}
        </h3>

        <div className="space-y-3.5">
          {/* Push alert switch */}
          <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-slate-250 block">{t.enable_push}</span>
              <span className="text-[10px] text-slate-500">Ruxsat olish & sinash</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleNotificationPermissionToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-705 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Sound Alert effects */}
          <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-slate-255 block">{t.play_sound}</span>
              <span className="text-[10px] text-slate-500">Ilova tovush effekti (tick/alarm)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => { playAppSound('click'); onUpdateSettings({ soundEnabled: e.target.checked }); }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-705 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Test Push alert button */}
          {settings.notificationsEnabled && (
            <button
              onClick={triggerTestPush}
              className="w-full text-center text-xs py-2 bg-slate-800 hover:bg-slate-750 text-amber-400 font-semibold rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
            >
              🚀 {t.notification_test}
            </button>
          )}
        </div>
      </div>

      {/* Customizable Background Theme Selection */}
      <div className={`p-4 rounded-2xl ${cardClass} space-y-3`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <LucideIcon name="Sun" className="text-amber-500" size={14} />
            {t.theme}
          </h3>
          {/* Quick Dark Mode override */}
          <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 cursor-pointer">
            <LucideIcon name={settings.isDarkMode ? 'Moon' : 'Sun'} size={11} className={settings.isDarkMode ? 'text-indigo-400' : 'text-amber-500'} />
            <input
              type="checkbox"
              checked={settings.isDarkMode}
              onChange={(e) => { playAppSound('click'); onUpdateSettings({ isDarkMode: e.target.checked }); }}
              className="sr-only"
            />
            <span className={settings.isDarkMode ? 'text-amber-400' : 'text-slate-500'}>
              {settings.isDarkMode ? 'Dark' : 'Light'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {THEMES.map((th) => {
            const isSelected = settings.themeId === th.id;
            return (
              <button
                key={th.id}
                onClick={() => handleThemeChange(th.id)}
                className={`p-3 rounded-xl text-left border relative overflow-hidden transition-all flex flex-col justify-between h-20 ${
                  isSelected
                    ? 'border-amber-500 scale-[1.02] shadow-lg shadow-amber-500/5'
                    : 'border-slate-800 hover:border-slate-700/80'
                } ${th.class}`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-[11px] font-bold tracking-tight">
                    {th.name[settings.language] || th.name.uz}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <LucideIcon name="Check" size={10} className="stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Micro preview card design rendering inside container */}
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 opacity-90" />
                  <span className="w-2 h-2 rounded-full bg-amber-400 opacity-90" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-90" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 opacity-90" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Data warns */}
      <div className={`p-4 rounded-2xl ${cardClass} border border-rose-500/10`}>
        <h4 className="text-xs font-bold text-rose-450 mb-1 flex items-center gap-1">
          <LucideIcon name="Info" className="text-rose-500" size={14} />
          {t.reset_data}
        </h4>
        <p className="text-[10px] text-slate-450 leading-relaxed mb-3">
          {t.reset_warning}
        </p>
        <button
          onClick={() => { playAppSound('delete'); onResetAllData(); }}
          className="w-full text-center text-xs py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer font-bold"
          id="danger-reset-all-data-btn"
        >
          {t.delete} (Reset All Applet Data)
        </button>
      </div>
    </div>
  );
}
