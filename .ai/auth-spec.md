# Specyfikacja techniczna modułu autentykacji - FlashCardsMemory

## 1. WPROWADZENIE

### 1.1 Cel dokumentu
Niniejszy dokument przedstawia szczegółową architekturę modułu autentykacji dla aplikacji FlashCardsMemory. Specyfikacja obejmuje implementację funkcjonalności rejestracji, logowania, wylogowywania i odzyskiwania hasła użytkowników z wykorzystaniem Supabase Auth w połączeniu z Astro 5.

### 1.2 Zakres funkcjonalny
Moduł autentykacji realizuje następujące wymagania z PRD:
- **US-001**: Rejestracja nowego użytkownika (email + hasło + weryfikacja email)
- **US-002**: Logowanie do systemu z utrzymaniem sesji
- **US-003**: Wylogowanie z systemu i zakończenie sesji
- **US-004**: Resetowanie hasła z linkiem weryfikacyjnym

### 1.3 Kontekst techniczny
Aplikacja wykorzystuje:
- **Frontend**: Astro 5 (SSR) z React 19 dla komponentów interaktywnych
- **Backend**: Supabase jako Backend-as-a-Service (PostgreSQL + Auth)
- **Autentykacja**: Supabase Auth z mechanizmem sesji opartym na JWT
- **Rendering**: Server-Side Rendering (SSR) z trybem `output: 'server'`

### 1.4 Migracja z systemu anonimowego
Obecnie aplikacja używa tymczasowego mechanizmu anonimowych użytkowników opartego na cookie (`user_id_v2`). Moduł autentykacji zastąpi ten mechanizm rzeczywistym systemem kont użytkowników, zachowując kompatybilność z istniejącą strukturą bazy danych (tabela `auth.users` w Supabase).

---

## 2. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 2.1 Przegląd struktury UI

Warstwa prezentacji składa się z:
- **Stron Astro** (`.astro`) - renderowane server-side, odpowiedzialne za routing, layout i integrację z backendem
- **Komponentów React** (`.tsx`) - renderowane client-side, odpowiedzialne za interaktywność, walidację formularzy i komunikację z API

### 2.2 Strony Astro (Server-Side)

#### 2.2.1 `/src/pages/login.astro`
**Status**: Istniejąca - wymaga rozszerzenia

**Odpowiedzialności**:
- Renderowanie layoutu strony logowania
- Sprawdzenie stanu sesji użytkownika (middleware)
- Przekierowanie zalogowanych użytkowników na `/dashboard`
- Obsługa query parameters (np. `?redirect=/decks` dla przekierowania po logowaniu)
- Integracja z komponentem React `LoginPage`

**Zmiany wymagane**:
```typescript
// Dodanie logiki sprawdzania sesji
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  return Astro.redirect('/dashboard');
}

// Obsługa parametru redirect
const redirectUrl = Astro.url.searchParams.get('redirect') || '/dashboard';
```

**Struktura**:
```astro
---
import Layout from "@/layouts/Layout.astro";
import LoginPage from "@/components/auth/LoginPage";

// Sprawdzenie sesji i przekierowanie jeśli zalogowany
const supabase = Astro.locals.supabase;
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  return Astro.redirect('/dashboard');
}

const redirectUrl = Astro.url.searchParams.get('redirect') || '/dashboard';
---

<Layout title="Logowanie - FlashCardMemory">
  <LoginPage client:load redirectUrl={redirectUrl} />
</Layout>
```

#### 2.2.2 `/src/pages/register.astro`
**Status**: Istniejąca - wymaga rozszerzenia

**Odpowiedzialności**:
- Renderowanie layoutu strony rejestracji
- Sprawdzenie stanu sesji użytkownika
- Przekierowanie zalogowanych użytkowników na `/dashboard`
- Integracja z komponentem React `RegisterPage`

**Zmiany wymagane**:
Analogiczne do `login.astro` - dodanie sprawdzania sesji i przekierowania.

#### 2.2.3 `/src/pages/reset-password.astro`
**Status**: Istniejąca - wymaga rozszerzenia

**Odpowiedzialności**:
- Renderowanie layoutu strony resetowania hasła
- Obsługa dwóch trybów:
  - **Tryb żądania resetu** - formularz z polem email
  - **Tryb ustawiania nowego hasła** - formularz z nowym hasłem (po kliknięciu w link z emaila)
- Sprawdzenie tokenu resetowania hasła z URL (`?token=...&type=recovery`)
- Integracja z komponentem React `ResetPasswordPage`

**Struktura**:
```astro
---
import Layout from "@/layouts/Layout.astro";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

const supabase = Astro.locals.supabase;

// Sprawdzenie czy to tryb recovery (link z emaila)
const token = Astro.url.searchParams.get('token');
const type = Astro.url.searchParams.get('type');
const isRecoveryMode = token && type === 'recovery';

// Jeśli recovery mode, weryfikuj token
let tokenValid = false;
if (isRecoveryMode) {
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'recovery'
  });
  tokenValid = !error;
}
---

<Layout title="Reset hasła - FlashCardMemory">
  <ResetPasswordPage 
    client:load 
    isRecoveryMode={isRecoveryMode}
    tokenValid={tokenValid}
  />
</Layout>
```

#### 2.2.4 `/src/pages/auth/callback.astro` (NOWA)
**Status**: Do utworzenia

**Odpowiedzialności**:
- Obsługa callback z Supabase Auth po weryfikacji email
- Wymiana kodu autoryzacyjnego na sesję
- Przekierowanie użytkownika na odpowiednią stronę

**Struktura**:
```astro
---
const supabase = Astro.locals.supabase;
const code = Astro.url.searchParams.get('code');

if (code) {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    console.error('Auth callback error:', error);
    return Astro.redirect('/login?error=auth_callback_failed');
  }
  
  return Astro.redirect('/dashboard');
}

return Astro.redirect('/login');
---
```

#### 2.2.5 `/src/pages/logout.astro` (NOWA)
**Status**: Do utworzenia

**Odpowiedzialności**:
- Wylogowanie użytkownika (zakończenie sesji w Supabase)
- Wyczyszczenie cookie sesji
- Przekierowanie na stronę logowania

**Struktura**:
```astro
---
const supabase = Astro.locals.supabase;
await supabase.auth.signOut();
return Astro.redirect('/login');
---
```

### 2.3 Komponenty React (Client-Side)

#### 2.3.1 `/src/components/auth/LoginPage.tsx`
**Status**: Istniejący - wymaga przebudowy

**Odpowiedzialności**:
- Renderowanie formularza logowania (email + hasło)
- Walidacja danych wejściowych (Zod)
- Wyświetlanie błędów walidacji inline
- Wywołanie API logowania (`POST /api/auth/login`)
- Obsługa błędów autoryzacji (nieprawidłowe dane, konto niezweryfikowane)
- Wyświetlanie komunikatów sukcesu/błędu
- Nawigacja po pomyślnym logowaniu

**Props**:
```typescript
interface LoginPageProps {
  redirectUrl?: string; // URL do przekierowania po logowaniu
}
```

**Stan komponentu**:
```typescript
interface LoginPageState {
  formData: {
    email: string;
    password: string;
  };
  errors: Partial<Record<'email' | 'password' | 'general', string>>;
  isSubmitting: boolean;
}
```

**Schemat walidacji (Zod)**:
```typescript
const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});
```

