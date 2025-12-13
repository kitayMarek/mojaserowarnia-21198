import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";
import { CulinaryRecipe } from "@/data/culinaryRecipesData";

interface CulinaryRecipeCardProps {
  recipe: CulinaryRecipe;
}

const CulinaryRecipeCard = ({ recipe }: CulinaryRecipeCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'łatwy':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'średni':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'zaawansowany':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Link to={`/przepisy-kulinarne/${recipe.id}`}>
      <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Cheese Badge */}
          <Badge 
            className="absolute top-3 left-3 bg-primary/90 text-primary-foreground backdrop-blur-sm"
          >
            {recipe.mainCheese}
          </Badge>
          
          {/* Difficulty Badge */}
          <Badge 
            variant="outline"
            className={`absolute top-3 right-3 backdrop-blur-sm border ${getDifficultyColor(recipe.difficulty)}`}
          >
            {recipe.difficulty}
          </Badge>
        </div>

        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {recipe.subtitle}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        </CardContent>

        <CardFooter className="px-5 pb-5 pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground w-full">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{recipe.prepTime} + {recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} os.</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <ChefHat className="w-4 h-4 text-primary" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CulinaryRecipeCard;
