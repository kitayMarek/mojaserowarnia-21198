import { recipesData, type Recipe } from "@/data/recipesData";
import { culinaryRecipesData, type CulinaryRecipe } from "@/data/culinaryRecipesData";

/**
 * Wiąże dwa działy przepisów: „przepisy na sery" i „przepisy kulinarne z serami".
 *
 * Dotąd te działy w ogóle się nie widziały — żaden z 24 przepisów na ser nie
 * prowadził do kuchni, a żaden przepis kulinarny nie mówił, że ten ser można
 * zrobić samemu. Powiązanie liczymy z pola `mainCheese`, więc nie ma osobnej
 * listy do utrzymywania: dodanie nowego przepisu kulinarnego z nazwą sera
 * podłącza go automatycznie w obie strony.
 *
 * Dopasowujemy najpierw po identyfikatorze, potem po nazwie sera. Brak
 * dopasowania oznacza brak linku — sekcja się po prostu nie pokaże.
 */

const normalizuj = (t: string) =>
  t.trim().toLowerCase().replace(/\s+/g, " ");

/** Przepis na ser, który jest bazą dania — dla strony przepisu kulinarnego. */
export function serDlaDaniaKulinarnego(danie: CulinaryRecipe): Recipe | undefined {
  const szukane = normalizuj(danie.mainCheese);
  if (!szukane) return undefined;
  return recipesData.find(
    (r) => r.id === szukane || normalizuj(r.name).includes(szukane)
  );
}

/** Dania, które można zrobić z danego sera — dla strony przepisu na ser. */
export function daniaZSera(recipeId: string): CulinaryRecipe[] {
  return culinaryRecipesData.filter((danie) => {
    const ser = serDlaDaniaKulinarnego(danie);
    return ser?.id === recipeId;
  });
}
