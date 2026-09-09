<#
    Wysylka wiadomosci — nakladka na funkcje brzegowa wyslij-wiadomosc.

    ─────────────────────────────────────────────────────────────────────────
    KLUCZ NIE PRZECHODZI PRZEZ KONSOLE
    ─────────────────────────────────────────────────────────────────────────
    Skrypt czyta go z pliku .klucz-wysylki w katalogu repozytorium (plik jest
    w .gitignore). Dzieki temu klucz nie ląduje w historii polecen, nie widac
    go na zrzucie ekranu i nie da sie go przypadkiem wkleic w rozmowie —
    a tak juz raz wyciekl caly komplet sekretow.

    Zalozenie pliku, raz:
        "TWOJ-KLUCZ" | Set-Content -NoNewline .klucz-wysylki -Encoding utf8

    ─────────────────────────────────────────────────────────────────────────
    DLACZEGO OSOBNY SKRYPT
    ─────────────────────────────────────────────────────────────────────────
    1. PowerShell 5.1 przy kodzie 400 pokazuje samo "Zle zadanie" i POLYKA
       tresc odpowiedzi — a to w niej funkcja pisze, co jest nie tak.
    2. PowerShell przepisuje argumenty przed przekazaniem ich do curl.exe
       i zjada cudzyslowy w srodku JSON-a.

    ─────────────────────────────────────────────────────────────────────────
    UZYCIE
    ─────────────────────────────────────────────────────────────────────────
      .\scripts\wyslij.ps1 -Diagnoza
          Sprawdza po kolei: czy jest klucz, czy funkcja zyje, czy klucz
          pasuje, czy baza ma potrzebne funkcje. NICZEGO nie wysyla i nie
          pokazuje klucza — wynik mozna spokojnie komus pokazac.

      .\scripts\wyslij.ps1 -Wiadomosc "id-wiadomosci"
          Podglad: ile adresow i jak wyglada list. Nic nie wysyla.

      .\scripts\wyslij.ps1 -Wiadomosc "id" -TylkoEmail "ja@example.pl" -Potwierdzenie "Dokladny tytul"
          Proba na jednym adresie.

      .\scripts\wyslij.ps1 -Wiadomosc "id" -Potwierdzenie "Dokladny tytul"
          Do wszystkich uprawnionych.

    Bez -Potwierdzenie skrypt ZAWSZE robi tylko podglad. Tytul musi zgadzac sie
    co do znaku, razem z polskimi ogonkami — najprosciej skopiowac go z wyniku
    podgladu.
#>

param(
    [switch] $Diagnoza,
    [string] $Wiadomosc,
    [string] $TylkoEmail,
    [string] $Potwierdzenie,
    [string] $Adres = "https://hsgxmbhunclhgzumafrk.supabase.co/functions/v1/wyslij-wiadomosc"
)

# PowerShell 5.1 potrafi domyslnie sprobowac starszego protokolu i konczy sie to
# bledem polaczenia, ktory wyglada jak blad funkcji.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$plikKlucza = Join-Path (Split-Path $PSScriptRoot -Parent) ".klucz-wysylki"

function Pobierz-Klucz {
    if (-not (Test-Path $plikKlucza)) { return $null }
    return (Get-Content $plikKlucza -Raw).Trim()
}

function Wyslij-Zadanie($klucz, $cialo) {
    try {
        $odp = Invoke-RestMethod -Method Post -Uri $Adres -Headers @{ "x-klucz-wysylki" = $klucz } -ContentType "application/json" -Body ($cialo | ConvertTo-Json)
        return @{ kod = 200; tresc = $odp }
    }
    catch {
        $r = $_.Exception.Response
        if (-not $r) { return @{ kod = 0; tresc = $_.Exception.Message } }
        $czytnik = New-Object System.IO.StreamReader($r.GetResponseStream())
        return @{ kod = [int]$r.StatusCode; tresc = $czytnik.ReadToEnd() }
    }
}

