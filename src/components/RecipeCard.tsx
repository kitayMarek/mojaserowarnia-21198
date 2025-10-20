import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";
import { Recipe } from "@/data/recipesData";
import { Link } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
}

const difficultyColors = {
  "Łatwy": "bg-secondary text-secondary-foreground",
  "Średni": "bg-primary text-primary-foreground",
  "Trudny": "bg-accent text-accent-foreground"
};

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <Link to={`/przepisy/${recipe.id}`}>
      <Card className="h-full hover:shadow-warm transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group">
        <div className="aspect-video overflow-hidden">
          <img 
            src={recipe.image} 
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">
              {recipe.name}
            </CardTitle>
            <Badge className={difficultyColors[recipe.difficulty]}>
              {recipe.difficulty}
            </Badge>
          </div>
          <CardDescription className="text-sm line-clamp-2">
            {recipe.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{recipe.ageTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{recipe.yield}</span>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            {recipe.category}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RecipeCard;
