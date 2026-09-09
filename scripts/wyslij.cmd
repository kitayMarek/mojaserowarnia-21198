@echo off
rem Skrot do scripts\wyslij.ps1.
rem
rem PO CO: Windows domyslnie nie pozwala uruchamiac wlasnych skryptow .ps1
rem (Execution Policy). Zamiast zmieniac ustawienie calego systemu, ten plik
rem uruchamia skrypt z jednorazowym pominieciem — nic poza tym wywolaniem
rem sie nie zmienia.
rem
rem UZYCIE — dokladnie tak jak .ps1, tylko krocej:
rem   scripts\wyslij.cmd -Diagnoza
rem   scripts\wyslij.cmd -Wiadomosc "id-wiadomosci"
rem   scripts\wyslij.cmd -Wiadomosc "id" -TylkoEmail "ja@example.pl" -Potwierdzenie "Tytul"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0wyslij.ps1" %*
