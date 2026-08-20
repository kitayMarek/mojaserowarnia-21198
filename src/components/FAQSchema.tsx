interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

/**
 * Renderuje <script> BEZPOŚREDNIO, a nie przez react-helmet.
 *
 * react-helmet 6.1.0 pod Reactem 18 nie emituje nic — w gotowym dokumencie nie
 * ma ani jednego elementu z data-react-helmet. Ten komponent był używany na 13
 * stronach i przez cały ten czas nie wstawiał schematu FAQ na żadną z nich.
 * Sprawdzone 2026-08-20: /przepisy/gruyere miało w dokumencie tylko WebSite,
 * Organization, Recipe i BreadcrumbList — mimo że renderuje też HowToSchema,
 * który miał ten sam problem.
 *
 * RecipeSchema od początku renderował <script> wprost i dlatego działał — ten
 * komponent robi teraz to samo.
 */
const FAQSchema = ({ faqs }: FAQSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default FAQSchema;
