import { Category, Theme } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'work',
    name: {
      uz: 'Ish (Vazifalar)',
      en: 'Work Tasks',
      ru: 'Работа'
    },
    color: '#ff4757', // Coral Red
    icon: 'Briefcase'
  },
  {
    id: 'personal',
    name: {
      uz: 'Shaxsiy hayot',
      en: 'Personal Care',
      ru: 'Личное'
    },
    color: '#3498db', // Blue
    icon: 'User'
  },
  {
    id: 'study',
    name: {
      uz: 'O\'qish & Kurslar',
      en: 'Education',
      ru: 'Учеба'
    },
    color: '#9b59b6', // Amethyst Purple
    icon: 'BookOpen'
  },
  {
    id: 'health',
    name: {
      uz: 'Salomatlik & Sport',
      en: 'Health & Sport',
      ru: 'Здоровье и Спорт'
    },
    color: '#2ecc71', // Emerald Green
    icon: 'Activity'
  },
  {
    id: 'finance',
    name: {
      uz: 'Moliyaviy bozor',
      en: 'Finance & Shopping',
      ru: 'Финансы'
    },
    color: '#f1c40f', // Sun Yellow
    icon: 'DollarSign'
  }
];

export const THEMES: Theme[] = [
  {
    id: 'midnight',
    name: {
      uz: 'Tun bag\'ri',
      en: 'Midnight Velvet',
      ru: 'Полуночный бархат'
    },
    class: 'bg-slate-950 text-slate-100',
    textColor: 'text-slate-100',
    cardClass: 'bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-slate-100',
    dark: true
  },
  {
    id: 'sunset',
    name: {
      uz: 'Sharq Shaffofi',
      en: 'Sunset Aura',
      ru: 'Закатная Аура'
    },
    class: 'bg-gradient-to-tr from-amber-950 via-rose-950 to-slate-950 text-red-100',
    textColor: 'text-red-50',
    cardClass: 'bg-white/10 border border-white/10 backdrop-blur-lg text-white',
    dark: true
  },
  {
    id: 'royal',
    name: {
      uz: 'Qirollik ranglari',
      en: 'Royal Indigo',
      ru: 'Королевский Индиго'
    },
    class: 'bg-gradient-to-tr from-violet-950 via-indigo-950 to-slate-950 text-violet-100',
    textColor: 'text-violet-50',
    cardClass: 'bg-indigo-950/40 border border-indigo-900/40 backdrop-blur-md text-violet-100',
    dark: true
  },
  {
    id: 'nordic',
    name: {
      uz: 'Skandinav kulrang',
      en: 'Nordic Clean',
      ru: 'Скандинавский свет'
    },
    class: 'bg-slate-50 text-slate-800',
    textColor: 'text-slate-800',
    cardClass: 'bg-white border border-slate-200/80 shadow-sm text-slate-800',
    dark: false
  },
  {
    id: 'emerald',
    name: {
      uz: 'Zumrad vodiy',
      en: 'Emerald Zenith',
      ru: 'Изумрудный зенит'
    },
    class: 'bg-gradient-to-tr from-emerald-950 via-teal-950 to-slate-950 text-emerald-100',
    textColor: 'text-emerald-50',
    cardClass: 'bg-emerald-950/40 border border-emerald-900/30 backdrop-blur-md text-emerald-100',
    dark: true
  },
  {
    id: 'classic_dark',
    name: {
      uz: 'Klassik qorong\'u',
      en: 'Classic Obsidian',
      ru: 'Классический черный'
    },
    class: 'bg-neutral-950 text-neutral-100',
    textColor: 'text-neutral-100',
    cardClass: 'bg-neutral-900 border border-neutral-800 text-neutral-100',
    dark: true
  },
  {
    id: 'bloom',
    name: {
      uz: 'Kokos Shokoladi',
      en: 'Sakura Blush',
      ru: 'Сакура Блум'
    },
    class: 'bg-rose-50 text-slate-900',
    textColor: 'text-slate-900',
    cardClass: 'bg-white/80 border border-rose-100 backdrop-blur-md shadow-sm text-slate-900',
    dark: false
  }
];

export const CATEGORY_ICONS = [
  'Briefcase',
  'User',
  'BookOpen',
  'Activity',
  'DollarSign',
  'Compass',
  'Heart',
  'Home',
  'Calendar',
  'ShoppingBag',
  'Award',
  'Coffee',
  'Gamepad2',
  'Music'
];

export const CATEGORY_COLORS = [
  '#ff4757', // Coral Red
  '#3498db', // Blue
  '#2ecc71', // Emerald Green
  '#9b59b6', // Amethyst Purple
  '#f1c40f', // Yellow
  '#e67e22', // Orange
  '#1abc9c', // Turquoise
  '#e84393', // Pink
  '#6c5ce7', // Lilac
  '#00cec9', // Teal
  '#ffeaa7', // Muted Mustard
  '#a4b0be'  // Slate Muted
];