**Przepływ logowania**:
1. Użytkownik wypełnia formularz
2. Walidacja client-side (Zod)
3. Wywołanie `POST /api/auth/login` z credentials
4. Obsługa odpowiedzi:
   - **200 OK**: Przekierowanie na `redirectUrl` lub `/dashboard`
   - **401 Unauthorized**: Wyświetlenie błędu "Nieprawidłowy email lub hasło"
   - **403 Forbidden**: Wyświetlenie błędu "Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email."
   - **500 Error**: Wyświetlenie błędu "Wystąpił błąd. Spróbuj ponownie."

**Komunikaty błędów**:
- Walidacja email: "Nieprawidłowy format email"
- Walidacja hasła: "Hasło musi mieć minimum 8 znaków"
- Błąd logowania: "Nieprawidłowy email lub hasło"
- Konto niezweryfikowane: "Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email i kliknij w link aktywacyjny."
- Błąd serwera: "Wystąpił błąd podczas logowania. Spróbuj ponownie."

**Linki nawigacyjne**:
- "Zapomniałeś hasła?" → `/reset-password`
- "Nie masz konta? Zarejestruj się" → `/register`

#### 2.3.2 `/src/components/auth/RegisterPage.tsx`
**Status**: Istniejący - wymaga przebudowy

**Odpowiedzialności**:
- Renderowanie formularza rejestracji (email + hasło + potwierdzenie hasła)
- Walidacja danych wejściowych (Zod)
- Sprawdzenie zgodności hasła i jego potwierdzenia
- Wywołanie API rejestracji (`POST /api/auth/register`)
- Wyświetlanie komunikatu o wysłaniu emaila weryfikacyjnego
- Obsługa błędów (email już istnieje, błędy serwera)

**Stan komponentu**:
```typescript
interface RegisterPageState {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  errors: Partial<Record<'email' | 'password' | 'confirmPassword' | 'general', string>>;
  isSubmitting: boolean;
  isSuccess: boolean; // Czy rejestracja zakończona sukcesem
}
```

**Schemat walidacji (Zod)**:
```typescript
const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format email"),
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });
```

**Przepływ rejestracji**:
1. Użytkownik wypełnia formularz
2. Walidacja client-side (Zod)
3. Wywołanie `POST /api/auth/register` z danymi
4. Obsługa odpowiedzi:
   - **201 Created**: Wyświetlenie komunikatu sukcesu z informacją o weryfikacji email
   - **409 Conflict**: Wyświetlenie błędu "Konto z tym adresem email już istnieje"
   - **500 Error**: Wyświetlenie błędu ogólnego

**Widok sukcesu**:
Po pomyślnej rejestracji komponent wyświetla:
```
✓ Konto zostało utworzone!

Na adres [email] wysłaliśmy link aktywacyjny. 
Kliknij w link w emailu, aby aktywować konto.

[Wróć do logowania]
```

**Komunikaty błędów**:
- Email już istnieje: "Konto z tym adresem email już istnieje. Zaloguj się lub użyj innego adresu."
- Błąd serwera: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie."

**Linki nawigacyjne**:
- "Masz już konto? Zaloguj się" → `/login`

#### 2.3.3 `/src/components/auth/ResetPasswordPage.tsx`
**Status**: Istniejący - wymaga przebudowy

**Odpowiedzialności**:
- Obsługa dwóch trybów:
  - **Tryb żądania resetu**: Formularz z polem email
  - **Tryb ustawiania nowego hasła**: Formularz z nowym hasłem + potwierdzeniem
- Walidacja danych wejściowych
- Wywołanie odpowiednich API endpoints
- Wyświetlanie komunikatów sukcesu/błędu

**Props**:
```typescript
interface ResetPasswordPageProps {
  isRecoveryMode: boolean; // Czy to tryb ustawiania nowego hasła
  tokenValid: boolean; // Czy token z URL jest ważny
}
```

**Stan komponentu**:
```typescript
interface ResetPasswordPageState {
  // Tryb żądania resetu
  requestFormData: {
    email: string;
  };
  
  // Tryb ustawiania nowego hasła
  resetFormData: {
    password: string;
    confirmPassword: string;
  };
  
  errors: Partial<Record<string, string>>;
  isSubmitting: boolean;
  isSuccess: boolean;
}
```

**Schematy walidacji**:
```typescript
// Tryb żądania resetu
const requestResetSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
});

// Tryb ustawiania nowego hasła
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });
```

**Przepływ żądania resetu**:
1. Użytkownik wpisuje email
2. Walidacja client-side
3. Wywołanie `POST /api/auth/reset-password` z emailem
4. Wyświetlenie komunikatu: "Link do resetowania hasła został wysłany na adres [email]. Link jest ważny przez 24 godziny."

**Przepływ ustawiania nowego hasła**:
1. Użytkownik przechodzi z linku w emailu (zawiera token)
2. Strona weryfikuje token (server-side w `.astro`)
3. Jeśli token nieważny: Wyświetlenie błędu "Link wygasł lub jest nieprawidłowy. Poproś o nowy link."
4. Jeśli token ważny: Wyświetlenie formularza nowego hasła
5. Użytkownik wpisuje nowe hasło + potwierdzenie
6. Wywołanie `POST /api/auth/update-password` z nowym hasłem i tokenem
7. Po sukcesie: Przekierowanie na `/login` z komunikatem "Hasło zostało zmienione. Możesz się teraz zalogować."

**Linki nawigacyjne**:
- "Pamiętasz hasło? Zaloguj się" → `/login`

#### 2.3.4 `/src/components/ui/AuthErrorAlert.tsx` (NOWY)
**Status**: Do utworzenia

**Odpowiedzialności**:
- Reużywalny komponent do wyświetlania błędów autentykacji
- Spójny wygląd komunikatów błędów

**Props**:
```typescript
interface AuthErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}
```

**Użycie**:
```tsx
<AuthErrorAlert 
  message="Nieprawidłowy email lub hasło" 
  onDismiss={() => setError(null)}
/>
```

### 2.4 Modyfikacje istniejących komponentów

#### 2.4.1 Nawigacja/Header - wymaga dodania przycisku wylogowania

**Lokalizacja**: `/src/components/dashboard/DashboardHeader.tsx` (istniejący)

**Zmiany**:
- Dodanie przycisku "Wyloguj" w prawym górnym rogu
- Wyświetlanie emaila zalogowanego użytkownika
- Obsługa kliknięcia - przekierowanie na `/logout`

**Struktura**:
```tsx
<header>
  <nav>
    {/* Istniejące elementy nawigacji */}
  </nav>
  
  <div className="user-menu">
    <span>{userEmail}</span>
    <Button variant="ghost" asChild>
      <a href="/logout">Wyloguj</a>
    </Button>
  </div>
</header>
```

#### 2.4.2 Layout - wymaga warunkowego renderowania nawigacji

**Lokalizacja**: `/src/layouts/Layout.astro`

**Zmiany**:
- Dodanie prop `showNavigation` (domyślnie `true`)
- Strony auth (`/login`, `/register`, `/reset-password`) powinny mieć `showNavigation={false}`
- Pozostałe strony wyświetlają nawigację z przyciskiem wylogowania

### 2.5 Walidacja i komunikaty błędów

#### 2.5.1 Zasady walidacji

**Email**:
- Format: walidacja regex przez Zod (`.email()`)
- Komunikat: "Nieprawidłowy format email"

