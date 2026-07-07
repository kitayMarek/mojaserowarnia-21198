import { Recipe } from "@/data/recipesData";

interface RecipeSchemaProps {
  recipe: Recipe;
}

const RecipeSchema = ({ recipe }: RecipeSchemaProps) => {
  // Convert time string to ISO 8601 duration format
  const convertToISO8601 = (timeStr: string): string => {
    // Extract numbers from strings like "30–40 dni" or "3–9 miesięcy"
    const match = timeStr.match(/(\d+)/);
    if (!match) return "P30D"; // Default 30 days
    
    const value = parseInt(match[1]);
    
    if (timeStr.includes("dzień") || timeStr.includes("dni")) {
      return `P${value}D`;
    } else if (timeStr.includes("miesiąc") || timeStr.includes("miesięcy") || timeStr.includes("mies")) {
      return `P${value}M`;
    }
    return `P${value}D`; // Default to days
  };

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
    "recipeIngredient": [
      recipe.milkBase,
      recipe.starter,
      recipe.coagulant,
      recipe.salting
    ].filter(Boolean),
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
    "prepTime": convertToISO8601(recipe.ageTime),
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
