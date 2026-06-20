import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Category, Language } from '../types';
import { translations } from '../translations';
import LucideIcon from './LucideIcon';
import { playAppSound, formatLocalizedDate } from '../utils';

interface TaskItemProps {
  key?: any;
  task: Task;
  category?: Category;
  language: Language;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateSubtasks?: (taskId: string, subtasks: Array<{ id: string; title: string; completed: boolean }>) => void;
}

export default function TaskItem({
  task,
  category,
  language,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateSubtasks
}: TaskItemProps) {
  const t = translations[language];
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState('');

  // Safeguard subtasks array
  const subtasks = task.subtasks || [];

  // Match priority colors
  const priorityInfo = {
    high: { bg: 'bg-red-500/10 border-red-500/30 text-red-400', label: t.high },
    medium: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: t.medium },
    low: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', label: t.low }
  };

  const priorityColor = priorityInfo[task.priority] || priorityInfo.medium;

  // Render Category colors
  const catColor = category ? category.color : '#64748b';
  const catIcon = category ? category.icon : 'ListTodo';

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);
  };

  // Add a subtask
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTitle.trim() || !onUpdateSubtasks) return;

    playAppSound('click');
    const newSub = {
      id: 'sub_' + Date.now(),
      title: newSubTitle.trim(),
      completed: false
    };

    onUpdateSubtasks(task.id, [...subtasks, newSub]);
    setNewSubTitle('');
  };

  // Toggle subtask status
  const handleToggleSubtask = (subId: string) => {
    if (!onUpdateSubtasks) return;
    playAppSound('complete');
    
    const updated = subtasks.map(s => 
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    onUpdateSubtasks(task.id, updated);
  };

  // Delete subtask
  const handleDeleteSubtask = (subId: string) => {
    if (!onUpdateSubtasks) return;
    playAppSound('delete');
    
    const updated = subtasks.filter(s => s.id !== subId);
    onUpdateSubtasks(task.id, updated);
  };

  // Check if task date is today
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.date < todayStr;
  const isToday = task.date === todayStr;

  return (
    <motion.div
      layout
      className={`rounded-2xl border transition-all overflow-hidden ${
        task.completed
          ? 'bg-slate-900/40 border-slate-800/60 dark:bg-slate-950/20'
          : 'bg-slate-900 border-slate-800/80 hover:border-slate-700 hover:shadow-md'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer flex items-center justify-between gap-3 select-none"
      >
        {/* Left Check Circle */}
        <button
          onClick={handleCheckboxClick}
          className="relative flex items-center justify-center w-6 h-6 rounded-full shrink-0 border-2 transition-all focus:outline-hidden"
          style={{ borderColor: task.completed ? '#10b981' : '#475569' }}
          id={`check-task-${task.id}`}
        >
          {task.completed && (
            <motion.div
              className="absolute inset-0.5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <LucideIcon name="Check" size={12} className="stroke-[3]" />
            </motion.div>
          )}
        </button>

        {/* Core details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {/* Category badge */}
            <span 
              className="flex items-center gap-1 text-[10px] uppercase font-bold py-0.5 px-2 rounded-full shrink-0"
              style={{ backgroundColor: `${catColor}15`, color: catColor }}
            >
              <LucideIcon name={catIcon} size={10} />
              {category ? category.name[language] || category.name.uz : 'Task'}
            </span>

            {/* Priority Pll */}
            <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${priorityColor.bg}`}>
              {priorityColor.label}
            </span>

            {/* Date Tag */}
            <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? 'text-red-400 font-bold' : isToday ? 'text-amber-400' : 'text-slate-400'}`}>
              <LucideIcon name="Calendar" size={9} />
              {isToday ? t.today : formatLocalizedDate(task.date, language, translations)}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>

          <h3 
            className={`font-semibold text-sm transition-all truncate text-slate-100 ${
              task.completed ? 'line-through text-slate-500 opacity-60' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className={`text-xs mt-1 text-slate-400 truncate ${task.completed ? 'opacity-40' : ''}`}>
              {task.description}
            </p>
          )}

          {/* Alarm / Reminder Indicator */}
          {task.reminderEnabled && task.reminderTime && (
            <div className="flex items-center gap-1 text-[10px] mt-1.5 text-amber-500/85">
              <LucideIcon name="Clock" size={10} className="animate-spin-slow" />
              <span>{task.reminderTime.split('T')[1]}</span>
            </div>
          )}
        </div>

        {/* Right side actions and chevron */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { playAppSound('click'); onEdit(task); }}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            id={`edit-task-btn-${task.id}`}
          >
            <LucideIcon name="Edit" size={14} />
          </button>
          
          <button
            onClick={() => { playAppSound('delete'); onDelete(task.id); }}
            className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            id={`delete-task-btn-${task.id}`}
          >
            <LucideIcon name="Trash" size={14} />
          </button>

          <div className="ml-1 text-slate-400">
            <LucideIcon name={isExpanded ? 'ChevronRight' : 'ChevronRight'} size={16} className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

      {/* Subtasks and Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800/80 bg-slate-950/30 px-4 py-3"
          >
            {/* Description Extended if cropped */}
            {task.description && (
              <div className="mb-3">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  {t.task_desc}
                </span>
                <p className="text-xs text-slate-350 bg-slate-900/60 p-2 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Subtasks list title */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {t.subtasks} ({subtasks.filter(s => s.completed).length}/{subtasks.length})
              </span>
            </div>

            {/* List of subtasks */}
            <div className="space-y-1.5 mb-3">
              {subtasks.map((sub) => (
                <div 
                  key={sub.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/35 border border-slate-800/40 text-xs"
                >
                  <div 
                    onClick={() => handleToggleSubtask(sub.id)}
                    className="flex-1 flex items-center gap-2 cursor-pointer select-none"
                  >
                    <span className="shrink-0">
                      <LucideIcon 
                        name={sub.completed ? 'CheckCircle' : 'Circle'} 
                        size={13} 
                        className={sub.completed ? 'text-emerald-400' : 'text-slate-500'} 
                      />
                    </span>
                    <span className={`truncate ${sub.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {sub.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-slate-500 hover:text-slate-300 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <LucideIcon name="X" size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask Form inline */}
            {onUpdateSubtasks && (
              <form onSubmit={handleAddSubtask} className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={newSubTitle}
                  onChange={(e) => setNewSubTitle(e.target.value)}
                  placeholder={t.subtask_title}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-505 focus:outline-hidden focus:border-amber-500/60 transition-colors"
                  id={`subtask-title-input-${task.id}`}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-0.5"
                  id={`add-subtask-btn-${task.id}`}
                >
                  <LucideIcon name="Plus" size={12} />
                  {t.add}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
