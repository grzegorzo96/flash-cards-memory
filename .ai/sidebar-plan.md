# Plan Implementacji Systemu Nawigacji z Sidebarami

## Przegląd

Projekt obecnie **nie posiada żadnej nawigacji** dla zalogowanych użytkowników. Istnieje tylko prosty top navbar na landing page'u. Ten plan opisuje implementację kompletnego systemu nawigacji z sidebarami.

---

## 1. Struktura Komponentów do Utworzenia

### 1.1 Nowy Layout z Sidebarami
**Lokalizacja:** `src/layouts/AppLayout.astro`

**Cel:** Layout dla zalogowanych użytkowników z sidebarami (desktop) lub hamburger menu (mobile)

**Zawartość:**
- Sidebar po lewej stronie (desktop)
- Hamburger menu z drawer (mobile/tablet)
- Główny content area
- Opcjonalnie: top bar z user menu

### 1.2 Komponenty Nawigacyjne

#### A) `src/components/navigation/Sidebar.tsx` (komponent React)
- Logo/nazwa aplikacji na górze
- Lista linków nawigacyjnych z ikonami
- User info i przycisk wylogowania na dole
- Responsive (ukryty na mobile)

#### B) `src/components/navigation/MobileNav.tsx` (komponent React)
- Hamburger button w top bar
- Drawer/Sheet component (z shadcn/ui)
- Ta sama lista linków jak w Sidebarze

#### C) `src/components/navigation/NavItem.tsx` (komponent React)
- Pojedynczy element nawigacji
- Active state (podświetlenie aktywnej strony)
- Ikona + label
- Link

#### D) `src/components/navigation/UserMenu.tsx` (komponent React)
- Avatar/inicjały użytkownika
- Email
- Przycisk wylogowania
- Opcjonalnie: dropdown z ustawieniami

---

## 2. Struktura Nawigacji - Proponowane Sekcje

Na podstawie struktury projektu:

```typescript
const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "Home", // lucide-react icon
    description: "Przegląd talii i statystyk"
  },
  {
    label: "Moje Talie",
    href: "/decks",
    icon: "BookOpen",
    description: "Zarządzanie taliami fiszek"
  },
  {
    label: "Generuj Fiszki",
    href: "/generate/setup",
    icon: "Sparkles",
    description: "Wygeneruj fiszki z AI"
  },
  {
    label: "Nauka",
    href: "/study", // nowa strona z listą dostępnych sesji
    icon: "GraduationCap",
    description: "Rozpocznij sesję nauki"
  }
]
```

---

## 3. Krok po Kroku - Implementacja

### Krok 1: Przygotowanie zależności

Upewnij się że masz:
- `lucide-react` - ikony
- Shadcn/ui components: `sheet`, `separator`, `scroll-area`

```bash
npm install lucide-react
npx shadcn@latest add sheet separator scroll-area
```

### Krok 2: Utworzenie komponentu Sidebar

**Lokalizacja:** `src/components/navigation/Sidebar.tsx`

**Specyfikacja:**
- Fixed position po lewej
- Szerokość: 256px (w-64)
- Dark background z border-right
- Sticky header z logo
- Scrollable content z nav items
- Sticky footer z user menu

**Key features:**
- Wykrywanie aktywnej strony (porównanie `window.location.pathname`)
- Hover states na linkach
- Smooth transitions

### Krok 3: Utworzenie komponentu NavItem

**Lokalizacja:** `src/components/navigation/NavItem.tsx`

**Props:**
- `href` - docelowy URL
- `label` - tekst linku
- `icon` - nazwa ikony z lucide-react
- `isActive` - czy link jest aktywny

**Funkcjonalność:**
- Active state styling (bg-accent, font-bold)
- Hover effect
- Icon + text layout

### Krok 4: Utworzenie Mobile Navigation

**Lokalizacja:** `src/components/navigation/MobileNav.tsx`

