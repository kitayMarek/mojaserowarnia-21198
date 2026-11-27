// Trasy aplikacji React wyjęte z tekstu src/App.tsx (20.11.2026, poprawka miękkiego 404).
// Działa na samym tekście, więc test w Node i worker liczą to samo.

let pamiec = null;

/** Wzorce tras z App.tsx: absolutne oraz zagnieżdżone pod rodzicem (np. /dashboard/ewidencja). */
export function trasyZAplikacji(zrodlo) {
  const trasy = [];
  const rodzice = [];
  for (const linia of zrodlo.split(/\r?\n/)) {
    const zamkniecie = /<\/Route>/.test(linia);
    const m = linia.match(/<Route\s[^>]*path="([^"]+)"/);
    if (m && m[1] !== '*') {
      const p = m[1].startsWith('/') ? m[1] : `${rodzice.at(-1) ?? ''}/${m[1]}`;
      trasy.push(p.toLowerCase());
      // Trasa z dziećmi: znacznik nie jest samozamykający i nie zamyka się w tej linii.
      if (!/\/>\s*$/.test(linia) && !zamkniecie) rodzice.push(p);
    } else if (zamkniecie) {
      rodzice.pop();
    }
  }
  return trasy;
}

function dopasuj(wzorzec, sciezka) {
  const a = wzorzec.split('/').filter(Boolean);
  const b = sciezka.split('/').filter(Boolean);
  if (a.length !== b.length) return false;
  return a.every((cz, i) => cz.startsWith(':') || cz === b[i]);
}

/** Czy ścieżka (bez końcowego ukośnika) to trasa aplikacji. */
export function czyTrasaAplikacji(zrodlo, sciezka) {
  return trasaAplikacji(zrodlo, sciezka) !== null;
}

/**
 * Wzorzec trasy, do którego pasuje ścieżka, albo null. Trasa stała wygrywa z trasą z parametrem,
 * tak jak w React Router („/kultury/mezofilne” przed „/kultury/:slug”). Od 27.11.2026: worker
 * po wzorcu z parametrem sprawdza, czy taka kultura albo przepis w ogóle istnieje.
 */
export function trasaAplikacji(zrodlo, sciezka) {
  if (!pamiec || pamiec.zrodlo !== zrodlo) pamiec = { zrodlo, trasy: trasyZAplikacji(zrodlo) };
  let s;
  try { s = decodeURIComponent(sciezka).toLowerCase(); } catch { return null; }
  if (s === '/') return '/';
  const pasujace = pamiec.trasy.filter((w) => dopasuj(w, s));
  return pasujace.find((w) => !w.includes(':')) ?? pasujace[0] ?? null;
}
