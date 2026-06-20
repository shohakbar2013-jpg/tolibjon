export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string; // Category id
  priority: Priority;
  date: string; // YYYY-MM-DD
  completed: boolean;
  reminderTime?: string; // ISO string or HH:MM on target date
  reminderEnabled: boolean;
  reminderTriggered?: boolean;
  createdAt: number;
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
}

export interface Category {
  id: string;
  name: {
    uz: string;
    en: string;
    ru: string;
  };
  color: string; // Tailwind hex or class name
  icon: string; // Icon name from lucide
}

export interface Theme {
  id: string;
  name: {
    uz: string;
    en: string;
    ru: string;
  };
  class: string; // css gradient/color
  textColor: string;
  cardClass: string;
  dark: boolean;
}

export type Language = 'uz' | 'en' | 'ru';

export interface UserSettings {
  language: Language;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  themeId: string;
  isDarkMode: boolean;
}

export interface NotificationLog {
  id: string;
  taskId: string;
  taskTitle: string;
  time: number;
  read: boolean;
}
