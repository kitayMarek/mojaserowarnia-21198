# Sprawdza, czy zdjecie zawiera metadane EXIF - w szczegolnosci GPS.
#
# Po co: zdjecia z telefonu niosa wspolrzedne miejsca, gdzie zostaly zrobione.
# Dla gospodarstwa to zwykle takze adres zamieszkania. Aplikacja czysci EXIF
# po stronie przegladarki (src/lib/image.ts), a ten skrypt to weryfikuje.
#
# UWAGA: plik celowo w czystym ASCII. PowerShell 5.1 czyta skrypty jako ANSI,
# wiec polskie znaki i myslniki typograficzne rozwalaja skladnie.
#
# Uzycie:
#   powershell -ExecutionPolicy Bypass -File scripts/sprawdz-exif.ps1 "C:\sciezka\zdjecie.jpg"
#
# Jak zdobyc plik do sprawdzenia:
#   1. Wgraj zdjecie PROSTO Z TELEFONU do wizytowki (nie przerobione).
#   2. Otworz wizytowke, kliknij zdjecie prawym -> "Zapisz obraz jako".
#   3. Uruchom ten skrypt na zapisanym pliku.

param([Parameter(Mandatory = $true)][string]$Plik)

if (-not (Test-Path $Plik)) {
    Write-Host "Nie znaleziono pliku: $Plik" -ForegroundColor Red
    exit 1
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile((Resolve-Path $Plik).Path)

try {
    $rozmiar = (Get-Item $Plik).Length
    Write-Host ""
    Write-Host "Plik:     $(Split-Path $Plik -Leaf)"
    if ($rozmiar -gt 500KB) {
        Write-Host "Rozmiar:  $([Math]::Round($rozmiar/1KB)) KB   <-- powyzej 500 KB, kompresja mogla nie zadzialac" -ForegroundColor Yellow
    } else {
        Write-Host "Rozmiar:  $([Math]::Round($rozmiar/1KB)) KB   OK" -ForegroundColor Green
    }
    Write-Host "Wymiary:  $($img.Width) x $($img.Height)"
    Write-Host ""

    # Identyfikatory pol EXIF wg specyfikacji
    $GPS   = 0x8825   # GPS IFD - wskaznik na blok wspolrzednych
    $MARKA = 0x010F   # Make - producent aparatu/telefonu
    $MODEL = 0x0110   # Model
    $DATA  = 0x9003   # DateTimeOriginal

    $ids = $img.PropertyIdList
    $znalezione = @()

    if ($ids -contains $GPS)   { $znalezione += "GPS (wspolrzedne!)" }
    if ($ids -contains $MARKA) { $znalezione += "Make (marka urzadzenia)" }
    if ($ids -contains $MODEL) { $znalezione += "Model urzadzenia" }
    if ($ids -contains $DATA)  { $znalezione += "DateTimeOriginal" }

    Write-Host "Liczba pol metadanych: $($ids.Count)"
    Write-Host ""

    if ($znalezione.Count -eq 0) {
        Write-Host "WYNIK: CZYSTO" -ForegroundColor Green
        Write-Host "Brak GPS, marki urzadzenia i daty wykonania." -ForegroundColor Green
        Write-Host "Czyszczenie EXIF dziala poprawnie."
    } else {
        Write-Host "WYNIK: ZNALEZIONO METADANE" -ForegroundColor Red
        foreach ($z in $znalezione) { Write-Host "   - $z" -ForegroundColor Red }
        Write-Host ""
        Write-Host "Jesli na liscie jest GPS, NATYCHMIAST wstrzymaj publikacje zdjec." -ForegroundColor Red
        Write-Host "Czyszczenie EXIF nie zadzialalo." -ForegroundColor Red
    }
    Write-Host ""
}
finally {
    $img.Dispose()
}
