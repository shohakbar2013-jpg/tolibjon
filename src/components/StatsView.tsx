import React from 'react';
import { motion } from 'motion/react';
import { Task, Category, Language } from '../types';
import { translations } from '../translations';
import LucideIcon from './LucideIcon';

interface StatsViewProps {
  tasks: Task[];
  categories: Category[];
  language: Language;
  cardClass: string;
}

export default function StatsView({ tasks, categories, language, cardClass }: StatsViewProps) {
  const t = translations[language];

  // Logic calculation
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Streak logic calculations (how many consecutive days with at least one task completed)
  const getStreakCount = () => {
    const completedDates = Array.from(
      new Set(
        tasks
          .filter((t) => t.completed)
          .map((t) => t.date)
      )
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending (newest first)

    if (completedDates.length === 0) return 0;

    let streak = 0;
    let today = new Date();
    today.setHours(0,0,0,0);
    
    let checkDate = new Date(today);
    let checkStr = checkDate.toISOString().split('T')[0];

    // check if completed today or yesterday to continue streak
    let currentIdx = completedDates.indexOf(checkStr);
    
    if (currentIdx === -1) {
      // check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
      currentIdx = completedDates.indexOf(checkStr);
    }

    if (currentIdx === -1) return 0; // Streak broken

    // Count backwards sequentially
    let expectedDate = new Date(completedDates[currentIdx]);
    streak = 1;

    for (let i = currentIdx + 1; i < completedDates.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      
      if (completedDates[i] === expectedStr) {
        streak++;
      } else {
        break; // streak ended
      }
    }

    return streak;
  };

  const streakDays = getStreakCount();

  // Category distribution calculation
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((task) => task.category === cat.id);
    const catTotal = catTasks.length;
    const catCompleted = catTasks.filter((t) => t.completed).length;
    const catRate = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
    
    return {
      category: cat,
      total: catTotal,
      completed: catCompleted,
      rate: catRate
    };
  }).filter(stat => stat.total > 0); // show only dynamic categories having tasks

  // Weekly Completion History (Mon - Sun of current week)
  const getWeeklyCompletedCounts = () => {
    const daysArr = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    
    // get Monday of current week
    const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    return daysArr.map((dayLabel, idx) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + idx);
      const dStr = targetDate.toISOString().split('T')[0];

      const dailyTasks = tasks.filter(task => task.date === dStr);
      const dailyDone = dailyTasks.filter(task => task.completed).length;
      
      return {
        label: dayLabel,
        total: dailyTasks.length,
        completed: dailyDone,
        date: dStr
      };
    });
  };

  const weeklyData = getWeeklyCompletedCounts();
  const maxWeeklyTaskCount = Math.max(...weeklyData.map(d => d.total), 4); // default minimum scaling limit of 4 tasks

  // SVG parameters for the sleek main doughnut
  const circumference = 2 * Math.PI * 38; // radius 38
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Top Banner Progress Ring */}
      <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 ${cardClass}`}>
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-display text-slate-100">{t.stats}</h2>
          <p className="text-xs text-slate-400">
            {t.total_tasks}: <span className="font-bold text-slate-200">{total}</span>
          </p>
          <div className="flex gap-2.5 pt-1">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded-full font-bold">
              ✓ {completed} {t.complete}
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 py-0.5 px-2 rounded-full font-bold">
              ↻ {pending} {t.pending}
            </span>
          </div>
        </div>

        {/* Big Doughnut Canvas */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="48"
              cy="48"
              r="38"
              className="stroke-slate-800"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Animated Complete ring */}
            <motion.circle
              cx="48"
              cy="48"
              r="38"
              className="stroke-amber-500"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-lg font-bold font-display text-slate-100">{rate}%</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{t.complete}</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak details */}
        <motion.div
          className={`p-4 rounded-2xl ${cardClass} flex flex-col justify-between`}
          whileHover={{ y: -2 }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.streaks}</span>
            <LucideIcon name="TrendingUp" className="text-orange-500" size={16} />
          </div>
          <div>
            <div className="text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
              {streakDays}
            </div>
            <p className="text-xs text-slate-450 font-semibold">{streakDays} {t.days}</p>
          </div>
        </motion.div>

        {/* Completion rate display */}
        <motion.div
          className={`p-4 rounded-2xl ${cardClass} flex flex-col justify-between`}
          whileHover={{ y: -2 }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.completion_rate}</span>
            <LucideIcon name="Award" className="text-yellow-500 animate-pulse" size={16} />
          </div>
          <div>
            <div className="text-3xl font-black font-display text-yellow-400">
              {rate}%
            </div>
            <p className="text-xs text-slate-450 font-semibold">{completed} / {total} {t.complete}</p>
          </div>
        </motion.div>
      </div>

      {/* Weekly Progress Bar Chart */}
      <div className={`p-4 rounded-2xl ${cardClass}`}>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <LucideIcon name="CalendarDays" className="text-amber-500" size={14} />
          {t.weekly_progress}
        </h3>
        
        {/* Visual Columns list */}
        <div className="flex items-end justify-between gap-1 h-32 pt-2">
          {weeklyData.map((d, index) => {
            const totalHeightPercentage = (d.total / maxWeeklyTaskCount) * 100;
            const completedHeightPercentage = d.total > 0 ? (d.completed / d.total) * totalHeightPercentage : 0;
            const isToday = d.date === new Date().toISOString().split('T')[0];

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full group">
                <div className="relative w-full flex-1 flex flex-col justify-end items-center px-1 rounded-sm">
                  {/* Tooltip on hovering Column */}
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-950 border border-slate-800 text-[9px] text-slate-200 px-1.5 py-0.5 rounded-sm shadow-md z-10 text-center">
                    {d.completed}/{d.total} Done
                  </div>

                  {/* Gray background track representing total tasks */}
                  <div 
                    className="w-2.5 md:w-3.5 bg-slate-800/80 rounded-t-sm relative flex flex-col justify-end overflow-hidden transition-all duration-500"
                    style={{ height: `${totalHeightPercentage || 4}%` }} // fallback minimum block line
                  >
                    {/* Inner color overlay for completed counts */}
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-500 ${isToday ? 'bg-amber-500' : 'bg-amber-400/85 group-hover:bg-amber-400'}`}
                      style={{ height: `${(d.completed / (d.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <span className={`text-[10px] font-bold ${isToday ? 'text-amber-500 font-black scale-105' : 'text-slate-400'}`}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories Breakdown progress section */}
      <div className={`p-4 rounded-2xl ${cardClass}`}>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
          <LucideIcon name="Briefcase" className="text-amber-500" size={14} />
          {t.by_category}
        </h3>

        {categoryStats.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2">Xatolar yo'q, hali vazifa qo'shilmagan</p>
        ) : (
          <div className="space-y-3.5">
            {categoryStats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: stat.category.color }} />
                    <LucideIcon name={stat.category.icon} size={12} color={stat.category.color} />
                    {stat.category.name[language] || stat.category.name.uz}
                  </span>
                  <span className="text-slate-400 text-[10px] font-bold">
                    {stat.completed} / {stat.total} ({stat.rate}%)
                  </span>
                </div>
                {/* Visual Progress Bar Track */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: stat.category.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.rate}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
