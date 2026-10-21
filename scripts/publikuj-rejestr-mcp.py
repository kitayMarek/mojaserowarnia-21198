#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Publikacja serwera MCP (dane.mojaserowarnia.pl/mcp) w oficjalnym rejestrze MCP
(registry.modelcontextprotocol.io) pod nazwa pl.mojaserowarnia/baza-kultur.

PO CO: rejestr to odpowiednik zgloszenia strony do Google. Czytaja go katalogi
i klienci MCP. Rejestr trzyma tylko metadane (worker-magazyn/server.json), sam
serwer dalej dziala u nas.

WLASNOSC DOMENY: logowanie "http" rejestru. Na mojaserowarnia.pl lezy plik
/.well-known/mcp-registry-auth z kluczem publicznym (public/.well-known/).
Klucz prywatny jest POZA repo: ~/.mcp-registry/mojaserowarnia.pl-ed25519.pem
(repo jest publiczne). Bez niego nie da sie publikowac ani aktualizowac wpisu,
wiec trzeba go trzymac tak jak hasla.

Robi to samo co oficjalne mcp-publisher (login http + publish), bez pobierania
programu: podpisuje biezacy czas kluczem Ed25519, wymienia podpis na token
i wysyla server.json.

UZYCIE:
  python scripts/publikuj-rejestr-mcp.py            # sprawdzenie: walidacja + plik klucza na zywo
  python scripts/publikuj-rejestr-mcp.py --publikuj # naprawde publikuje

Przy zmianie wersji serwera (WERSJA w worker-magazyn/src/serwer.js) podbic
"version" w server.json i opublikowac ponownie. Skrypt pilnuje, zeby sie zgadzaly.
"""
import base64
import io
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from cryptography.hazmat.primitives import serialization

ROOT = Path(__file__).resolve().parent.parent
SERVER_JSON = ROOT / "worker-magazyn" / "server.json"
SERWER_JS = ROOT / "worker-magazyn" / "src" / "serwer.js"
KLUCZ = Path.home() / ".mcp-registry" / "mojaserowarnia.pl-ed25519.pem"
DOMENA = "mojaserowarnia.pl"
REJESTR = "https://registry.modelcontextprotocol.io/v0.1"
UA = "MojaSerowarnia-publikacja-rejestru/1.0 test-marek"


def zapytanie(adres, dane=None, naglowki=None):
    tresc = json.dumps(dane).encode() if dane is not None else None
    h = {"user-agent": UA, "accept": "application/json"}
    if tresc is not None:
        h["content-type"] = "application/json"
    h.update(naglowki or {})
    try:
        with urllib.request.urlopen(urllib.request.Request(adres, data=tresc, headers=h), timeout=30) as r:
            return r.status, r.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def main():
    publikuj = "--publikuj" in sys.argv
    serwer = json.loads(SERVER_JSON.read_text(encoding="utf-8"))

    wersja_js = re.search(r"export const WERSJA = '([^']+)'", SERWER_JS.read_text(encoding="utf-8")).group(1)
    if serwer["version"] != wersja_js:
        sys.exit("Wersje sie rozjechaly: server.json %s, serwer.js %s" % (serwer["version"], wersja_js))
    print("server.json: %s, wersja %s" % (serwer["name"], serwer["version"]))

    status, odp = zapytanie(REJESTR + "/validate", serwer)
    print("walidacja rejestru: %s %s" % (status, odp.strip()[:200]))
    if status != 200 or not json.loads(odp).get("valid"):
        sys.exit("server.json nie przechodzi walidacji.")

    if not KLUCZ.exists():
        sys.exit("Brak klucza prywatnego: %s" % KLUCZ)
    klucz = serialization.load_pem_private_key(KLUCZ.read_bytes(), password=None)
    publiczny = base64.b64encode(klucz.public_key().public_bytes(
        serialization.Encoding.Raw, serialization.PublicFormat.Raw)).decode()

    status, plik = zapytanie("https://%s/.well-known/mcp-registry-auth" % DOMENA)
    oczekiwany = "v=MCPv1; k=ed25519; p=%s" % publiczny
    if status != 200 or plik.strip() != oczekiwany:
        sys.exit("Plik /.well-known/mcp-registry-auth na zywo nie zgadza sie z kluczem (status %s)." % status)
    print("plik klucza na zywo: zgodny")

    if not publikuj:
        print("\nTryb sprawdzenia: nic nie wyslano. Publikacja: --publikuj")
        return 0

    czas = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    podpis = klucz.sign(czas.encode()).hex()
    status, odp = zapytanie(REJESTR + "/auth/http", {"domain": DOMENA, "timestamp": czas, "signed_timestamp": podpis})
    if status != 200:
        sys.exit("Logowanie do rejestru nie przeszlo: %s %s" % (status, odp[:300]))
    token = json.loads(odp)["registry_token"]
    print("logowanie: OK")

    status, odp = zapytanie(REJESTR + "/publish", serwer, {"authorization": "Bearer " + token})
    print("publikacja: %s %s" % (status, odp.strip()[:400]))
    return 0 if status == 200 else 1


if __name__ == "__main__":
    sys.exit(main())
