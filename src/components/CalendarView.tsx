import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Category, Language } from '../types';
import { translations } from '../translations';
import LucideIcon from './LucideIcon';
import { playAppSound, exportToICS, formatLocalizedDate } from '../utils';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  language: Language;
  onAddTaskOnDate: (date: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  cardClass: string;
}

export default function CalendarView({
  tasks,
  categories,
  language,
  onAddTaskOnDate,
  onToggleComplete,
  onEdit,
  onDelete,
  cardClass
}: CalendarViewProps) {
  const t = translations[language];

  // Current calendar pivot date
  const [currentPivot, setCurrentPivot] = useState(new Date());
  // Selected day string (YYYY-MM-DD)
  const [selectedDayString, setSelectedDayString] = useState(new Date().toISOString().split('T')[0]);

  const year = currentPivot.getFullYear();
  const monthIdx = currentPivot.getMonth();

  // Month array name list
  const monthNames = [
    t['jan'], t['feb'], t['mar'], t['apr'], t['may'], t['jun'],
    t['jul'], t['aug'], t['sep'], t['oct'], t['nov'], t['dec']
  ];

  // Get days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    // Adjust to Monday-first: 0 (Sun), 1 (Mon), ..., 1 becomes 0, 0 becomes 6
    return day === 0 ? 6 : day - 1;
  };

  const totalDays = getDaysInMonth(year, monthIdx);
  const firstDayOffset = getFirstDayOfMonth(year, monthIdx);

  // Generate date entries
  const dayCells: Array<{ day: number; dateString: string; isCurrentMonth: boolean }> = [];

  // Previous month buffer padding
  const prevMonthIdx = monthIdx === 0 ? 11 : monthIdx - 1;
  const prevYear = monthIdx === 0 ? year - 1 : year;
  const prevMonthTotal = getDaysInMonth(prevYear, prevMonthIdx);

  for (let i = firstDayOffset - 1; i >= 0; i--) {
    const d = prevMonthTotal - i;
    const mStr = String(prevMonthIdx + 1).padStart(2, '0');
    dayCells.push({
      day: d,
      dateString: `${prevYear}-${mStr}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false
    });
  }

  // Current month days
  const currentMonthStr = String(monthIdx + 1).padStart(2, '0');
  for (let d = 1; d <= totalDays; d++) {
    dayCells.push({
      day: d,
      dateString: `${year}-${currentMonthStr}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: true
    });
  }

  // Next month buffer padding to round off the grid (6 weeks = 42 cells)
  const remainingCells = 42 - dayCells.length;
  const nextMonthIdx = monthIdx === 11 ? 0 : monthIdx + 1;
  const nextYear = monthIdx === 11 ? year + 1 : year;
  const nextMonthStr = String(nextMonthIdx + 1).padStart(2, '0');
  
  for (let d = 1; d <= remainingCells; d++) {
    dayCells.push({
      day: d,
      dateString: `${nextYear}-${nextMonthStr}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false
    });
  }

  // Navigation handlers
  const handlePrevMonth = () => {
    playAppSound('click');
    setCurrentPivot(new Date(year, monthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    playAppSound('click');
    setCurrentPivot(new Date(year, monthIdx + 1, 1));
  };

  const handleSelectDay = (dateString: string) => {
    playAppSound('click');
    setSelectedDayString(dateString);
  };

  // Find tasks matching specific date
  const getTasksForDate = (dateString: string) => {
    return tasks.filter(task => task.date === dateString);
  };

  // Export to External Calendar logic
  const handleExport = () => {
    playAppSound('complete');
    exportToICS(tasks);
  };

  // Localized weekdays
  const weekDays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  // Selected date tasks
  const selectedDayTasks = getTasksForDate(selectedDayString);

  return (
    <div className="space-y-4">
      {/* Top Controller */}
      <div className={`p-4 rounded-2xl ${cardClass}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-md font-bold font-display text-slate-100 flex items-center gap-2">
            <LucideIcon name="CalendarRange" className="text-amber-500 animate-pulse" />
            {monthNames[monthIdx]} {year}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 px-2 hover:bg-white/10 rounded-full transition-colors font-semibold"
            >
              <LucideIcon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={() => { playAppSound('click'); setCurrentPivot(new Date()); setSelectedDayString(new Date().toISOString().split('T')[0]); }}
              className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 py-1 px-2.5 rounded-full transition-colors tracking-wide font-medium"
            >
              Uzoq tush
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 px-2 hover:bg-white/10 rounded-full transition-colors font-semibold"
            >
              <LucideIcon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>

        {/* Week Days layout */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          {weekDays.map((day, idx) => (
            <div key={idx} className="py-1">{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 pb-2">
          {dayCells.map((cell, idx) => {
            const dayTasks = getTasksForDate(cell.dateString);
            const isSelected = cell.dateString === selectedDayString;
            const isStarredToday = cell.dateString === new Date().toISOString().split('T')[0];
            const hasTasks = dayTasks.length > 0;
            const incompleteTasksLength = dayTasks.filter(t => !t.completed).length;

            return (
              <div
                key={idx}
                onClick={() => handleSelectDay(cell.dateString)}
                className={`relative aspect-square flex flex-col items-center justify-between p-1 rounded-xl cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold scale-105 shadow-md shadow-amber-500/10'
                    : cell.isCurrentMonth
                    ? isStarredToday
                      ? 'bg-amber-500/10 border border-amber-500/40 text-amber-400 font-semibold'
                      : 'bg-slate-900 border border-slate-800/40 text-slate-200 hover:border-slate-700/80'
                    : 'bg-slate-950/40 text-slate-500 opacity-40 hover:opacity-70'
                }`}
              >
                <span className="text-[10px] leading-none text-left mb-1 self-start ml-1 mt-0.5">{cell.day}</span>

                {/* Priority dots indicating daily tasks */}
                {hasTasks && (
                  <div className="flex gap-0.5 justify-center flex-wrap pb-1.5 w-full max-w-[85%] mx-auto">
                    {dayTasks.slice(0, 4).map((taskItem) => {
                      let dotColor = 'bg-amber-400';
                      if (taskItem.completed) {
                        dotColor = 'bg-emerald-500';
                      } else if (taskItem.priority === 'high') {
                        dotColor = 'bg-red-500';
                      } else if (taskItem.priority === 'low') {
                        dotColor = 'bg-blue-400';
                      }
                      return (
                        <span 
                          key={taskItem.id} 
                          className={`w-1.5 h-1.5 rounded-full block shrink-0 ${dotColor} ${
                            isSelected ? 'bg-slate-950 border border-amber-500' : ''
                          }`} 
                        />
                      );
                    })}
                    {dayTasks.length > 4 && (
                      <span className={`text-[7px] leading-none ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>+</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          📅 {formatLocalizedDate(selectedDayString, language, translations)}
        </h3>
        
        <button
          onClick={() => { playAppSound('click'); onAddTaskOnDate(selectedDayString); }}
          className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 font-semibold cursor-pointer"
          id="calendar-add-on-date-btn"
        >
          <LucideIcon name="PlusCircle" size={14} />
          {t.add_task}
        </button>
      </div>

      {/* Tasks Agenda List */}
      <div className="space-y-2">
        {selectedDayTasks.length === 0 ? (
          <motion.div
            className={`p-6 rounded-2xl text-center text-slate-400 py-8 ${cardClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LucideIcon name="Sparkles" className="mx-auto text-slate-500 mb-2 animate-bounce-slow" size={24} />
            <p className="text-xs">{t.no_tasks}</p>
          </motion.div>
        ) : (
          selectedDayTasks.map(task => {
            const taskCategory = categories.find(c => c.id === task.category);
            const priorityBadge = task.priority === 'high' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : task.priority === 'medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-550/20';
            return (
              <motion.div
                key={task.id}
                layout
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  task.completed ? 'bg-slate-900/40 border-slate-800/60 opacity-70' : 'bg-slate-900 border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                <div className="flex-1 min-w-0 flex items-center gap-2.5">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`w-5 h-5 rounded-full shrink-0 border-2 flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-705'
                    }`}
                  >
                    {task.completed && <LucideIcon name="Check" size={10} className="stroke-[3]" />}
                  </button>
                  <div className="min-w-0">
                    <span 
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mr-1.5"
                      style={{ backgroundColor: `${taskCategory?.color || '#eeeeee'}20`, color: taskCategory?.color }}
                    >
                      {taskCategory ? taskCategory.name[language] || taskCategory.name.uz : 'Vazifa'}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${priorityBadge}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <h4 className={`text-xs font-semibold mt-1 truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(task)}
                    className="p-1 text-slate-400 hover:text-slate-200 transition-colors hover:bg-slate-800 rounded-lg"
                  >
                    <LucideIcon name="Edit" size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors hover:bg-rose-500/10 rounded-lg"
                  >
                    <LucideIcon name="Trash" size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* External Calendar Sync subscription info card */}
      <div className={`p-4 rounded-2xl ${cardClass} space-y-2`}>
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <LucideIcon name="Globe" className="text-amber-400" size={14} />
          {t.sync_calendar}
        </h4>
        <p className="text-[10.5px] leading-relaxed text-slate-400">
          {t.sync_desc}
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-semibold text-xs py-2 px-3.5 rounded-xl transition-all cursor-pointer inline-block"
          id="calendar-export-ics-btn"
        >
          <LucideIcon name="CalendarRange" size={13} />
          Export ICS File (.ics)
        </button>
      </div>
    </div>
  );
}
