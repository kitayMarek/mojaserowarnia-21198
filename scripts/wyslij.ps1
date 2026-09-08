<#
    Wysylka wiadomosci — nakladka na funkcje brzegowa wyslij-wiadomosc.

    PO CO OSOBNY SKRYPT, SKORO JEST JEDNO ZADANIE HTTP:

    1. PowerShell 5.1 przy kodzie 400 pokazuje samo "Zle zadanie" i POLYKA
       tresc odpowiedzi. A to wlasnie w niej funkcja pisze, co jest nie tak:
       "brakuje wiadomosc_id", "wiadomosc nieopublikowana", "potwierdzenie musi
       byc dokladnym tytulem". Bez tego diagnozuje sie po omacku.

    2. Cudzyslowy. PowerShell przepisuje argumenty przed przekazaniem ich do
       curl.exe i zjada cudzyslowy w srodku JSON-a. Tu skladamy cialo przez
       ConvertTo-Json i problem znika.

    UZYCIE:

      # 1. podglad — NICZEGO NIE WYSYLA
      .\scripts\wyslij.ps1 -Klucz "..." -Wiadomosc "id-wiadomosci"

      # 2. proba na wlasnym adresie
      .\scripts\wyslij.ps1 -Klucz "..." -Wiadomosc "id" -TylkoEmail "ja@example.pl" -Potwierdzenie "Dokladny tytul"

      # 3. do wszystkich
      .\scripts\wyslij.ps1 -Klucz "..." -Wiadomosc "id" -Potwierdzenie "Dokladny tytul"

    Bez -Potwierdzenie skrypt ZAWSZE robi tylko podglad. Tytul musi zgadzac sie
    co do znaku, razem z polskimi ogonkami — najprosciej skopiowac go z wyniku
    podgladu.
#>

param(
    [Parameter(Mandatory = $true)][string] $Klucz,
    [Parameter(Mandatory = $true)][string] $Wiadomosc,
    [string] $TylkoEmail,
    [string] $Potwierdzenie,
    [string] $Adres = "https://hsgxmbhunclhgzumafrk.supabase.co/functions/v1/wyslij-wiadomosc"
)

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

# TLS 1.2 wprost: PowerShell 5.1 potrafi domyslnie probowac starszego protokolu
# i konczy sie to bledem polaczenia, ktory wyglada jak blad funkcji.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

try {
    $odp = Invoke-RestMethod -Method Post -Uri $Adres `
        -Headers @{ "x-klucz-wysylki" = $Klucz } `
        -ContentType "application/json" `
        -Body ($cialo | ConvertTo-Json)

    $odp | ConvertTo-Json -Depth 5
}
catch {
    # Tu jest cala wartosc tego skryptu: wyciagniecie tresci odpowiedzi, ktora
    # Invoke-RestMethod normalnie wyrzuca razem z wyjatkiem.
    $odpowiedz = $_.Exception.Response
    if ($odpowiedz) {
        $czytnik = New-Object System.IO.StreamReader($odpowiedz.GetResponseStream())
        $tresc = $czytnik.ReadToEnd()
        Write-Host ("Kod HTTP: " + [int]$odpowiedz.StatusCode) -ForegroundColor Red
        Write-Host "Odpowiedz funkcji:" -ForegroundColor Red
        Write-Host $tresc
    }
    else {
        Write-Host "Nie udalo sie polaczyc z funkcja:" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}
