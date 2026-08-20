import FAQSchema from "@/components/FAQSchema";
import { faqPoradnikow } from "@/data/faqPoradnikow";
import { HelpCircle } from "lucide-react";

interface Props {
  /** Slug strony, np. „wedzenie-sera" — klucz w faqPoradnikow */
  slug: string;
  tytul?: string;
}

/**
 * Widoczna sekcja pytań i odpowiedzi wraz ze schematem FAQPage.
 *
 * Powód istnienia: FAQ dla poradników było napisane, ale wyłącznie w statycznych
 * mirrorach. Strony reactowe — te, które Google ocenia — nie pokazywały go ani
 * czytelnikowi, ani wyszukiwarce; FAQSchema był podpięty tylko na jednej z
 * dziewięciu. Ten komponent zamyka obie luki naraz: renderuje pytania na
 * stronie i przekazuje je do schematu.
 *
 * Gdy dla slugu nie ma pytań, nie renderuje nic — strona bez FAQ po prostu go
 * nie ma, zamiast pokazywać pustą ramkę.
 */
const SekcjaFAQ = ({ slug, tytul = "Najczęstsze pytania" }: Props) => {
  const pytania = faqPoradnikow[slug];
  if (!pytania || pytania.length === 0) return null;

  return (
    <>
      <FAQSchema
        faqs={pytania.map((p) => ({ question: p.pytanie, answer: p.odpowiedz }))}
      />

      <section className="mb-8 rounded-xl border border-border bg-card p-6 md:p-8" aria-label={tytul}>
        <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-accent">
          <HelpCircle className="h-6 w-6" aria-hidden="true" />
          {tytul}
        </h2>

        <dl className="space-y-5">
          {pytania.map((p, i) => (
            <div key={i} className="border-b border-border pb-5 last:border-0 last:pb-0">
              <dt className="mb-2 font-semibold text-foreground">{p.pytanie}</dt>
              <dd className="max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
                {p.odpowiedz}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
};

export default SekcjaFAQ;
