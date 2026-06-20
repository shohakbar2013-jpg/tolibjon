import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Category, UserSettings, NotificationLog, Language, Priority } from './types';
import { DEFAULT_CATEGORIES, THEMES } from './constants';
import { translations } from './translations';
import LucideIcon from './components/LucideIcon';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import NotificationBell from './components/NotificationBell';
import { playAppSound, triggerBrowserNotification } from './utils';

export default function App() {
  // --- STATE PERSISTENCE ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('kundalik_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kundalik_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('kundalik_settings');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default setup
    return {
      language: 'uz',
      notificationsEnabled: false,
      soundEnabled: true,
      themeId: 'royal',
      isDarkMode: true
    };
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('kundalik_notifications_log');
    return saved ? JSON.parse(saved) : [];
  });

  // --- UI NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'stats' | 'settings'>('tasks');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // --- FILTERS & SEARCH STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // --- CRITICAL ALARM MODAL STATE ---
  const [triggeredAlarmTask, setTriggeredAlarmTask] = useState<Task | null>(null);

  // --- LOCALSTORAGE SYNCING ---
  useEffect(() => {
    localStorage.setItem('kundalik_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('kundalik_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kundalik_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('kundalik_notifications_log', JSON.stringify(notifications));
  }, [notifications]);

  // --- BACKGROUND REMINDER CHECKING SCHEDULER LOOP ---
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      const now = new Date();
      let stateChanged = false;

      const updatedTasks = tasks.map((task) => {
        // Only trigger for active tasks with reminders enabled that haven't triggered yet
        if (!task.completed && task.reminderEnabled && task.reminderTime && !task.reminderTriggered) {
          const remTime = new Date(task.reminderTime);
          if (now >= remTime) {
            // Trigger!
            stateChanged = true;
            
            // Play Bell Sound if sound is active
            if (settings.soundEnabled) {
              playAppSound('alarm');
            }

            // Fire standard browser push alert if permission is set
            if (settings.notificationsEnabled) {
              triggerBrowserNotification(`🔔 ${translations[settings.language].reminder_alert}`, {
                body: `${task.title} - ${translations[settings.language].reminder_triggered}`
              });
            }

            // Save in Notification Bell Log
            const logEntry: NotificationLog = {
              id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              taskId: task.id,
              taskTitle: task.title,
              time: Date.now(),
              read: false
            };
            setNotifications(prev => [logEntry, ...prev]);

            // Open popup warning
            setTriggeredAlarmTask(task);

            return { ...task, reminderTriggered: true };
          }
        }
        return task;
      });

      if (stateChanged) {
        setTasks(updatedTasks);
      }
    }, 4000); // Poll scan every 4 seconds

    return () => clearInterval(reminderInterval);
  }, [tasks, settings]);

  // --- QUICK STYLES & TRANSLATIONS MAP ---
  const currentTheme = THEMES.find(t => t.id === settings.themeId) || THEMES[2];
  const t = translations[settings.language];

  // Adjust card classes based on theme overrides and Dark Mode toggle
  const cardClassStyle = settings.isDarkMode
    ? currentTheme.cardClass
    : 'bg-white border border-slate-200/80 shadow-xs text-slate-800';

  // --- TASK CRUD OPERATIONS ---
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
    } else {
      // Create new
      const newTask: Task = {
        ...taskData,
        id: 'task_' + Date.now(),
        createdAt: Date.now()
      } as Task;
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleToggleComplete = (id: string) => {
    const targetTask = tasks.find(t => t.id === id);
    if (targetTask && !targetTask.completed) {
      if (settings.soundEnabled) {
        playAppSound('complete');
      }
    } else {
      if (settings.soundEnabled) {
        playAppSound('click');
      }
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleUpdateSubtasks = (taskId: string, subtasks: Array<{ id: string; title: string; completed: boolean }>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks } : t));
  };

  const handleDeleteTask = (id: string) => {
    if (settings.soundEnabled) {
      playAppSound('delete');
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleEditTrigger = (task: Task) => {
    playAppSound('click');
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleAddTaskTrigger = () => {
    playAppSound('click');
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleAddTaskOnDateTrigger = (date: string) => {
    playAppSound('click');
    setTaskToEdit({
      id: '',
      title: '',
      description: '',
      category: categories[0]?.id || 'personal',
      priority: 'medium',
      date,
      completed: false,
      reminderEnabled: false,
      createdAt: Date.now()
    });
    setIsFormOpen(true);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;

    if (settings.soundEnabled) {
      playAppSound('complete');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const created: Task = {
      id: 'task_' + Date.now(),
      title: quickAddTitle.trim(),
      description: '',
      category: categories[0]?.id || 'personal',
      priority: 'medium',
      date: todayStr,
      completed: false,
      reminderEnabled: false,
      createdAt: Date.now()
    };

    setTasks(prev => [created, ...prev]);
    setQuickAddTitle('');
  };

  // --- RESET ALL APPLET DATA ---
  const handleResetAllData = () => {
    const accept = window.confirm(t.reset_warning);
    if (accept) {
      localStorage.clear();
      setTasks([]);
      setCategories(DEFAULT_CATEGORIES);
      setSettings({
        language: 'uz',
        notificationsEnabled: false,
        soundEnabled: true,
        themeId: 'royal',
        isDarkMode: true
      });
      setNotifications([]);
      setActiveTab('tasks');
    }
  };

  // --- NOTIFICATION Triggers ---
  const handleMarkLogRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllLogs = () => {
    setNotifications([]);
  };

  // --- FILTER & SORT CALCULATION PROCESS ---
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCatFilter === 'all' || task.category === selectedCatFilter;
    const matchesPriority = selectedPriorityFilter === 'all' || task.priority === selectedPriorityFilter;
    return matchesSearch && matchesCat && matchesPriority;
  });

  // Sort logic based on user selection
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'status') {
      // Pending first, then completed
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
    }
    
    if (sortBy === 'priority') {
      // High -> Medium -> Low
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
    }

    // Default sorting / Tie-breaker is Date chronologically (upcoming first)
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-0 md:p-6 transition-all duration-500 bg-slate-900 ${currentTheme.class}`}>
      
      {/* 
        ELEGANT MOBILE DEVICE FRAME SIMULATOR FOR DESKTOP
        Centred, responsive container, fitting perfectly.
      */}
      <div 
        className="w-full md:max-w-md md:h-[840px] h-screen md:rounded-[40px] md:border-8 md:border-slate-800 bg-slate-950 flex flex-col overflow-hidden relative shadow-2xl transition-all"
        id="mobile-device-frame"
      >
        {/* Device Status Bar Decorator (desktop only) */}
        <div className="hidden md:flex justify-between items-center px-8 pt-3 pb-1 text-slate-500 text-[10px] select-none font-mono tracking-wider w-full shrink-0 border-b border-white/5 bg-slate-950">
          <span>09:41</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center text-[8px] text-slate-600 font-bold tracking-widest">
            KUNDALIK
          </div>
          <div className="flex items-center gap-1.5">
            <LucideIcon name="Volume2" size={10} />
            <span className="text-[9px]">5G</span>
            <div className="w-5 h-2.5 rounded-xs border border-slate-600 p-0.5 flex items-center">
              <div className="h-full w-[80%] bg-emerald-500 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Mobile App Header */}
        <header className="px-5 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/10">
              K
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight font-display text-slate-100 uppercase">
                Kundalik
              </h1>
              <span className="text-[10px] text-slate-400 font-bold block">Vazifalar Planner</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct notifications bell status */}
            <NotificationBell 
              notifications={notifications}
              onMarkAsRead={handleMarkLogRead}
              onClearAll={handleClearAllLogs}
              language={settings.language}
              cardClass={cardClassStyle}
            />

            {/* Quick help button triggers sample alert */}
            <button
              onClick={() => { playAppSound('click'); alert(`Kundalik v1.0.0 -\nKategoriyalar, ustuvorliklar, eslatmalar, kalendar va statistika bilan boyitilgan, foydalanuvchiga moslashuvchan o'zbek tilidagi mobil vazifalar boshqaruvchisi.`); }}
              className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-205 transition-colors"
              id="applet-info-trigger"
            >
              <LucideIcon name="InfoIcon" size={18} />
            </button>
          </div>
        </header>

        {/* --- MAIN PAGE CONTENT OUTLET GRID --- */}
        <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Search Bar & Stats header */}
                <div className="flex gap-2.5 items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={t.search}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-505 focus:outline-hidden focus:border-amber-500 transition-all"
                      id="search-input-box"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <LucideIcon name="Search" size={14} />
                    </div>
                  </div>

                  {/* Add task Trigger Floating style */}
                  <button
                    onClick={handleAddTaskTrigger}
                    className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer shrink-0"
                    id="trigger-add-task-modal"
                    title={t.add_task}
                  >
                    <LucideIcon name="Plus" size={18} className="stroke-[3]" />
                  </button>
                </div>

                {/* Quick Add inline Form */}
                <form onSubmit={handleQuickAddSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={quickAddTitle}
                    onChange={(e) => setQuickAddTitle(e.target.value)}
                    placeholder={t.quick_add}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-200 placeholder:text-slate-505 focus:outline-hidden focus:border-amber-500/50"
                    id="quick-add-input"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-amber-500 border border-slate-705 text-xs font-semibold rounded-xl transition-colors"
                  >
                    {t.add}
                  </button>
                </form>

                {/* Category filters list pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                  <button
                    onClick={() => { playAppSound('click'); setSelectedCatFilter('all'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedCatFilter === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {t.all}
                  </button>
                  {categories.map((catItem) => {
                    const isSelected = selectedCatFilter === catItem.id;
                    return (
                      <button
                        key={catItem.id}
                        onClick={() => { playAppSound('click'); setSelectedCatFilter(catItem.id); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 border border-transparent"
                        style={
                          isSelected
                            ? { backgroundColor: catItem.color, color: '#090a0f' }
                            : { backgroundColor: '#0f111a', color: '#94a3b8' }
                        }
                      >
                        <LucideIcon name={catItem.icon} size={11} />
                        {catItem.name[settings.language] || catItem.name.uz}
                      </button>
                    );
                  })}
                </div>

                {/* Sort selections and secondary filters panel */}
                <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-white/5 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[10px] uppercase tracking-wide">{t.sort_by}:</span>
                    <button
                      onClick={() => { playAppSound('click'); setSortBy('date'); }}
                      className={`font-semibold pb-0.5 border-b-2 text-[10px] uppercase tracking-widest ${sortBy === 'date' ? 'text-amber-400 border-amber-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                      {t.sort_date}
                    </button>
                    <button
                      onClick={() => { playAppSound('click'); setSortBy('priority'); }}
                      className={`font-semibold pb-0.5 border-b-2 text-[10px] uppercase tracking-widest ${sortBy === 'priority' ? 'text-amber-400 border-amber-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                      {t.sort_priority}
                    </button>
                    <button
                      onClick={() => { playAppSound('click'); setSortBy('status'); }}
                      className={`font-semibold pb-0.5 border-b-2 text-[10px] uppercase tracking-widest ${sortBy === 'status' ? 'text-amber-400 border-amber-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                      {t.sort_status}
                    </button>
                  </div>

                  {/* Priority selective filters */}
                  <select
                    value={selectedPriorityFilter}
                    onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                    className="bg-transparent border-none text-[10px] focus:outline-hidden font-bold uppercase tracking-wider text-slate-400 cursor-pointer capitalize"
                  >
                    <option value="all" className="bg-slate-900">{t.all} ({t.priority})</option>
                    <option value="high" className="bg-slate-900 text-red-400">{t.high}</option>
                    <option value="medium" className="bg-slate-900 text-amber-400">{t.medium}</option>
                    <option value="low" className="bg-slate-900 text-blue-400">{t.low}</option>
                  </select>
                </div>

                {/* Inner tasks checklist block */}
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {sortedTasks.length === 0 ? (
                      <motion.div
                        className={`text-center py-12 px-6 rounded-3xl ${cardClassStyle}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <LucideIcon name="Sparkles" className="mx-auto text-amber-500 mb-3 animate-bounce" size={32} />
                        <h4 className="font-bold text-slate-220 mb-1">{t.no_tasks}</h4>
                        <p className="text-xs text-slate-405 leading-relaxed">{t.create_first_task}</p>
                      </motion.div>
                    ) : (
                      sortedTasks.map((taskItem) => {
                        const matchedCat = categories.find(c => c.id === taskItem.category);
                        return (
                          <TaskItem
                            key={taskItem.id}
                            task={taskItem}
                            category={matchedCat}
                            language={settings.language}
                            onToggleComplete={handleToggleComplete}
                            onEdit={handleEditTrigger}
                            onDelete={handleDeleteTask}
                            onUpdateSubtasks={handleUpdateSubtasks}
                          />
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CalendarView
                  tasks={tasks}
                  categories={categories}
                  language={settings.language}
                  onAddTaskOnDate={handleAddTaskOnDateTrigger}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTrigger}
                  onDelete={handleDeleteTask}
                  cardClass={cardClassStyle}
                />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <StatsView
                  tasks={tasks}
                  categories={categories}
                  language={settings.language}
                  cardClass={cardClassStyle}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SettingsView
                  settings={settings}
                  onUpdateSettings={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
                  onResetAllData={handleResetAllData}
                  cardClass={cardClassStyle}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* --- DYNAMIC WARNING ALARM ALERTS POPUP MODAL --- */}
        <AnimatePresence>
          {triggeredAlarmTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setTriggeredAlarmTask(null)}
              />
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className={`relative w-full max-w-xs rounded-2xl p-6 text-center shadow-2xl overflow-hidden border border-amber-500/30 ${cardClassStyle}`}
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <LucideIcon name="BellRing" size={28} />
                </div>
                <h3 className="text-md font-bold font-display text-amber-400 capitalize mb-1">
                  {t.reminder_alert}
                </h3>
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">
                  {triggeredAlarmTask.reminderTime?.split('T')[1]} ({t.reminder})
                </p>
                <h2 className="text-base font-bold text-slate-105 mb-4 px-2 line-clamp-2 leading-snug">
                  {triggeredAlarmTask.title}
                </h2>
                {triggeredAlarmTask.description && (
                  <p className="text-xs text-slate-400 mb-5 italic line-clamp-3 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                    "{triggeredAlarmTask.description}"
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => { playAppSound('click'); handleToggleComplete(triggeredAlarmTask.id); setTriggeredAlarmTask(null); }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs py-2.5 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    ✓ {t.complete}
                  </button>
                  <button
                    onClick={() => { playAppSound('click'); setTriggeredAlarmTask(null); }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- BOTTOM MOBILE SELECTION TAB BAR --- */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950 border-t border-white/5 flex justify-around items-center px-4 shrink-0 z-10 select-none">
          {/* Tab 1: Tasks */}
          <button
            onClick={() => { playAppSound('click'); setActiveTab('tasks'); }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              activeTab === 'tasks' ? 'text-amber-405 font-bold' : 'text-slate-500 hover:text-slate-300 animate-hover'
            }`}
            id="nav-tab-tasks"
          >
            <LucideIcon name="ListTodo" size={20} className={activeTab === 'tasks' ? 'text-amber-500 scale-110 transition-all' : ''} />
            <span className="text-[10px] tracking-tight">{t.tasks_title.split(' ')[0]}</span>
          </button>

          {/* Tab 2: Calendar */}
          <button
            onClick={() => { playAppSound('click'); setActiveTab('calendar'); }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              activeTab === 'calendar' ? 'text-amber-405 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
            id="nav-tab-calendar"
          >
            <LucideIcon name="CalendarDays" size={20} className={activeTab === 'calendar' ? 'text-amber-500 scale-110 transition-all' : ''} />
            <span className="text-[10px] tracking-tight">{t.calendar}</span>
          </button>

          {/* Tab 3: Stats */}
          <button
            onClick={() => { playAppSound('click'); setActiveTab('stats'); }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              activeTab === 'stats' ? 'text-amber-405 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
            id="nav-tab-stats"
          >
            <LucideIcon name="TrendingUp" size={20} className={activeTab === 'stats' ? 'text-amber-500 scale-110 transition-all' : ''} />
            <span className="text-[10px] tracking-tight">{t.stats}</span>
          </button>

          {/* Tab 4: Settings */}
          <button
            onClick={() => { playAppSound('click'); setActiveTab('settings'); }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              activeTab === 'settings' ? 'text-amber-405 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
            id="nav-tab-settings"
          >
            <LucideIcon name="Settings" size={20} className={activeTab === 'settings' ? 'text-amber-500 scale-110 transition-all' : ''} />
            <span className="text-[10px] tracking-tight">{t.settings}</span>
          </button>
        </nav>
      </div>

      {/* --- FORM CREATOR DRAWER MODAL POPUP --- */}
      <AnimatePresence>
        {isFormOpen && (
          <TaskForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSaveTask}
            taskToEdit={taskToEdit}
            categories={categories}
            onAddCategory={(newCat) => setCategories(prev => [...prev, newCat])}
            language={settings.language}
            cardClass={cardClassStyle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