**Specyfikacja:**
- Hamburger button (3 linie) w top-left
- State management dla open/close
- Sheet component z shadcn/ui
- Ta sama struktura jak Sidebar

### Krok 5: Utworzenie UserMenu

**Lokalizacja:** `src/components/navigation/UserMenu.tsx`

**Funkcjonalność:**
- Display email z `Astro.locals.user`
- Avatar z inicjałami
- Logout button z POST form do `/logout`

### Krok 6: Utworzenie nowego Layout

**Lokalizacja:** `src/layouts/AppLayout.astro`

**Struktura:**

```astro
---
import '../styles/global.css';
import Sidebar from '@/components/navigation/Sidebar';
import MobileNav from '@/components/navigation/MobileNav';

interface Props {
  title?: string;
  user: { email: string; id: string } | null;
}

const { title = "FlashCardsMemory", user } = Astro.props;
---

<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
  </head>
  <body>
    <div class="flex h-screen">
      <!-- Desktop Sidebar (hidden on mobile) -->
      <div class="hidden lg:block">
        <Sidebar client:load user={user} />
      </div>
      
      <!-- Mobile Top Bar -->
      <div class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <MobileNav client:load user={user} />
      </div>
      
      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto lg:ml-0 pt-16 lg:pt-0">
        <slot />
      </main>
    </div>
  </body>
</html>

<style>
  html,
  body {
    margin: 0;
    width: 100%;
    height: 100%;
  }
</style>
```

### Krok 7: Migracja istniejących stron

Zamień `Layout.astro` na `AppLayout.astro` w następujących plikach:

**Strony do zmiany:**
- `src/pages/dashboard.astro`
- `src/pages/decks/index.astro`
- `src/pages/decks/[deckId]/index.astro`
- `src/pages/decks/[deckId]/edit.astro`
- `src/pages/decks/new.astro`
- `src/pages/flashcards/[flashcardId]/edit.astro`
- `src/pages/flashcards/[flashcardId]/index.astro`
- `src/pages/flashcards/new.astro`
- `src/pages/generate/setup.astro`
- `src/pages/generate/input.astro`
- `src/pages/generate/progress.astro`
- `src/pages/generate/preview.astro`
- `src/pages/generate/error.astro`
- `src/pages/study/[sessionId]/index.astro`
- `src/pages/study/[sessionId]/summary.astro`

**Przykład zmiany:**
```diff
- import Layout from "@/layouts/Layout.astro";
+ import AppLayout from "@/layouts/AppLayout.astro";

- <Layout title="Dashboard">
+ <AppLayout title="Dashboard" user={Astro.locals.user}>
    <DashboardPage client:load />
- </Layout>
+ </AppLayout>
```

### Krok 8: Dostosowanie stylów globalnych

W `src/styles/global.css`:
- Dostosuj padding/margin w main content
- Zapewnij że sidebar nie zasłania contentu
- Mobile breakpoints dla responsywności

**Sugerowane dodatkowe style:**
```css
/* Main content padding */
.page-content {
  @apply container mx-auto px-4 py-8;
}

/* Mobile adjustments */
@media (max-width: 1023px) {
  .page-content {
    @apply pt-20; /* Account for mobile top bar */
  }
}
```

### Krok 9: Active Route Detection

**Lokalizacja:** `src/lib/helpers/navigation.ts`

```typescript
/**
 * Checks if the current route matches the navigation item
 */
export function isActiveRoute(currentPath: string, itemPath: string): boolean {
  // Exact match for dashboard
  if (itemPath === '/dashboard') {
    return currentPath === '/dashboard';
  }
  
  // Prefix match for other routes
  return currentPath.startsWith(itemPath);
}

/**
 * Gets user initials from email
 */
export function getUserInitials(email: string): string {
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
}
```

**Użycie w komponencie Sidebar:**
```tsx
const [currentPath, setCurrentPath] = useState('');

useEffect(() => {
  setCurrentPath(window.location.pathname);
}, []);
```

