import { Recipe } from "@/data/recipesData";

interface RecipeSchemaProps {
  recipe: Recipe;
}

const RecipeSchema = ({ recipe }: RecipeSchemaProps) => {
  // Zamienia opis czasu dojrzewania ("3-5 tygodni", "2-12 miesiecy") na ISO 8601.
  // Szukamy liczby STOJACEJ PRZY jednostce, nie pierwszej liczby w tekscie — inaczej
  // "Swiezy: 1-2 dni - lezakowany: 2-6 tygodni" trafialoby na zla jednostke.
  // Z zakresu bierzemy wartosc dolna: to minimum, po ktorym ser nadaje sie do jedzenia,
  // i jedyna liczba, ktorej mozemy byc pewni.
  const convertToISO8601 = (timeStr: string): string => {
    const m = timeStr.match(/(\d+)\s*(?:[-–]\s*\d+\s*)?(dni|dzień|tygod\w*|miesi\w*)/i);
    if (!m) return "P30D";
    const value = parseInt(m[1]);
    const unit = m[2].toLowerCase();
    // ISO 8601 nie pozwala laczyc tygodni z innymi jednostkami, wiec liczymy je na dni.
    if (unit.startsWith("tygod")) return `P${value * 7}D`;
    if (unit.startsWith("miesi")) return `P${value}M`;
    return `P${value}D`;
  };

  // Google odrzuca zbyt dlugie recipeIngredient (limit ok. 100 znakow). Wczesniej
  // wstawialismy tu cale akapity z milkBase/starter/coagulant/salting — a to sa
  // opisy z uzasadnieniem ("Bez nich ser nie stopnieje rownomiernie, lecz..."),
  // nie skladniki. GSC zglaszalo z tego powodu "Nieprawidlowa dlugosc ciagu znakow".
  //
  // dosageTable ma dokladnie wlasciwa forme: skladnik + ilosc, 15-31 znakow.
  // Baze (mleko albo ser wyjsciowy) dokladamy z milkBase przycietego do pierwszego
  // czlonu, bo w 19 z 24 przepisow nie ma jej w tabeli dawkowania. Wiersze tabeli
  // powtarzajace baze odsiewamy, zeby skladnik nie pojawil sie dwa razy.
  const skrocBaze = (t: string) =>
    t.split(/\s*[(—–]/)[0].trim().replace(/[.,;]+$/, "");

  const wzorzecBazy = /mlek|ser bazowy|baza|twar|serwatk|śmietank/i;

  const skladniki: string[] = [
    ...(recipe.milkBase ? [skrocBaze(recipe.milkBase)] : []),
    ...(recipe.dosageTable ?? [])
      .filter((d) => !wzorzecBazy.test(d.ingredient))
      .map((d) => `${d.ingredient} — ${d.amount}`),
  ].filter((x) => x && x.length > 0);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.name,
    "image": recipe.image.startsWith("http") 
      ? recipe.image 
      : `https://mojaserowarnia.pl${recipe.image}`,
    "description": recipe.description,
    "recipeYield": recipe.yield,
    "totalTime": convertToISO8601(recipe.ageTime),
    "recipeCategory": "Ser",
    "recipeCuisine": "Polska",
    "keywords": `ser, ${recipe.name.toLowerCase()}, przepis na ser, serowarstwo, ${recipe.difficulty.toLowerCase()}`,
    "recipeIngredient": skladniki,
    "recipeInstructions": recipe.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.content,
      "url": `https://mojaserowarnia.pl/przepisy/${recipe.id}#krok-${index + 1}`,
      ...(step.tip && { "tip": step.tip }),
      ...(step.warning && { "warning": step.warning })
    })),
    "author": {
      "@type": "Organization",
      "name": "Moja Serowarnia",
      "url": "https://mojaserowarnia.pl"
    },
    "datePublished": "2025-01-15",
    ...(recipe.nutrition && {
      "nutrition": {
        "@type": "NutritionInformation",
        "servingSize": recipe.nutrition.servingSize,
        "calories": `${recipe.nutrition.calories} kcal`,
        "fatContent": `${recipe.nutrition.fatContent} g`,
        "saturatedFatContent": `${recipe.nutrition.saturatedFatContent} g`,
        "proteinContent": `${recipe.nutrition.proteinContent} g`,
        "carbohydrateContent": `${recipe.nutrition.carbohydrateContent} g`,
        "sodiumContent": `${recipe.nutrition.sodiumContent} mg`,
        "calciumContent": `${recipe.nutrition.calciumContent} mg`
      }
    })
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData, null, 2) }}
    />
  );
};

export default RecipeSchema;
