import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const QUERIES = [
  { group: "Sery włoskie", items: [
    "Jakie kultury bakteryjne nadają się do caciotta?",
    "Jakie kultury do mozzarelli i serów termofilnych?",
    "Jakie kultury do ricotty?",
  ]},
  { group: "Sery świeże i twaróg", items: [
    "Jakie kultury do twarogu i serka wiejskiego?",
    "Ile podpuszczki na litr mleka do sera świeżego?",
    "Jakie kultury mezofilne do serów świeżych?",
  ]},
  { group: "Sery twarde i półtwarde", items: [
    "Jakie kultury do goudy i edama?",
    "Jakie kultury do parmezanu i serów twardych?",
    "Jakie kultury propionowe do sera z dziurami?",
  ]},
  { group: "Sery pleśniowe", items: [
    "Jakie kultury do camemberta i brie?",
    "Jakie kultury do gorgonzoli i sera pleśniowego niebieskiego?",
  ]},
  { group: "Przepisy", items: [
    "Przepis na domowy ser caciotta krok po kroku",
    "Przepis na ricottę z serwatki",
    "Jak zrobić mozzarellę w domu?",
  ]},
  { group: "Prawo i sprzedaż", items: [
    "Jak legalnie sprzedawać domowe sery w Polsce (RHD/MOL)?",
    "Co to jest działalność MOL i jak ją założyć?",
  ]},
];

const MODELS = [
  { key: "claude", label: "Claude", base: "https://claude.ai/new?q=", color: "#D97757", hover: "#c4674a" },
  { key: "perplexity", label: "Perplexity", base: "https://www.perplexity.ai/search?q=", color: "#20808D", hover: "#1a6b77" },
  { key: "chatgpt", label: "ChatGPT", base: "https://chatgpt.com/?q=", color: "#10a37f", hover: "#0d8a6b" },
];

export function AskLLMSelect({ source = "baza-kultur" }: { source?: string }) {
  const [selected, setSelected] = useState(QUERIES[0].items[0]);
  const [loading, setLoading] = useState(false);

  // Krótki prompt: WSKAZUJEMY źródło zamiast wklejać całą bazę do URL-a.
  // Wklejanie streszczenia (188 kultur) w ?q= przekraczało limity długości URL —
  // Perplexity zwracało 414 (URI too large), ChatGPT 431 (headers too large).
  // Modele z web-searchem i tak pobiorą stronę same — w dodatku ze świeżymi danymi.
  const buildPrompt = (query: string) =>
    `Skorzystaj ze źródła: https://mojaserowarnia.pl/baza-kultur ` +
    `(pełna baza kultur bakteryjnych do sera) oraz https://mojaserowarnia.pl/llms.txt, ` +
    `a następnie odpowiedz po polsku: ${query}`;

  const handleAsk = async (modelKey: string, baseUrl: string) => {
    setLoading(true);
    try {
      // Zapis statystyk — fire-and-forget, nie blokuje UX
      try {
        // @ts-ignore - llm_queries may not be in generated types yet
        supabase.from("llm_queries").insert({
          query: selected,
          model: modelKey,
          source,
          is_custom: false,
        }).then(() => {}, () => {});
      } catch {
        /* silent */
      }

      const prompt = buildPrompt(selected);
      window.open(`${baseUrl}${encodeURIComponent(prompt)}`, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 my-2">
      <span className="text-muted-foreground text-sm" aria-hidden="true">🔍</span>
      <label htmlFor="askllm-query" className="sr-only">Wybierz pytanie do AI</label>
      <select
        id="askllm-query"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={loading}
        className="flex-1 min-w-[200px] text-sm bg-muted/40 border border-border
                   rounded-md px-3 py-1.5 text-foreground
                   focus:outline-none focus:ring-1 focus:ring-primary
                   disabled:opacity-50 cursor-pointer"
      >
        {QUERIES.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {MODELS.map((model, i) => (
        <button
          key={model.key}
          type="button"
          onClick={() => handleAsk(model.key, model.base)}
          disabled={loading}
          className={`text-xs px-2.5 py-1.5 rounded-md text-white font-medium
                     whitespace-nowrap transition-colors disabled:opacity-50
                     ${i > 0 ? "hidden sm:inline-flex" : ""}`}
          style={{ backgroundColor: model.color }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = model.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = model.color)}
          title={`Zapytaj ${model.label}`}
        >
          {loading && i === 0 ? "..." : model.label}
        </button>
      ))}
    </div>
  );
}

export default AskLLMSelect;