### Krok 10: Opcjonalne Rozszerzenia

**Priorytet NISKI - do implementacji w przyszłości:**

1. **Breadcrumbs** - dodaj pod top bar dla lepszej orientacji
2. **Collapse/Expand Sidebar** - przycisk do zwijania sidebara (więcej miejsca na content)
3. **Notifications Badge** - przy niektórych linkach (np. due cards count)
4. **Search** - globalne wyszukiwanie w top bar
5. **Theme Switcher** - dark/light mode toggle w user menu
6. **Keyboard Shortcuts** - nawigacja klawiaturą (Ctrl+K dla search, etc.)

---

## 4. Struktura Plików - Podsumowanie

```
src/
├── layouts/
│   ├── Layout.astro              (istniejący, dla public pages)
│   └── AppLayout.astro           (nowy, dla zalogowanych użytkowników)
├── components/
│   └── navigation/
│       ├── Sidebar.tsx           (nowy, desktop sidebar)
│       ├── MobileNav.tsx         (nowy, mobile navigation)
│       ├── NavItem.tsx           (nowy, pojedynczy link)
│       ├── UserMenu.tsx          (nowy, user info + logout)
│       └── NavigationConfig.ts   (nowy, config z linkami)
├── lib/
│   └── helpers/
│       └── navigation.ts         (nowy, helpery dla nawigacji)
└── styles/
    └── global.css                (modyfikacja, dodatkowe style)
```

---

## 5. Szczegóły Techniczne

### Responsywność

**Breakpointy:**
- **Desktop (≥1024px):** Stały sidebar po lewej (256px width), content po prawej
- **Tablet/Mobile (<1024px):** Hamburger menu + drawer/sheet, content full-width

**Tailwind classes:**
```tsx
// Sidebar visibility
<div className="hidden lg:block">
  <Sidebar />
</div>

// Mobile nav
<div className="lg:hidden">
  <MobileNav />
</div>
```

### Active State Detection

**W React Component:**
```tsx
const [currentPath, setCurrentPath] = useState('');

useEffect(() => {
  setCurrentPath(window.location.pathname);
  
  // Optional: listen to navigation events
  const handleLocationChange = () => {
    setCurrentPath(window.location.pathname);
  };
  
  window.addEventListener('popstate', handleLocationChange);
  return () => window.removeEventListener('popstate', handleLocationChange);
}, []);
```

### User Data Passing

**Z Astro do React:**
```astro
<!-- AppLayout.astro -->
<Sidebar client:load user={Astro.locals.user} />
```

**Props Type:**
```typescript
type SidebarProps = {
  user: {
    id: string;
    email: string;
  } | null;
};
```

### Styling

**Stack:**
- Tailwind classes dla layoutu i stylizacji
- CSS variables z `global.css` dla theme colors
- shadcn/ui components dla Sheet, Separator, ScrollArea

**Key Classes:**
```tsx
// Sidebar container
className="fixed left-0 top-0 h-full w-64 border-r bg-background"

// Nav item (active)
className="flex items-center gap-3 px-4 py-2 rounded-md bg-accent text-accent-foreground font-semibold"

// Nav item (inactive)
className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-accent/50 transition-colors"
```

---

## 6. Testowanie

### Checklist Po Implementacji

**Funkcjonalność:**
- [ ] Nawigacja działa na wszystkich stronach
- [ ] Active state podświetla właściwą stronę
- [ ] Kliknięcie linku przenosi na właściwą stronę
- [ ] Mobile menu otwiera się i zamyka poprawnie
- [ ] Wylogowanie działa (POST do /logout)
- [ ] User email wyświetla się poprawnie

**Responsywność:**
- [ ] Desktop: sidebar widoczny, zajmuje 256px
- [ ] Mobile: sidebar ukryty, hamburger menu widoczne
- [ ] Tablet: testowanie breakpointu (1024px)
- [ ] Content nie jest zasłonięty przez sidebar
- [ ] Scrollowanie działa poprawnie

