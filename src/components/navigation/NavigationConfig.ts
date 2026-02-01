import type { LucideIcon } from 'lucide-react';
import { Home, BookOpen, Sparkles, GraduationCap } from 'lucide-react';

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Przegląd talii i statystyk',
  },
  {
    label: 'Moje Talie',
    href: '/decks',
    icon: BookOpen,
    description: 'Zarządzanie taliami fiszek',
  },
  {
    label: 'Generuj Fiszki',
    href: '/generate/setup',
    icon: Sparkles,
    description: 'Wygeneruj fiszki z AI',
  },
  {
    label: 'Nauka',
    href: '/study',
    icon: GraduationCap,
    description: 'Rozpocznij sesję nauki',
  },
];
