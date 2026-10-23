import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Okruszki mojapasza.com. Ta sama obsługa co PageBreadcrumbs w Serowarni (te same
 * właściwości), ale pokazują tylko „Moja Pasza › bieżąca strona”: pośrednie
 * pozycje z Serowarni („Narzędzia”, „Pasze i zwierzęta”) tu nie istnieją.
 * Bez danych strukturalnych: te dojdą razem z mirrorami przed przełączeniem.
 * Klasa okruszki-strony zostaje, bo reguła w src/index.css ustawia odstęp <main>.
 */
interface Pozycja {
  label: string;
  href?: string;
}

const Okruszki = ({ items }: { items: Pozycja[]; baseUrl?: string }) => {
  const ostatnia = items[items.length - 1];
  return (
    <div className="okruszki-strony container mx-auto px-4 pb-4 pt-20">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Moja Pasza</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {ostatnia && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{ostatnia.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Okruszki;
