/**
 * Wyłącznik panelu pytań (p. 6 zlecenia: „możliwy do wyłączenia jedną zmianą konfiguracji").
 *
 * Ustawienie na `false` zdejmuje panel z WSZYSTKICH tras React. Warstwę statyczną
 * wyłącza się osobno: `python scripts/gen-panel-pytan.py --usun` — mirrory nie czytają
 * kodu aplikacji, więc jeden przełącznik nie mógłby objąć obu warstw.
 */
export const PANEL_PYTAN_WLACZONY = true;
