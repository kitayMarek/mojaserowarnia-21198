interface CulinaryRecipeSchemaProps {
  name: string;
  description: string;
  image?: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  recipeYield: number;
  ingredients: string[];
  steps: { name: string; text: string }[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  recipeCategory?: string;
  recipeCuisine?: string;
  url: string;
}

const CulinaryRecipeSchema = ({
  name,
  description,
  image,
  prepTime,
  cookTime,
  totalTime,
  recipeYield,
  ingredients,
  steps,
  nutrition,
  recipeCategory = "Danie główne",
  recipeCuisine = "Europejska",
  url,
}: CulinaryRecipeSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description,
    ...(image && { image }),
    author: {
      "@type": "Organization",
      name: "Moja Serowarnia",
      url: "https://mojaserowarnia.pl",
    },
    url,
    prepTime,
    cookTime,
    totalTime,
    recipeYield: `${recipeYield} porcji`,
    recipeCategory,
    recipeCuisine,
    recipeIngredient: ingredients,
    recipeInstructions: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${nutrition.calories} kcal`,
      proteinContent: `${nutrition.protein} g`,
      carbohydrateContent: `${nutrition.carbs} g`,
      fatContent: `${nutrition.fat} g`,
      fiberContent: `${nutrition.fiber} g`,
      sodiumContent: `${nutrition.sodium} mg`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
};

export default CulinaryRecipeSchema;
