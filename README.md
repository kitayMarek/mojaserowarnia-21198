# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3d80f74b-028c-45ac-acb5-ec7964ffd94c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3d80f74b-028c-45ac-acb5-ec7964ffd94c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3d80f74b-028c-45ac-acb5-ec7964ffd94c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Noindex: zasada i wyjątki

Zasada Marka z 12.11.2026: wszystko, co trafia na serwer, jest **bez noindex**, chyba że to wyjątek zapisany tutaj i przy kodzie (komentarz ze słowami „wyjątek od zasady bez noindex”). Nowy noindex albo nowy `Disallow` w `robots.txt` dopisz do tej listy, z powodem.

Sprawdzone na żywo 12.11.2026: wszystkie 298 adresów z `sitemap.xml` odpowiadają 200 bez noindex, i człowiekowi, i botowi.

Blokady, które zostają z decyzji Marka:

| Co | Gdzie w kodzie | Dlaczego |
|---|---|---|
| Meta-ExternalAgent: `Disallow: /` i 403 | `public/robots.txt`, `worker/index.js` (1z) | decyzja z 16.10.2026: najwięcej pobrań, zero ruchu ludzi w zamian |
| Łącznik dane.mojaserowarnia.pl: noindex na wszystkim, `Disallow: /mcp` | `worker-magazyn/src/index.js`, `odkrywanie.js` | strona techniczna łącznika, nie treść dla wyszukiwarki |

Wyjątki techniczne:

| Co | Gdzie w kodzie | Dlaczego |
|---|---|---|
| Kopia serwisu na `*.workers.dev`: noindex i `Disallow: /` | `worker/index.js` (1b, `odpowiedzZ`) | adres testowy z pełną kopią serwisu; bez tego Google widziałby duplikat całej domeny |
| Strona 404 i nieznaleziona wizytówka serowarni | `public/404.html`, `src/pages/SerowarniaProfil.tsx` | strony, której nie ma, nie indeksujemy |
| `/wypisz` (wypisanie z wiadomości) | `worker/index.js`, `src/pages/Wypisanie.tsx` | adres z prywatnym tokenem z maila |
| `/api/licznik-botow` | `worker/kontrakt-botow.js` | odczyt licznika na prywatny klucz |
| `Disallow` dla `/dashboard/`, `/auth`, `/api/`, `/admin`, `/settings` | `public/robots.txt` | strony za logowaniem i odpowiedzi techniczne |
| `/wewnetrzne/archiwum-2019.html`: noindex i `Disallow: /wewnetrzne/` | `public/robots.txt`, sam plik | pułapka na boty, które nie czytają robots.txt: strony nie ma w mapie ani w żadnym linku, więc jej pobranie dowodzi zignorowania zakazu; treść nie jest do publikacji |

Poza tą listą noindex nie ma. Pliki `/dane/*.json` i `/indeks.json` miały go do 12.11.2026.
