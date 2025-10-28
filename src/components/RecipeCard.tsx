import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat } from "lucide-react";
import { Recipe } from "@/data/recipesData";
import ReactionButton from "@/components/ReactionButton";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const difficultyColors = {
    "Łatwy": "bg-green-500/10 text-green-700 border-green-500/20",
    "Średni": "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    "Zaawansowany": "bg-red-500/10 text-red-700 border-red-500/20"
  };

  return (
    <Link to={`/przepisy/${recipe.id}`} className="group">
      <Card className="h-full border-border hover:border-primary transition-all duration-300 hover:shadow-card group-hover:scale-[1.02] bg-card overflow-hidden">
        <div className="aspect-video overflow-hidden">
          <img 
            src={recipe.image} 
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className={difficultyColors[recipe.difficulty]}>
              {recipe.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{recipe.ageTime}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {recipe.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {recipe.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChefHat className="h-4 w-4" />
              <span>{recipe.yield}</span>
            </div>
            
            <div onClick={(e) => e.preventDefault()}>
              <ReactionButton contentType="recipe" contentId={recipe.id} variant="compact" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RecipeCard;
