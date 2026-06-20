import React from 'react';
import {
  Briefcase,
  User,
  BookOpen,
  Activity,
  DollarSign,
  Compass,
  Heart,
  Home,
  Calendar,
  ShoppingBag,
  Award,
  Coffee,
  Gamepad2,
  Music,
  Settings,
  Plus,
  Trash,
  Check,
  Edit,
  Search,
  Bell,
  BellRing,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Info,
  Sliders,
  X,
  Clock,
  ArrowUpDown,
  TrendingUp,
  CheckCircle,
  CalendarDays,
  Lock,
  Volume2,
  VolumeX,
  Globe,
  PlusCircle,
  Sparkles,
  InfoIcon,
  ChevronsUpDown,
  ListTodo
} from 'lucide-react';

const iconsMap: Record<string, React.ComponentType<any>> = {
  Briefcase,
  User,
  BookOpen,
  Activity,
  DollarSign,
  Compass,
  Heart,
  Home,
  Calendar,
  ShoppingBag,
  Award,
  Coffee,
  Gamepad2,
  Music,
  Settings,
  Plus,
  Trash,
  Check,
  Edit,
  Search,
  Bell,
  BellRing,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Info,
  Sliders,
  X,
  Clock,
  ArrowUpDown,
  TrendingUp,
  CheckCircle,
  CalendarRange: CalendarDays,
  CalendarDays,
  Lock,
  Volume2,
  VolumeX,
  Globe,
  PlusCircle,
  Sparkles,
  InfoIcon,
  ChevronsUpDown,
  ListTodo
};

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export default function LucideIcon({ name, className = '', size = 20, color }: LucideIconProps) {
  const IconComponent = iconsMap[name] || ListTodo;
  
  return <IconComponent className={className} size={size} style={color ? { color } : undefined} />;
}
