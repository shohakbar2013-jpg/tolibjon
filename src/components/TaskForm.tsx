import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Category, Priority, Language } from '../types';
import { DEFAULT_CATEGORIES, THEMES, CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { translations } from '../translations';
import LucideIcon from './LucideIcon';
import { playAppSound } from '../utils';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  taskToEdit?: Task | null;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  language: Language;
  cardClass: string;
}

export default function TaskForm({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  categories,
  onAddCategory,
  language,
  cardClass
}: TaskFormProps) {
  const t = translations[language];

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  // Category and Priority options
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState(CATEGORY_ICONS[0]);

  // Handle Form reset/edit trigger
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category || (categories[0]?.id || ''));
      setPriority(taskToEdit.priority || 'medium');
      setDate(taskToEdit.date);
      setReminderEnabled(taskToEdit.reminderEnabled || false);
      setReminderTime(taskToEdit.reminderTime ? taskToEdit.reminderTime.split('T')[1] || '' : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.id || 'personal');
      setPriority('medium');
      // Set default target date to today
      const todayString = new Date().toISOString().split('T')[0];
      setDate(todayString);
      setReminderEnabled(false);
      // Default reminder time to now + 1 hour (HH:MM)
      const nowPlusHour = new Date(Date.now() + 60 * 60 * 1000);
      const hrs = String(nowPlusHour.getHours()).padStart(2, '0');
      const mins = String(nowPlusHour.getMinutes()).padStart(2, '0');
      setReminderTime(`${hrs}:${mins}`);
    }
  }, [taskToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playAppSound('click');

    // Combine date and reminder HH:MM into a single string
    let fullReminderTime = '';
    if (reminderEnabled && reminderTime) {
      fullReminderTime = `${date}T${reminderTime}`;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      date,
      completed: taskToEdit ? taskToEdit.completed : false,
      reminderEnabled,
      reminderTime: reminderEnabled ? fullReminderTime : undefined,
      reminderTriggered: taskToEdit ? taskToEdit.reminderTriggered : false
    });
    
    onClose();
  };

  const handleCreateCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    playAppSound('complete');

    const created: Category = {
      id: 'cat_' + Date.now(),
      name: {
        uz: newCatName.trim(),
        en: newCatName.trim(),
        ru: newCatName.trim()
      },
      color: newCatColor,
      icon: newCatIcon
    };

    onAddCategory(created);
    setCategory(created.id);
    
    // reset creator state
    setNewCatName('');
    setShowCategoryCreator(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Form Card */}
      <motion.div
        className={`relative w-full max-w-md rounded-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto ${cardClass} shadow-2xl`}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <LucideIcon name={taskToEdit ? 'Edit' : 'Plus'} className="text-amber-500" />
            {taskToEdit ? t.edit_task : t.add_task}
          </h2>
          <button
            onClick={() => { playAppSound('click'); onClose(); }}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LucideIcon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">
              {t.task_title} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.task_title}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:border-amber-500 focus:outline-hidden transition-all placeholder:text-slate-500 text-sm"
              id="task-title-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">
              {t.task_desc}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.task_desc}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:border-amber-500 focus:outline-hidden transition-all placeholder:text-slate-500 text-sm resize-none"
              id="task-desc-input"
            />
          </div>

          {/* Category Dropdown and Selector */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.category}
              </label>
              {!showCategoryCreator && (
                <button
                  type="button"
                  onClick={() => { playAppSound('click'); setShowCategoryCreator(true); }}
                  className="text-xs text-amber-500 hover:text-amber-400 hover:underline flex items-center gap-0.5"
                  id="add-cat-btn"
                >
                  <LucideIcon name="Plus" size={12} /> {t.new_category}
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {showCategoryCreator ? (
                <motion.div
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-300">{t.new_category}</span>
                    <button
                      type="button"
                      onClick={() => setShowCategoryCreator(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <LucideIcon name="X" size={14} />
                    </button>
                  </div>
                  {/* Category Name */}
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder={t.category_name}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-100"
                    id="new-cat-name-input"
                  />
                  {/* Dynamic Color Dots */}
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{t.select_color}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORY_COLORS.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setNewCatColor(hex)}
                          className={`w-6 h-6 rounded-full transition-all border-2 ${
                            newCatColor === hex ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-85 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Icon Grid Selection */}
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{t.select_icon}</span>
                    <div className="grid grid-cols-7 gap-1">
                      {CATEGORY_ICONS.map((icName) => (
                        <button
                          key={icName}
                          type="button"
                          onClick={() => setNewCatIcon(icName)}
                          className={`p-1 rounded-sm flex items-center justify-center transition-colors ${
                            newCatIcon === icName ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <LucideIcon name={icName} size={15} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="w-full bg-amber-500 hover:bg-amber-600 font-semibold text-slate-950 font-display text-xs py-2 rounded-lg transition-colors mt-1"
                    id="save-new-cat-btn"
                  >
                    {t.add_category}
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto p-1 border border-slate-700/40 rounded-xl bg-slate-800/20">
                  {categories.map((catString) => {
                    const isSelected = category === catString.id;
                    return (
                      <button
                        key={catString.id}
                        type="button"
                        onClick={() => { playAppSound('click'); setCategory(catString.id); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all text-xs ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-medium'
                            : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: catString.color }} />
                        <LucideIcon name={catString.icon} size={13} className={isSelected ? 'text-amber-400' : 'text-slate-400'} />
                        <span className="truncate">
                          {catString.name[language] || catString.name.uz}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority Section */}
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">
                {t.priority}
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:border-amber-500 focus:outline-hidden transition-all text-sm appearance-none capitalize cursor-pointer text-slate-100"
                  id="task-priority-select"
                >
                  <option value="low" className="bg-slate-900 text-blue-400">{t.low}</option>
                  <option value="medium" className="bg-slate-900 text-amber-400">{t.medium}</option>
                  <option value="high" className="bg-slate-900 text-red-500">{t.high}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <LucideIcon name="ChevronsUpDown" size={14} />
                </div>
              </div>
            </div>

            {/* Date Section */}
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">
                {t.date}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 focus:border-amber-500 focus:outline-hidden transition-all text-sm text-slate-100"
                id="task-date-input"
              />
            </div>
          </div>

          {/* Reminders / Eslatmalar */}
          <div className="bg-slate-905 p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <LucideIcon name="BellRing" size={14} className={reminderEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-400'} />
                {t.enable_reminder}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => { playAppSound('click'); setReminderEnabled(e.target.checked); }}
                  className="sr-only peer"
                  id="reminder-enabled-toggle"
                />
                <div className="w-10 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div className="mt-3">
                <input
                  type="time"
                  required={reminderEnabled}
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100"
                  id="reminder-time-input"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {t.reminder_alert} 👉 {date} {reminderTime} ({t.reminder})
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { playAppSound('click'); onClose(); }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800/60 transition-colors text-sm font-semibold"
              id="cancel-task-form"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors text-sm font-bold font-display shadow-lg shadow-amber-500/10"
              id="submit-task-form"
            >
              {t.save}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