# ─── DIAGNOZA ────────────────────────────────────────────────────────────────
if ($Diagnoza) {
    Write-Host ""
    Write-Host "  DIAGNOZA WYSYLKI — nic nie zostanie wyslane" -ForegroundColor Cyan
    Write-Host ""

    $klucz = Pobierz-Klucz
    if (-not $klucz) {
        Write-Host "  [1] Klucz .............. BRAK PLIKU" -ForegroundColor Red
        Write-Host ""
        Write-Host "      Zaloz go raz, w katalogu repozytorium:"
        Write-Host '        "TWOJ-KLUCZ" | Set-Content -NoNewline .klucz-wysylki -Encoding utf8'
        Write-Host ""
        Write-Host "      Plik jest w .gitignore, wiec nie trafi do repozytorium."
        return
    }
    Write-Host ("  [1] Klucz .............. wczytany, {0} znakow" -f $klucz.Length) -ForegroundColor Green

    # Czy funkcja w ogole odpowiada — celowo ze ZLYM kluczem.
    $proba = Wyslij-Zadanie "celowo-zly-klucz" @{ wiadomosc_id = "test" }
    if ($proba.kod -eq 0) {
        Write-Host "  [2] Funkcja ............ NIE ODPOWIADA" -ForegroundColor Red
        Write-Host ("      $($proba.tresc)")
        Write-Host "      Wdroz ja: npx supabase functions deploy wyslij-wiadomosc --project-ref hsgxmbhunclhgzumafrk"
        return
    }
    Write-Host "  [2] Funkcja ............ odpowiada (kod $($proba.kod) na zly klucz — tak ma byc)" -ForegroundColor Green

    # Czy NASZ klucz przechodzi.
    $test = Wyslij-Zadanie $klucz @{ }
    if ($test.kod -eq 401) {
        Write-Host "  [3] Twoj klucz ......... ODRZUCONY" -ForegroundColor Red
        Write-Host ""
        Write-Host "      Dwie mozliwe przyczyny, obie czeste:" -ForegroundColor Yellow
        Write-Host "      a) sekret ustawiony na INNYM projekcie. Sprawdz, na ktorym siedzi:"
        Write-Host "           npx supabase secrets list --project-ref hsgxmbhunclhgzumafrk"
        Write-Host "         (pokazuje nazwy i skroty, nie wartosci — mozna to spokojnie pokazac)"
        Write-Host "         Jesli KLUCZ_WYSYLKI tam NIE MA, ustaw go z jawnym projektem:"
        Write-Host "           npx supabase secrets set KLUCZ_WYSYLKI=... --project-ref hsgxmbhunclhgzumafrk"
        Write-Host "      b) w pliku .klucz-wysylki jest co innego niz w sekrecie."
        return
    }
    if ($test.kod -eq 400) {
        Write-Host "  [3] Twoj klucz ......... PRZYJETY" -ForegroundColor Green
        Write-Host "  [4] Baza ............... funkcja doszla do sprawdzania wiadomosci" -ForegroundColor Green
        Write-Host ""
        Write-Host "      Wszystko dziala. Teraz podglad z prawdziwym identyfikatorem:"
        Write-Host "        scripts\wyslij.cmd -Wiadomosc ""ID-WIADOMOSCI"""
        Write-Host ""
        Write-Host "      Identyfikator wyciagniesz w SQL Editorze:"
        Write-Host "        select id, title from public.news_banners where date = date '2026-09-08';"
        return
    }
    Write-Host "  [3] Twoj klucz ......... przyjety, ale funkcja zwrocila kod $($test.kod)" -ForegroundColor Yellow
    Write-Host $test.tresc
    return
}

# ─── PODGLAD / WYSYLKA ───────────────────────────────────────────────────────
if (-not $Wiadomosc) {
    Write-Host ""
    Write-Host "  Podaj -Wiadomosc ""id"" albo uruchom z -Diagnoza." -ForegroundColor Yellow
    Write-Host ""
    return
}

$klucz = Pobierz-Klucz
if (-not $klucz) {
    Write-Host ""
    Write-Host "  Brak pliku .klucz-wysylki. Uruchom z -Diagnoza, zeby zobaczyc jak go zalozyc." -ForegroundColor Red
    Write-Host ""
    return
}

$cialo = @{ wiadomosc_id = $Wiadomosc }

if ($Potwierdzenie) {
    $cialo["akcja"] = "wyslij"
    $cialo["potwierdzenie"] = $Potwierdzenie
    if ($TylkoEmail) { $cialo["tylko_email"] = $TylkoEmail }

    $ilu = if ($TylkoEmail) { "JEDEN adres: $TylkoEmail" } else { "WSZYSTKICH uprawnionych" }
    Write-Host ""
    Write-Host "  Zaraz wysle do: $ilu" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  Tryb podgladu — nic nie zostanie wyslane." -ForegroundColor Cyan
    Write-Host ""
}

$wynik = Wyslij-Zadanie $klucz $cialo
if ($wynik.kod -eq 200) {
    $wynik.tresc | ConvertTo-Json -Depth 5
} else {
    Write-Host "Kod HTTP: $($wynik.kod)" -ForegroundColor Red
    Write-Host "Odpowiedz funkcji:" -ForegroundColor Red
    Write-Host $wynik.tresc
    if ($wynik.kod -eq 401) {
        Write-Host ""
        Write-Host "  Uruchom scripts\wyslij.cmd -Diagnoza — powie, gdzie dokladnie jest problem." -ForegroundColor Yellow
    }
}