**UX:**
- [ ] Transitions są płynne
- [ ] Hover states działają poprawnie
- [ ] Keyboard navigation (Tab, Enter)
- [ ] ARIA labels dla accessibility
- [ ] Focus states widoczne

**Cross-browser:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 7. Kolejność Wdrożenia (Priorytet)

### Faza 1: CORE (Must Have)
1. ✅ Sidebar component + NavItem
2. ✅ AppLayout.astro
3. ✅ NavigationConfig.ts (config z linkami)
4. ✅ Migracja `dashboard.astro`
5. ✅ Migracja `decks/index.astro`

### Faza 2: MEDIUM (Should Have)
6. ✅ UserMenu component
7. ✅ MobileNav component
8. ✅ navigation.ts helpers
9. ✅ Migracja pozostałych stron decks/*
10. ✅ Migracja stron flashcards/*

### Faza 3: LOW (Nice to Have)
11. ✅ Migracja stron generate/*
12. ✅ Migracja stron study/*
13. ✅ Dostosowanie stylów globalnych
14. ✅ Testowanie i poprawki

### Faza 4: OPTIONAL (Future)
15. ⏸️ Breadcrumbs
16. ⏸️ Search functionality
17. ⏸️ Theme switcher
18. ⏸️ Keyboard shortcuts
19. ⏸️ Notifications badges

---

## 8. Potencjalne Problemy i Rozwiązania

### Problem 1: Active State nie aktualizuje się przy nawigacji
**Przyczyna:** React nie wykrywa zmian w `window.location.pathname`

**Rozwiązanie:** 
- Użyj `popstate` event listener
- Alternatywnie: przebuduj na client-side routing (React Router)

### Problem 2: Sidebar zasłania content na małych ekranach
**Przyczyna:** Niewłaściwe breakpointy lub padding

**Rozwiązanie:**
- Użyj `lg:block` / `lg:hidden` dla sidebar
- Dodaj padding-top dla mobile content (pt-16)

### Problem 3: Sheet/Drawer nie zamyka się po kliknięciu linku
**Przyczyna:** Brak obsługi nawigacji w MobileNav

**Rozwiązanie:**
```tsx
const handleNavClick = () => {
  setIsOpen(false); // Close drawer
};
```

### Problem 4: User data undefined
**Przyczyna:** `Astro.locals.user` może być null

**Rozwiązanie:**
- Dodaj default props lub fallback
- Middleware zapewnia że protected routes mają user

---

## 9. Performance Considerations

### Optymalizacje

1. **Lazy Loading ikon:**
```tsx
import { Home, BookOpen, Sparkles, GraduationCap } from 'lucide-react';
```
(lucide-react używa tree-shaking automatycznie)

2. **Memoizacja komponentów:**
```tsx
export const NavItem = React.memo(({ href, label, icon, isActive }) => {
  // ...
});
```

3. **Client directives:**
- Użyj `client:load` dla Sidebar (visible immediately)
- Użyj `client:idle` dla MobileNav (deferred loading)

---

## 10. Accessibility (A11y)

### Wymagania WCAG

**Keyboard Navigation:**
- Tab do przechodzenia między linkami
- Enter do aktywacji linku
- Escape do zamknięcia mobile drawer

**ARIA Labels:**
```tsx
<nav aria-label="Main navigation">
  <a href="/dashboard" aria-current={isActive ? "page" : undefined}>
    Dashboard
  </a>
</nav>

<button aria-label="Open navigation menu" onClick={openDrawer}>
  <Menu />
</button>
```

**Focus Management:**
- Widoczne focus states (ring-2)
- Focus trap w mobile drawer (gdy otwarty)

---

## Status: Ready for Implementation ✅

Ten plan jest gotowy do wdrożenia. Wszystkie komponenty, style i logika zostały szczegółowo opisane. Można rozpocząć implementację od Fazy 1 (CORE components).
