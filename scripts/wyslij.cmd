@echo off
rem Skrot do scripts\wyslij.ps1.
rem
rem PO CO: Windows domyslnie nie pozwala uruchamiac wlasnych skryptow .ps1
rem (Execution Policy). Zamiast zmieniac ustawienie calego systemu, ten plik
rem uruchamia skrypt z jednorazowym pominieciem - nic poza tym wywolaniem
rem sie nie zmienia.
rem
rem UWAGA NA KONCE LINII: ten plik MUSI miec windowsowe CRLF. Przy uniksowych
rem cmd.exe rozjezdza sie na pierwszym komentarzu i zglasza "'Skrot' is not
rem recognized as an internal or external command" - blad, ktory wyglada jak
rem problem ze sciezka, a jest problemem z zapisem pliku. Pilnuje tego wpis
rem *.cmd w .gitattributes.
rem
rem UZYCIE - dokladnie tak jak .ps1, tylko krocej:
rem   scripts\wyslij.cmd -Diagnoza
rem   scripts\wyslij.cmd -Wiadomosc "id-wiadomosci"
rem   scripts\wyslij.cmd -Wiadomosc "id" -TylkoEmail "ja@example.pl" -Wyslij

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0wyslij.ps1" %*
