import "@/styles/pasek-rodziny.css";

// Pasek rodziny serwisów Dane Rolne: wynik pasekRodziny('mojaserowarnia.pl') z
// C:\Moje\Hub\worker\src\pasek-rodziny.js (commit c395bde, 12.11.2026: szósty serwis Moja Gmina), skopiowany bez zmian (lista z danerolne.com/rodzina.json).
// Zwykłe linki do stron głównych, bez utm i bez licznika. Styl w src/styles/pasek-rodziny.css.
const PASEK_HTML =
  '<nav class="dr-pasek" aria-label="Serwisy Dane Rolne"><ul><li><a href="https://danerolne.com/"><svg class="dr-znak" viewBox="0 0 12 12" aria-hidden="true"><g fill="#E6C14A"><rect x="0" y="6.5" width="3" height="5.5"/><rect x="4.5" y="3.5" width="3" height="8.5"/><rect x="9" y="0" width="3" height="12"/></g></svg>Dane Rolne</a></li><li><a href="https://mojapasza.com/"><span class="dr-pelna">Moja Pasza</span><span class="dr-krotko">Pasza</span></a></li><li><a href="https://policzikup.com/">Policz i Kup</a></li><li><a href="https://mojaserowarnia.pl/" aria-current="true"><span class="dr-pelna">Moja Serowarnia</span><span class="dr-krotko">Serowarnia</span></a></li><li><a href="https://targrolny.com/"><span class="dr-pelna">Targ Rolny</span><span class="dr-krotko">Targ</span></a></li><li><a href="https://mojagmina.org/"><span class="dr-pelna">Moja Gmina</span><span class="dr-krotko">Gmina</span></a></li></ul></nav>';

const PasekRodziny = () => <div className="sero-rodzina" dangerouslySetInnerHTML={{ __html: PASEK_HTML }} />;

export default PasekRodziny;