**Hasło**:
- Minimalna długość: 8 znaków
- Komunikat: "Hasło musi mieć minimum 8 znaków"
- Brak wymagań dotyczących złożoności (cyfry, znaki specjalne) w MVP

**Potwierdzenie hasła**:
- Musi być identyczne z hasłem
- Komunikat: "Hasła muszą być identyczne"

#### 2.5.2 Wyświetlanie błędów

**Błędy walidacji** (client-side):
- Wyświetlane inline pod odpowiednim polem formularza
- Kolor: `text-destructive` (czerwony z Shadcn/ui)
- Pojawiają się natychmiast po opuszczeniu pola (blur) lub próbie submit

**Błędy API** (server-side):
- Wyświetlane jako Alert nad formularzem
- Używają komponentu `<Alert>` z Shadcn/ui
- Zawierają przycisk zamknięcia (X)

**Komunikaty sukcesu**:
- Wyświetlane jako Alert z wariantem `success`
- Przykład: "Link do resetowania hasła został wysłany"

### 2.6 Scenariusze użytkownika

#### Scenariusz 1: Nowy użytkownik - rejestracja i weryfikacja
1. Użytkownik wchodzi na `/register`
2. Wypełnia formularz (email, hasło, potwierdzenie)
3. Klika "Zarejestruj się"
4. Widzi komunikat: "Na adres [email] wysłaliśmy link aktywacyjny"
5. Otwiera email i klika w link weryfikacyjny
6. Jest przekierowany na `/auth/callback?code=...`
7. Callback wymienia kod na sesję
8. Użytkownik jest przekierowany na `/dashboard` jako zalogowany

#### Scenariusz 2: Istniejący użytkownik - logowanie
1. Użytkownik wchodzi na `/login`
2. Wypełnia formularz (email, hasło)
3. Klika "Zaloguj się"
4. Jest przekierowany na `/dashboard`
5. Sesja jest zapisana w cookie (Supabase Auth)

#### Scenariusz 3: Użytkownik zapomniał hasła
1. Użytkownik wchodzi na `/login`
2. Klika "Zapomniałeś hasła?"
3. Jest przekierowany na `/reset-password`
4. Wpisuje email i klika "Wyślij link resetujący"
5. Widzi komunikat: "Link do resetowania hasła został wysłany"
6. Otwiera email i klika w link
7. Jest przekierowany na `/reset-password?token=...&type=recovery`
8. Widzi formularz nowego hasła
9. Wpisuje nowe hasło + potwierdzenie
10. Klika "Zmień hasło"
11. Jest przekierowany na `/login` z komunikatem sukcesu
12. Loguje się nowym hasłem

#### Scenariusz 4: Próba dostępu do chronionej strony bez logowania
1. Niezalogowany użytkownik próbuje wejść na `/dashboard`
2. Middleware wykrywa brak sesji
3. Użytkownik jest przekierowany na `/login?redirect=/dashboard`
4. Po zalogowaniu jest przekierowany z powrotem na `/dashboard`

#### Scenariusz 5: Wylogowanie
1. Zalogowany użytkownik klika "Wyloguj" w nawigacji
2. Jest przekierowany na `/logout`
3. Sesja jest zakończona (Supabase Auth)
4. Użytkownik jest przekierowany na `/login`
5. Próba wejścia na `/dashboard` przekierowuje z powrotem na `/login`

---

## 3. LOGIKA BACKENDOWA

### 3.1 Endpointy API

#### 3.1.1 `POST /api/auth/register` (NOWY)
**Lokalizacja**: `/src/pages/api/auth/register.ts`

**Odpowiedzialności**:
- Walidacja danych wejściowych (email, hasło)
- Wywołanie Supabase Auth `signUp()`
- Wysłanie emaila weryfikacyjnego
- Zwrócenie odpowiedzi sukcesu lub błędu

**Request Body**:
```typescript
interface RegisterCommand {
  email: string;
  password: string;
}
```

**Schemat walidacji (Zod)**:
```typescript
const RegisterCommandSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});
```

