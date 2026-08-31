-- Wiersze zablokowane przez wyzwalacze regul biznesowych.
-- session_replication_role = replica wylacza wyzwalacze na czas TEJ sesji;
-- przedostatnia linia przywraca normalne zachowanie. Uruchom w calosci.

set session_replication_role = replica;

insert into public.serowarnie (id, user_id, slug, nazwa, opis, wojewodztwo, miejscowosc, telefon, email_kontakt, www, facebook, produkty, rodzaj_mleka, forma_sprzedazy, status, powod_odrzucenia, zgoda_publikacja, zgoda_data, created_at, updated_at, nr_weterynaryjny, oswiadczenie_producent, typ_dzialalnosci, zdjecie_glowne, galeria)
values ('5b21b674-ea52-4e13-820d-630d887f7b93', '5cc4cc01-e6c7-4c96-9abd-bc8521406506', 'agrojelonki', 'Agrojelonki', 'Agrojelonki to małe gospodarstwo rolne na Warmii, kilometr od centrum wsi Gietrzwałd. Prowadzimy je rodzinnie od 20 lat w rytmie, jaki narzuca ziemia i zwierzęta — bez pośpiechu i bez skali, która odbiera produktom charakter.

Hodujemy drób (kury, kaczki, gęsi i indyki) i wytwarzamy sery zagrodowe z mleka krowiego. Każda partia sera powstaje w małej ilości, dojrzewa własnym tempem i trafia do gości dopiero wtedy, gdy jest gotowa — nie wcześniej. Prowadzimy pełną dokumentację produkcji, więc o każdym serze wiemy, z jakiego mleka powstał, kiedy został uwarzony i jak dojrzewał.

Sprzedajemy tylko bezpośrednio z gospodarstwanaszym gościom.

OFERTA

Pobyt w gospodarstwie
6 miejsc noclegowych na piętrze domu w którym mieszkają nasi rodzice. Cisza, przestrzeń i codzienność prawdziwego gospodarstwa — nie inscenizacja wsi, tylko wieś, która pracuje. Warmia dookoła: jeziora, lasy. Do Olsztyna 15 minut samochodem.

Goście mogą przyjrzeć się z bliska temu, jak powstaje ser i jak wygląda dzień w gospodarstwie z drobiem.

Sery i produkty z gospodarstwa
Sery dojrzewające typu Gouda i Koryciński, twaróg, ser wędzony, jaja od kur z wolnego wybiegu, miód

Dostępność zmienia się z sezonem i rytmem dojrzewalni — najlepiej zapytać o aktualną ofertę. 

Warsztaty i wiedza
 Pokazujemy, jak zrobić ser w domowych warunkach — od mleka po dojrzewalnię. Warsztaty dla małych grup, po wcześniejszym umówieniu.

Dzielimy się też tym, czego nauczyliśmy się po drodze: prowadzę mojaserowarnia.pl — otwarty portal wiedzy o serowarstwie domowym z bazą kultur bakteryjnych, przepisami i przewodnikami po przepisach RHD i MOL.

KONTAKT

Agrojelonki —Gospodarstwo Agroturystyczne
ul. Łąkowa 2, okolice Gietrzwałdu, woj. warmińsko-mazurskie
tel. 504-208-630 · agrojelonki@gmail.com
https://www.facebook.com/AgroturystykaAgrojelonki

Najlepiej zadzwonić lub napisać przed przyjazdem — potwierdzimy, co akurat jest dostępne w sprzedaży i czy są wolne terminy.', 'warmińsko-mazurskie', 'Gietrzwałd', '504208630', 'warzywa@xl.wp.pl', 'https://agrojelonki.pl', 'https://www.facebook.com/AgroturystykaAgrojelonki', ARRAY['Sery dojrzewające czyste i z przyprawami', 'twarogi']::text[], ARRAY['krowie']::text[], ARRAY['posiłki w ramach pobytu', 'sprzedaż na miejscu dla gości', 'degustacja dla gości']::text[], 'opublikowany', null, true, '2026-08-10T13:56:28.40947+00:00', '2026-08-10T13:56:28.40947+00:00', '2026-08-11T07:05:30.297493+00:00', null, true, 'agroturystyka', 'https://hsgxmbhunclhgzumafrk.supabase.co/storage/v1/object/public/wizytowki/07192cfa-ed9e-4722-bbbe-30ec3b9c7849/glowne-1786430813244-qvwtan.jpg', '[]'::jsonb)
on conflict (id) do nothing;

insert into public.serowarnia_wpisy (id, serowarnia_id, user_id, tresc, zdjecie_url, utworzono, wygasa, opublikowany)
values ('d9bc9d54-c96c-4d11-8ab8-edd632e35f9a', '5b21b674-ea52-4e13-820d-630d887f7b93', '5cc4cc01-e6c7-4c96-9abd-bc8521406506', 'Mamy wolny pokój  od  24-08-2026 do 31-08-2026', null, '2026-08-16T20:03:53.9442+00:00', null, true)
on conflict (id) do nothing;

set session_replication_role = origin;

-- kontrola (ma wyjsc 1 i 1):
select 'serowarnie' as tabela, count(*) from public.serowarnie
union all select 'serowarnia_wpisy', count(*) from public.serowarnia_wpisy;