
# Dodanie karty "Menadżer Fermy Drobiu" do Narzędzi

## Co robimy
Zastąpimy pierwszy placeholder "Wkrótce" na stronie Narzędzia nową kartą z opisem aplikacji Hodowla Drobiu PWA i linkiem do zewnętrznego wdrożenia.

## Zmiany

### 1. Edycja `src/pages/Narzedzia.tsx`
- Zamienię pierwszy placeholder (linie 352-367) na pełną kartę narzędzia "Menadżer Fermy Drobiu"
- Ikona: `Bird` z lucide-react (lub emoji 🐔)
- Gradient: fioletowy (`from-purple-500 to-violet-600`)
- Opis: zarządzanie stadami drobiu, dziennik codzienny, pasze, zdrowie, ważenia, ubój, sprzedaż, finanse i raporty
- Lista funkcji: stada i partie, dziennik codzienny, pasze i żywienie, finanse i raporty
- Przycisk "Otwórz Aplikację" z linkiem do `https://hodowla-drobiu-pwa.vercel.app` (lub inny URL, który podasz po wdrożeniu)
- ReactionButton z `contentId="menedzer-fermy-drobiu"`
- Dodam znacznik `target="_blank"` na linku (otwiera w nowej karcie)

### 2. Aktualizacja TLDRSection
- Dodanie punktu o Menadżerze Fermy Drobiu do listy TL;DR

### Uwaga
Będziesz musiał wdrożyć aplikację hodowla-drobiu-pwa na Vercel/Netlify i podać mi URL — na razie wstawię placeholder URL, który łatwo podmienisz.