**Implementacja**:
```typescript
export const POST: APIRoute = async (context) => {
  try {
    // 1. Parse i walidacja body
    const body = await context.request.json();
    const validation = RegisterCommandSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { email, password } = validation.data;
    const supabase = context.locals.supabase;
    
    // 2. Wywołanie Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${context.url.origin}/auth/callback`,
      },
    });
    
    // 3. Obsługa błędów
    if (error) {
      // Email już istnieje
      if (error.message.includes('already registered')) {
        return new Response(
          JSON.stringify({
            error: 'Email already exists',
            message: 'Konto z tym adresem email już istnieje',
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Inny błąd
      console.error('Supabase signUp error:', error);
      return new Response(
        JSON.stringify({
          error: 'Registration failed',
          message: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 4. Sukces
    return new Response(
      JSON.stringify({
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/register:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Odpowiedzi**:
- **201 Created**: Rejestracja zakończona sukcesem, email weryfikacyjny wysłany
- **400 Bad Request**: Błąd walidacji danych wejściowych
- **409 Conflict**: Email już istnieje w systemie
- **500 Internal Server Error**: Błąd serwera lub Supabase

#### 3.1.2 `POST /api/auth/login` (NOWY)
**Lokalizacja**: `/src/pages/api/auth/login.ts`

**Odpowiedzialności**:
- Walidacja danych wejściowych (email, hasło)
- Wywołanie Supabase Auth `signInWithPassword()`
- Ustawienie sesji w cookie
- Zwrócenie danych użytkownika

**Request Body**:
```typescript
interface LoginCommand {
  email: string;
  password: string;
}
```

**Schemat walidacji**:
```typescript
const LoginCommandSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});
```

**Implementacja**:
```typescript
export const POST: APIRoute = async (context) => {
  try {
    // 1. Parse i walidacja
    const body = await context.request.json();
    const validation = LoginCommandSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { email, password } = validation.data;
    const supabase = context.locals.supabase;
    
    // 2. Wywołanie Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // 3. Obsługa błędów
    if (error) {
      // Nieprawidłowe credentials
      if (error.message.includes('Invalid login credentials')) {
        return new Response(
          JSON.stringify({
            error: 'Invalid credentials',
            message: 'Nieprawidłowy email lub hasło',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Email niezweryfikowany
      if (error.message.includes('Email not confirmed')) {
        return new Response(
          JSON.stringify({
            error: 'Email not verified',
            message: 'Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email.',
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Inny błąd
      console.error('Supabase signIn error:', error);
      return new Response(
        JSON.stringify({
          error: 'Login failed',
          message: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 4. Sukces - sesja jest automatycznie ustawiona przez Supabase
    return new Response(
      JSON.stringify({
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/login:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Odpowiedzi**:
- **200 OK**: Logowanie zakończone sukcesem, sesja ustawiona
- **400 Bad Request**: Błąd walidacji
- **401 Unauthorized**: Nieprawidłowy email lub hasło
- **403 Forbidden**: Email niezweryfikowany
- **500 Internal Server Error**: Błąd serwera

#### 3.1.3 `POST /api/auth/reset-password` (NOWY)
**Lokalizacja**: `/src/pages/api/auth/reset-password.ts`

**Odpowiedzialności**:
- Walidacja adresu email
- Wywołanie Supabase Auth `resetPasswordForEmail()`
- Wysłanie emaila z linkiem resetującym
- Zwrócenie potwierdzenia

**Request Body**:
```typescript
interface ResetPasswordCommand {
  email: string;
}
```

**Schemat walidacji**:
```typescript
const ResetPasswordCommandSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
});
```

**Implementacja**:
```typescript
export const POST: APIRoute = async (context) => {
  try {
    // 1. Parse i walidacja
    const body = await context.request.json();
    const validation = ResetPasswordCommandSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { email } = validation.data;
    const supabase = context.locals.supabase;
    
    // 2. Wywołanie Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${context.url.origin}/reset-password`,
    });
    
    // 3. Zawsze zwracamy sukces (security best practice - nie ujawniamy czy email istnieje)
    if (error) {
      console.error('Supabase resetPasswordForEmail error:', error);
    }
    
    return new Response(
      JSON.stringify({
        message: 'If an account exists with this email, a password reset link has been sent.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/reset-password:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Odpowiedzi**:
- **200 OK**: Zawsze (nawet jeśli email nie istnieje - security best practice)
- **400 Bad Request**: Błąd walidacji
- **500 Internal Server Error**: Błąd serwera

#### 3.1.4 `POST /api/auth/update-password` (NOWY)
**Lokalizacja**: `/src/pages/api/auth/update-password.ts`

**Odpowiedzialności**:
- Walidacja nowego hasła
- Wywołanie Supabase Auth `updateUser()` z nowym hasłem
- Zwrócenie potwierdzenia

**Request Body**:
```typescript
interface UpdatePasswordCommand {
  password: string;
}
```

**Schemat walidacji**:
```typescript
const UpdatePasswordCommandSchema = z.object({
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});
```

**Implementacja**:
```typescript
export const POST: APIRoute = async (context) => {
  try {
    // 1. Parse i walidacja
    const body = await context.request.json();
    const validation = UpdatePasswordCommandSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.error.errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { password } = validation.data;
    const supabase = context.locals.supabase;
    
    // 2. Sprawdzenie czy użytkownik jest zalogowany (sesja recovery)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Sesja wygasła. Poproś o nowy link resetujący.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 3. Aktualizacja hasła
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      console.error('Supabase updateUser error:', error);
      return new Response(
        JSON.stringify({
          error: 'Password update failed',
          message: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 4. Sukces
    return new Response(
      JSON.stringify({
        message: 'Password updated successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/auth/update-password:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Odpowiedzi**:
- **200 OK**: Hasło zaktualizowane pomyślnie
- **400 Bad Request**: Błąd walidacji
- **401 Unauthorized**: Brak sesji recovery lub sesja wygasła
- **500 Internal Server Error**: Błąd serwera

### 3.2 Middleware - zarządzanie sesją

#### 3.2.1 Rozszerzenie `/src/middleware/index.ts`

**Obecna funkcjonalność**:
- Dodanie klienta Supabase do `context.locals`

**Wymagane rozszerzenia**:
- Inicjalizacja sesji z cookie (jeśli istnieje)
- Odświeżenie tokenu sesji jeśli wygasł
- Dodanie informacji o użytkowniku do `context.locals`
- Ochrona chronionych ścieżek (redirect na `/login` jeśli brak sesji)

**Implementacja**:
```typescript
import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';

// Ścieżki wymagające autentykacji
const PROTECTED_ROUTES = [
  '/dashboard',
  '/decks',
  '/flashcards',
  '/generate',
  '/study',
  '/api/decks',
  '/api/flashcards',
  '/api/generation-requests',
  '/api/study-sessions',
];

// Ścieżki dostępne tylko dla niezalogowanych
const AUTH_ONLY_ROUTES = [
  '/login',
  '/register',
];

export const onRequest = defineMiddleware(async (context, next) => {
  // 1. Utworzenie klienta Supabase z obsługą SSR
  const supabase = createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookies: {
        get(key) {
          return context.cookies.get(key)?.value;
        },
        set(key, value, options) {
          context.cookies.set(key, value, options);
        },
        remove(key, options) {
          context.cookies.delete(key, options);
        },
      },
    }
  );
  
  // 2. Pobranie sesji (automatycznie odświeża token jeśli potrzeba)
  const { data: { session } } = await supabase.auth.getSession();
  
  // 3. Dodanie do context.locals
  context.locals.supabase = supabase;
  context.locals.session = session;
  context.locals.user = session?.user ?? null;
  
  // 4. Sprawdzenie ochrony ścieżek
  const pathname = context.url.pathname;
  
  // Jeśli ścieżka chroniona i brak sesji -> redirect na login
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !session) {
    return context.redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }
  
  // Jeśli ścieżka auth-only i użytkownik zalogowany -> redirect na dashboard
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(route => pathname === route);
  if (isAuthOnlyRoute && session) {
    return context.redirect('/dashboard');
  }
  
  return next();
});
```

**Typy dla `context.locals`**:
```typescript
// src/env.d.ts
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    session: Session | null;
    user: User | null;
  }
}
```

### 3.3 Migracja z systemu anonimowego

#### 3.3.1 Usunięcie `/src/lib/helpers/userId.ts`

**Obecna funkcjonalność**:
- Funkcja `getOrCreateUserId()` tworząca anonimowe UUID w cookie

**Plan migracji**:
1. **Faza 1**: Zachować funkcję jako fallback podczas wdrażania auth
2. **Faza 2**: Zastąpić wszystkie wywołania `getOrCreateUserId()` przez `context.locals.user.id`
3. **Faza 3**: Usunąć plik i funkcję po pełnej migracji

**Przykład migracji w API endpoint**:
```typescript
// PRZED (z anonimowym userId)
const userId = getOrCreateUserId(context.cookies);

// PO (z rzeczywistym auth)
const userId = context.locals.user?.id;
if (!userId) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}
```

#### 3.3.2 Aktualizacja wszystkich API endpoints

**Lokalizacje do aktualizacji**:
- `/src/pages/api/dashboard.ts`
- `/src/pages/api/decks/*.ts`
- `/src/pages/api/flashcards/*.ts`
- `/src/pages/api/generation-requests/*.ts`
- `/src/pages/api/study-sessions/*.ts`

**Wzorzec aktualizacji**:
```typescript
export const GET: APIRoute = async (context) => {
  // Usunąć:
  // const userId = getOrCreateUserId(context.cookies);
  
  // Dodać:
  const userId = context.locals.user?.id;
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Reszta logiki bez zmian
  const supabase = context.locals.supabase;
  // ...
};
```

### 3.4 Obsługa błędów

#### 3.4.1 Typy błędów autentykacji

**Błędy Supabase Auth**:
- `Invalid login credentials` - nieprawidłowy email lub hasło
- `Email not confirmed` - email niezweryfikowany
- `User already registered` - email już istnieje
- `Invalid recovery token` - token resetowania wygasł
- `Weak password` - hasło nie spełnia wymagań (jeśli Supabase ma włączone policy)

**Mapowanie na komunikaty użytkownika**:
```typescript
function mapAuthError(error: AuthError): { status: number; message: string } {
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid login credentials')) {
    return { status: 401, message: 'Nieprawidłowy email lub hasło' };
  }
  
  if (message.includes('email not confirmed')) {
    return { status: 403, message: 'Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email.' };
  }
  
  if (message.includes('already registered')) {
    return { status: 409, message: 'Konto z tym adresem email już istnieje' };
  }
  
  if (message.includes('invalid recovery token')) {
    return { status: 401, message: 'Link wygasł lub jest nieprawidłowy. Poproś o nowy link.' };
  }
  
  // Domyślny błąd
  return { status: 500, message: 'Wystąpił błąd. Spróbuj ponownie.' };
}
```

#### 3.4.2 Logowanie błędów

**Zasady**:
- Wszystkie błędy autentykacji logować do console.error
- Nie logować haseł ani tokenów
- Logować context (endpoint, user ID jeśli dostępny)

**Przykład**:
```typescript
console.error('Auth error in POST /api/auth/login:', {
  endpoint: '/api/auth/login',
  email: email, // OK - email nie jest wrażliwy
  error: error.message,
  // NIE logować: password, token
});
```

### 3.5 Server-Side Rendering (SSR)

#### 3.5.1 Renderowanie stron z uwzględnieniem sesji

**Strony Astro** mogą sprawdzać sesję i renderować różną zawartość:

**Przykład - Dashboard**:
```astro
---
// src/pages/dashboard.astro
import Layout from "@/layouts/Layout.astro";
import DashboardPage from "@/components/dashboard/DashboardPage";

const session = Astro.locals.session;
const user = Astro.locals.user;

// Middleware już przekierował niezalogowanych, ale double-check
if (!session || !user) {
  return Astro.redirect('/login');
}
---

<Layout title="Dashboard - FlashCardMemory">
  <DashboardPage client:load userEmail={user.email} />
</Layout>
```

**Przykład - Strona główna**:
```astro
---
// src/pages/index.astro
const session = Astro.locals.session;

// Jeśli zalogowany, przekieruj na dashboard
if (session) {
  return Astro.redirect('/dashboard');
}

// Jeśli niezalogowany, przekieruj na login
return Astro.redirect('/login');
---
```

#### 3.5.2 Prerender

**Ważne**: Wszystkie strony wymagające autentykacji muszą mieć `export const prerender = false;`

**Strony z `prerender = false`**:
- `/src/pages/dashboard.astro`
- `/src/pages/decks/**/*.astro`
- `/src/pages/flashcards/**/*.astro`
- `/src/pages/generate/**/*.astro`
- `/src/pages/study/**/*.astro`
- Wszystkie `/src/pages/api/**/*.ts`

**Strony z `prerender = true` (opcjonalnie)**:
- Strony publiczne, które nie wymagają sesji (brak w MVP)

---

## 4. SYSTEM AUTENTYKACJI

### 4.1 Supabase Auth - architektura

#### 4.1.1 Mechanizm sesji

**Token JWT**:
- Supabase Auth używa JWT (JSON Web Token) do przechowywania sesji
- Token zawiera: user ID, email, role, expiration time
- Token jest przechowywany w cookie (httpOnly, secure, sameSite)
- Nazwa cookie: `sb-<project-ref>-auth-token`

**Refresh Token**:
- Długotrwały token do odświeżania access token
- Przechowywany w osobnym cookie
- Automatycznie używany przez Supabase SDK do odświeżenia sesji

**Czas życia**:
- Access Token: 1 godzina (domyślnie)
- Refresh Token: 30 dni (domyślnie)
- Automatyczne odświeżanie przez middleware

#### 4.1.2 Flow rejestracji z weryfikacją email

```
1. Użytkownik wypełnia formularz rejestracji
   ↓
2. Frontend wywołuje POST /api/auth/register
   ↓
3. Backend wywołuje supabase.auth.signUp()
   ↓
4. Supabase:
   - Tworzy użytkownika w tabeli auth.users (status: unconfirmed)
   - Generuje token weryfikacyjny
   - Wysyła email z linkiem: https://app.com/auth/callback?token=...&type=signup
   ↓
5. Użytkownik klika link w emailu
   ↓
6. Przeglądarka otwiera /auth/callback?token=...&type=signup
   ↓
7. Strona callback wywołuje supabase.auth.verifyOtp()
   ↓
8. Supabase:
   - Weryfikuje token
   - Zmienia status użytkownika na confirmed
   - Tworzy sesję (JWT)
   - Ustawia cookie sesji
   ↓
9. Użytkownik jest przekierowany na /dashboard (zalogowany)
```

#### 4.1.3 Flow logowania

```
1. Użytkownik wypełnia formularz logowania
   ↓
2. Frontend wywołuje POST /api/auth/login
   ↓
3. Backend wywołuje supabase.auth.signInWithPassword()
   ↓
4. Supabase:
   - Weryfikuje email i hasło
   - Sprawdza czy email jest potwierdzony
   - Tworzy sesję (JWT)
   - Ustawia cookie sesji
   ↓
5. Backend zwraca sukces
   ↓
6. Frontend przekierowuje na /dashboard
```

#### 4.1.4 Flow resetowania hasła

```
1. Użytkownik wpisuje email na /reset-password
   ↓
2. Frontend wywołuje POST /api/auth/reset-password
   ↓
3. Backend wywołuje supabase.auth.resetPasswordForEmail()
   ↓
4. Supabase:
   - Generuje token recovery
   - Wysyła email z linkiem: https://app.com/reset-password?token=...&type=recovery
   ↓
5. Użytkownik klika link w emailu
   ↓
6. Przeglądarka otwiera /reset-password?token=...&type=recovery
   ↓
7. Strona weryfikuje token (server-side)
   ↓
8. Użytkownik wpisuje nowe hasło
   ↓
9. Frontend wywołuje POST /api/auth/update-password
   ↓
10. Backend wywołuje supabase.auth.updateUser({ password })
   ↓
11. Supabase aktualizuje hasło
   ↓
12. Użytkownik jest przekierowany na /login
```

#### 4.1.5 Flow wylogowania

```
1. Użytkownik klika "Wyloguj"
   ↓
2. Przeglądarka przechodzi na /logout
   ↓
3. Strona wywołuje supabase.auth.signOut()
   ↓
4. Supabase:
   - Unieważnia sesję
   - Usuwa cookie sesji
   ↓
5. Użytkownik jest przekierowany na /login
```

### 4.2 Konfiguracja Supabase Auth

#### 4.2.1 Ustawienia projektu Supabase

**Authentication Settings** (w Supabase Dashboard):
- **Enable Email Confirmations**: ✓ Włączone (wymagana weryfikacja email)
- **Enable Email Provider**: ✓ Włączone
- **Disable Sign-ups**: ✗ Wyłączone (rejestracja dostępna)
- **Site URL**: `https://flashcardsmemory.com` (produkcja) lub `http://localhost:4321` (dev)
- **Redirect URLs**: 
  - `https://flashcardsmemory.com/auth/callback`
  - `https://flashcardsmemory.com/reset-password`
  - `http://localhost:4321/auth/callback` (dev)
  - `http://localhost:4321/reset-password` (dev)

#### 4.2.2 Email Templates

**Szablon weryfikacji email** (Confirm signup):
```
Subject: Potwierdź swoje konto w FlashCardMemory

Cześć!

Dziękujemy za rejestrację w FlashCardMemory. Kliknij w poniższy link, aby aktywować swoje konto:

{{ .ConfirmationURL }}

Link jest ważny przez 24 godziny.

Jeśli nie zakładałeś konta, zignoruj ten email.

Pozdrawiamy,
Zespół FlashCardMemory
```

**Szablon resetowania hasła** (Reset password):
```
Subject: Zresetuj hasło do FlashCardMemory

Cześć!

Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta. Kliknij w poniższy link, aby ustawić nowe hasło:

{{ .ConfirmationURL }}

Link jest ważny przez 24 godziny.

Jeśli nie prosiłeś o reset hasła, zignoruj ten email.

Pozdrawiamy,
Zespół FlashCardMemory
```

#### 4.2.3 Zmienne środowiskowe

**Plik `.env`**:
```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
PUBLIC_APP_URL=http://localhost:4321  # dev
# PUBLIC_APP_URL=https://flashcardsmemory.com  # prod
```

**Typy dla Astro**:
```typescript
// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly PUBLIC_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 4.3 Row Level Security (RLS)

#### 4.3.1 Aktualizacja polityk RLS

**Obecny stan**:
- Polityki RLS używają `user_id = auth.uid()` do filtrowania danych
- Tabele: `decks`, `flashcards`, `generation_requests`, `study_sessions`, `review_events`

**Wymagane zmiany**:
Brak - polityki RLS są już przygotowane na rzeczywistych użytkowników z `auth.users`.

**Weryfikacja polityk**:
```sql
-- Przykład polityki dla tabeli decks
CREATE POLICY "Users can view their own decks"
  ON decks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own decks"
  ON decks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own decks"
  ON decks FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own decks"
  ON decks FOR DELETE
  USING (user_id = auth.uid());
```

**Testowanie RLS**:
```sql
-- Zaloguj się jako konkretny użytkownik (w Supabase SQL Editor)
SET request.jwt.claim.sub = '<user-uuid>';

-- Sprawdź czy widzisz tylko swoje dane
SELECT * FROM decks;
```

### 4.4 Integracja z Supabase SSR

#### 4.4.1 Instalacja pakietu

```bash
npm install @supabase/ssr
```

#### 4.4.2 Utworzenie klienta SSR

**Plik**: `/src/db/supabase.server.ts` (NOWY)

```typescript
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from './database.types';

export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookies: {
        get(key: string) {
          return cookies.get(key)?.value;
        },
        set(key: string, value: string, options: any) {
          cookies.set(key, value, options);
        },
        remove(key: string, options: any) {
          cookies.delete(key, options);
        },
      },
    }
  );
}
```

**Użycie w middleware**:
```typescript
import { createSupabaseServerClient } from '../db/supabase.server';

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.cookies);
  // ...
});
```

### 4.5 Bezpieczeństwo

#### 4.5.1 Ochrona przed atakami

**CSRF (Cross-Site Request Forgery)**:
- Supabase Auth automatycznie zabezpiecza przed CSRF przez tokeny w cookie
- Cookie ustawione z `sameSite: 'lax'`

**XSS (Cross-Site Scripting)**:
- Cookie sesji ustawione z `httpOnly: true` (niedostępne dla JavaScript)
- Sanityzacja danych wejściowych przez Zod
- React automatycznie escapuje dane w JSX

**Brute Force**:
- Supabase Auth ma wbudowane rate limiting (domyślnie: 30 prób/godzinę na IP)
- Opcjonalnie: dodanie CAPTCHA przy logowaniu (poza MVP)

**SQL Injection**:
- Supabase SDK używa prepared statements
- Brak bezpośrednich zapytań SQL w kodzie aplikacji

#### 4.5.2 Hasła

**Wymagania**:
- Minimalna długość: 8 znaków
- Brak wymagań dotyczących złożoności w MVP
- Hasła hashowane przez Supabase (bcrypt)

**Best practices**:
- Hasła nigdy nie są logowane
- Hasła nie są przechowywane w plain text
- Hasła nie są wysyłane w URL (tylko w body POST)

#### 4.5.3 Tokeny

**Access Token (JWT)**:
- Krótki czas życia (1h)
- Przechowywany w httpOnly cookie
- Automatycznie odświeżany przez middleware

**Refresh Token**:
- Długi czas życia (30 dni)
- Przechowywany w httpOnly cookie
- Używany tylko do odświeżenia access token

**Recovery Token** (reset hasła):
- Jednorazowy token
- Ważny 24 godziny
- Unieważniany po użyciu

---

## 5. PLAN IMPLEMENTACJI

### 5.1 Fazy wdrożenia

#### Faza 1: Przygotowanie infrastruktury (1-2 dni)
1. Konfiguracja Supabase Auth w projekcie Supabase
2. Ustawienie email templates
3. Dodanie redirect URLs
4. Instalacja `@supabase/ssr`
5. Utworzenie `/src/db/supabase.server.ts`
6. Aktualizacja typów w `src/env.d.ts`

#### Faza 2: Middleware i routing (1 dzień)
1. Rozszerzenie `/src/middleware/index.ts` o obsługę sesji
2. Dodanie ochrony chronionych ścieżek
3. Utworzenie `/src/pages/auth/callback.astro`
4. Utworzenie `/src/pages/logout.astro`

#### Faza 3: API endpoints autentykacji (2 dni)
1. Utworzenie `/src/pages/api/auth/register.ts`
2. Utworzenie `/src/pages/api/auth/login.ts`
3. Utworzenie `/src/pages/api/auth/reset-password.ts`
4. Utworzenie `/src/pages/api/auth/update-password.ts`
5. Testowanie endpoints (Postman/curl)

#### Faza 4: Komponenty UI (2-3 dni)
1. Przebudowa `/src/components/auth/LoginPage.tsx`
2. Przebudowa `/src/components/auth/RegisterPage.tsx`
3. Przebudowa `/src/components/auth/ResetPasswordPage.tsx`
4. Utworzenie `/src/components/ui/AuthErrorAlert.tsx`
5. Aktualizacja stron Astro (`login.astro`, `register.astro`, `reset-password.astro`)

#### Faza 5: Nawigacja i layout (1 dzień)
1. Dodanie przycisku wylogowania w `/src/components/dashboard/DashboardHeader.tsx`
2. Aktualizacja `/src/layouts/Layout.astro` (warunkowa nawigacja)
3. Aktualizacja `/src/pages/index.astro` (przekierowanie)

#### Faza 6: Migracja API endpoints (2 dni)
1. Aktualizacja `/src/pages/api/dashboard.ts`
2. Aktualizacja `/src/pages/api/decks/*.ts`
3. Aktualizacja `/src/pages/api/flashcards/*.ts`
4. Aktualizacja `/src/pages/api/generation-requests/*.ts`
5. Aktualizacja `/src/pages/api/study-sessions/*.ts`
6. Usunięcie `/src/lib/helpers/userId.ts`

#### Faza 7: Testowanie (2-3 dni)
1. Testy manualne wszystkich flow autentykacji
2. Testy edge cases (wygasłe tokeny, nieprawidłowe dane)
3. Testy integracyjne (rejestracja → weryfikacja → logowanie → wylogowanie)
4. Testy RLS (sprawdzenie izolacji danych użytkowników)
5. Testy responsywności UI

#### Faza 8: Dokumentacja i deploy (1 dzień)
1. Aktualizacja README.md
2. Dokumentacja zmiennych środowiskowych
3. Deploy na środowisko staging
4. Weryfikacja produkcyjna
5. Deploy na produkcję

**Szacowany czas całkowity**: 12-15 dni roboczych

### 5.2 Kryteria akceptacji

#### Rejestracja (US-001)
- ✓ Formularz rejestracji zawiera email, hasło, potwierdzenie hasła
- ✓ Walidacja formatu email
- ✓ Walidacja minimalnej długości hasła (8 znaków)
- ✓ Sprawdzenie zgodności hasła i potwierdzenia
- ✓ Email weryfikacyjny wysyłany po rejestracji
- ✓ Komunikat o konieczności weryfikacji email
- ✓ Błąd przy próbie rejestracji z istniejącym emailem

#### Logowanie (US-002)
- ✓ Formularz logowania zawiera email i hasło
- ✓ Przekierowanie na dashboard po poprawnym logowaniu
- ✓ Komunikat błędu przy niepoprawnych danych
- ✓ Sesja utrzymywana między odświeżeniami strony
- ✓ Link do formularza rejestracji
- ✓ Link do resetowania hasła

#### Wylogowanie (US-003)
- ✓ Przycisk wylogowania widoczny dla zalogowanych użytkowników
- ✓ Przekierowanie na stronę logowania po wylogowaniu
- ✓ Sesja prawidłowo zakończona
- ✓ Przekierowanie na logowanie przy próbie dostępu do chronionych stron

#### Resetowanie hasła (US-004)
- ✓ Formularz resetowania wymaga podania email
- ✓ Email z linkiem resetującym wysyłany
- ✓ Link ważny przez 24 godziny
- ✓ Możliwość ustawienia nowego hasła po kliknięciu w link
- ✓ Potwierdzenie pomyślnej zmiany hasła

### 5.3 Testy do wykonania

#### Testy funkcjonalne

**Test 1: Rejestracja nowego użytkownika**
```
1. Otwórz /register
2. Wpisz email: test@example.com
3. Wpisz hasło: TestPass123
4. Wpisz potwierdzenie: TestPass123
5. Kliknij "Zarejestruj się"
6. Sprawdź komunikat sukcesu
7. Sprawdź email (skrzynka pocztowa)
8. Kliknij link weryfikacyjny
9. Sprawdź przekierowanie na /dashboard
```

**Test 2: Logowanie istniejącego użytkownika**
```
1. Otwórz /login
2. Wpisz email: test@example.com
3. Wpisz hasło: TestPass123
4. Kliknij "Zaloguj się"
5. Sprawdź przekierowanie na /dashboard
6. Odśwież stronę
7. Sprawdź czy sesja utrzymana (brak przekierowania na /login)
```

**Test 3: Resetowanie hasła**
```
1. Otwórz /reset-password
2. Wpisz email: test@example.com
3. Kliknij "Wyślij link resetujący"
4. Sprawdź komunikat sukcesu
5. Sprawdź email
6. Kliknij link resetujący
7. Wpisz nowe hasło: NewPass456
8. Wpisz potwierdzenie: NewPass456
9. Kliknij "Zmień hasło"
10. Sprawdź przekierowanie na /login
11. Zaloguj się nowym hasłem
```

**Test 4: Wylogowanie**
```
1. Zaloguj się
2. Przejdź na /dashboard
3. Kliknij "Wyloguj"
4. Sprawdź przekierowanie na /login
5. Spróbuj wejść na /dashboard
6. Sprawdź przekierowanie na /login
```

#### Testy walidacji

**Test 5: Błędny format email**
```
1. Otwórz /register
2. Wpisz email: invalid-email
3. Wpisz hasło: TestPass123
4. Wpisz potwierdzenie: TestPass123
5. Kliknij "Zarejestruj się"
6. Sprawdź błąd: "Nieprawidłowy format email"
```

**Test 6: Hasło za krótkie**
```
1. Otwórz /register
2. Wpisz email: test@example.com
3. Wpisz hasło: short
4. Wpisz potwierdzenie: short
5. Kliknij "Zarejestruj się"
6. Sprawdź błąd: "Hasło musi mieć minimum 8 znaków"
```

**Test 7: Niezgodne hasła**
```
1. Otwórz /register
2. Wpisz email: test@example.com
3. Wpisz hasło: TestPass123
4. Wpisz potwierdzenie: DifferentPass456
5. Kliknij "Zarejestruj się"
6. Sprawdź błąd: "Hasła muszą być identyczne"
```

#### Testy bezpieczeństwa

**Test 8: Dostęp do chronionych stron bez logowania**
```
1. Wyloguj się (jeśli zalogowany)
2. Spróbuj wejść na /dashboard
3. Sprawdź przekierowanie na /login?redirect=/dashboard
4. Zaloguj się
5. Sprawdź przekierowanie na /dashboard
```

**Test 9: Email już istnieje**
```
1. Zarejestruj użytkownika test@example.com
2. Spróbuj zarejestrować ponownie test@example.com
3. Sprawdź błąd: "Konto z tym adresem email już istnieje"
```

**Test 10: Nieprawidłowe credentials**
```
1. Otwórz /login
2. Wpisz email: test@example.com
3. Wpisz hasło: WrongPassword
4. Kliknij "Zaloguj się"
5. Sprawdź błąd: "Nieprawidłowy email lub hasło"
```

#### Testy RLS

**Test 11: Izolacja danych użytkowników**
```
1. Zarejestruj użytkownika A (userA@example.com)
2. Zaloguj się jako A
3. Utwórz talię "Talia A"
4. Wyloguj się
5. Zarejestruj użytkownika B (userB@example.com)
6. Zaloguj się jako B
7. Przejdź na /decks
8. Sprawdź że "Talia A" NIE jest widoczna
9. Utwórz talię "Talia B"
10. Sprawdź że tylko "Talia B" jest widoczna
```

### 5.4 Rollback plan

W przypadku krytycznych problemów po wdrożeniu:

**Opcja 1: Tymczasowe wyłączenie autentykacji**
1. Przywrócenie funkcji `getOrCreateUserId()` w middleware
2. Usunięcie sprawdzania sesji w middleware
3. Deploy hotfix

**Opcja 2: Pełny rollback**
1. Przywrócenie poprzedniej wersji z git
2. Deploy poprzedniej wersji
3. Analiza problemów
4. Naprawa i ponowne wdrożenie

---

## 6. PODSUMOWANIE

### 6.1 Kluczowe komponenty

**Frontend (Astro + React)**:
- 3 strony Astro: `login.astro`, `register.astro`, `reset-password.astro`
- 2 nowe strony Astro: `auth/callback.astro`, `logout.astro`
- 3 komponenty React: `LoginPage.tsx`, `RegisterPage.tsx`, `ResetPasswordPage.tsx`
- 1 nowy komponent: `AuthErrorAlert.tsx`
- Aktualizacja: `DashboardHeader.tsx`, `Layout.astro`

**Backend (API Endpoints)**:
- 4 nowe endpointy: `/api/auth/register`, `/api/auth/login`, `/api/auth/reset-password`, `/api/auth/update-password`
- Aktualizacja wszystkich istniejących API endpoints (migracja z anonimowego userId)

**Middleware**:
- Rozszerzenie `/src/middleware/index.ts` o obsługę sesji Supabase
- Ochrona chronionych ścieżek
- Automatyczne odświeżanie tokenów

**Supabase**:
- Konfiguracja Supabase Auth
- Email templates
- Row Level Security (już gotowe)

### 6.2 Zależności

**Nowe pakiety**:
- `@supabase/ssr` - obsługa Supabase w środowisku SSR

**Istniejące pakiety** (bez zmian):
- `@supabase/supabase-js` - klient Supabase
- `zod` - walidacja danych
- `react` - komponenty UI
- `astro` - framework

### 6.3 Wpływ na istniejącą funkcjonalność

**Bez zmian**:
- Struktura bazy danych (tabele, RLS)
- Logika biznesowa (serwisy w `/src/lib/services`)
- Komponenty UI (poza auth i nawigacją)
- Algorytm FSRS
- Generowanie fiszek AI

**Wymagane zmiany**:
- Wszystkie API endpoints - migracja z `getOrCreateUserId()` na `context.locals.user.id`
- Middleware - dodanie obsługi sesji
- Nawigacja - dodanie przycisku wylogowania
- Strony Astro - sprawdzanie sesji

**Kompatybilność wsteczna**:
- Brak - po wdrożeniu autentykacji wszyscy użytkownicy muszą się zarejestrować
- Istniejące dane anonimowych użytkowników (z cookie) nie będą migrowane
- Opcjonalnie: skrypt migracji danych (poza zakresem MVP)

### 6.4 Metryki sukcesu

**Techniczne**:
- 100% testów funkcjonalnych przechodzi
- Czas logowania < 2 sekundy
- Czas rejestracji < 3 sekundy
- Brak błędów 500 w logach
- RLS działa poprawnie (izolacja danych)

**Biznesowe** (z PRD):
- Użytkownicy mogą się zarejestrować i zalogować
- Email weryfikacyjny dociera w < 1 minucie
- Resetowanie hasła działa w 100% przypadków
- Sesja utrzymywana między odświeżeniami

### 6.5 Dokumentacja dla developerów

**README.md** - dodać sekcję:
```markdown
## Autentykacja

Aplikacja używa Supabase Auth do zarządzania użytkownikami.

### Zmienne środowiskowe
- `SUPABASE_URL` - URL projektu Supabase
- `SUPABASE_KEY` - Anon key z Supabase
- `PUBLIC_APP_URL` - URL aplikacji (do redirect URLs)

### Lokalne uruchomienie
1. Skopiuj `.env.example` do `.env`
2. Wypełnij zmienne środowiskowe
3. Uruchom `npm run dev`

### Testowanie
- Email weryfikacyjny: sprawdź Supabase Dashboard > Authentication > Email Templates
- Reset hasła: sprawdź Supabase Dashboard > Authentication > Users
```

**Dokumentacja API** - dodać do `/docs/api.md`:
```markdown
## Autentykacja

### POST /api/auth/register
Rejestracja nowego użytkownika.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Odpowiedzi:**
- 201: Rejestracja zakończona sukcesem
- 400: Błąd walidacji
- 409: Email już istnieje
- 500: Błąd serwera

### POST /api/auth/login
Logowanie użytkownika.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Odpowiedzi:**
- 200: Logowanie zakończone sukcesem
- 400: Błąd walidacji
- 401: Nieprawidłowe credentials
- 403: Email niezweryfikowany
- 500: Błąd serwera

[...]
```

---

## 7. ZAŁĄCZNIKI

### 7.1 Przykładowe requesty/responses

#### POST /api/auth/register

**Request:**
```http
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Response (409 Conflict):**
```json
{
  "error": "Email already exists",
  "message": "Konto z tym adresem email już istnieje"
}
```

#### POST /api/auth/login

**Request:**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials",
  "message": "Nieprawidłowy email lub hasło"
}
```

### 7.2 Diagramy przepływów

#### Diagram: Rejestracja użytkownika
```
[Użytkownik] -> [/register] -> [RegisterPage.tsx]
                                      |
                                      v
                              [Walidacja Zod]
                                      |
                                      v
                           [POST /api/auth/register]
                                      |
                                      v
                          [supabase.auth.signUp()]
                                      |
                    +------------------+------------------+
                    |                                     |
                    v                                     v
              [Sukces]                              [Błąd]
                    |                                     |
                    v                                     v
        [Wysłanie email]                    [Zwrot błędu 409/500]
                    |                                     |
                    v                                     v
        [Komunikat sukcesu]                  [Wyświetlenie błędu]
                    |
                    v
        [Użytkownik otwiera email]
                    |
                    v
        [Kliknięcie w link]
                    |
                    v
        [/auth/callback?code=...]
                    |
                    v
        [Weryfikacja kodu]
                    |
                    v
        [Utworzenie sesji]
                    |
                    v
        [Przekierowanie na /dashboard]
```

#### Diagram: Logowanie użytkownika
```
[Użytkownik] -> [/login] -> [LoginPage.tsx]
                                   |
                                   v
                           [Walidacja Zod]
                                   |
                                   v
                        [POST /api/auth/login]
                                   |
                                   v
                   [supabase.auth.signInWithPassword()]
                                   |
                 +------------------+------------------+
                 |                                     |
                 v                                     v
           [Sukces]                              [Błąd]
                 |                                     |
                 v                                     v
      [Utworzenie sesji]                  [Zwrot błędu 401/403]
                 |                                     |
                 v                                     v
      [Ustawienie cookie]                 [Wyświetlenie błędu]
                 |
                 v
      [Przekierowanie na /dashboard]
```

### 7.3 Checklist wdrożeniowa

**Przed wdrożeniem**:
- [ ] Konfiguracja Supabase Auth (email templates, redirect URLs)
- [ ] Ustawienie zmiennych środowiskowych
- [ ] Instalacja `@supabase/ssr`
- [ ] Testy lokalne (wszystkie scenariusze)
- [ ] Code review
- [ ] Aktualizacja dokumentacji

**Podczas wdrożenia**:
- [ ] Deploy na staging
- [ ] Testy na staging (wszystkie scenariusze)
- [ ] Weryfikacja email templates (sprawdzenie dostarczalności)
- [ ] Testy RLS (izolacja danych)
- [ ] Deploy na produkcję
- [ ] Smoke tests na produkcji

**Po wdrożeniu**:
- [ ] Monitoring błędów (logi)
- [ ] Monitoring metryk (czas logowania, rejestracji)
- [ ] Sprawdzenie dostarczalności emaili
- [ ] Komunikat dla użytkowników (jeśli potrzebny)
- [ ] Dokumentacja dla supportu

---

## 8. KONTAKT I WSPARCIE

### 8.1 Osoby odpowiedzialne

**Tech Lead**: [Imię Nazwisko]
- Odpowiedzialny za: Architekturę, code review, decyzje techniczne

**Backend Developer**: [Imię Nazwisko]
- Odpowiedzialny za: API endpoints, middleware, integrację z Supabase

**Frontend Developer**: [Imię Nazwisko]
- Odpowiedzialny za: Komponenty React, strony Astro, UX

**QA Engineer**: [Imię Nazwisko]
- Odpowiedzialny za: Testy funkcjonalne, testy bezpieczeństwa, testy RLS

### 8.2 Harmonogram spotkań

**Daily Standup**: Codziennie 10:00 (15 min)
- Status implementacji
- Blokery
- Plan na dzień

**Code Review**: Na bieżąco (PR)
- Każdy PR wymaga review przed merge
- Checklist: testy, dokumentacja, linter

**Demo**: Co 3 dni
- Prezentacja zaimplementowanych funkcjonalności
- Feedback od stakeholderów

**Retrospektywa**: Po zakończeniu wdrożenia
- Co poszło dobrze
- Co można poprawić
- Lessons learned

---

**Koniec specyfikacji**

Wersja: 1.0  
Data: 2026-02-01  
Autor: AI Assistant  
Status: Do akceptacji
