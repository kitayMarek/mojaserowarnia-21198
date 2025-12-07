import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Heart, ThumbsUp, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { recipesData, Recipe } from "@/data/recipesData";
import { useEffect } from "react";

interface RecipeWithStats extends Recipe {
  totalPoints: number;
  likesCount: number;
  lovesCount: number;
}

const PopularRecipesSidebar = () => {
  const [popularRecipes, setPopularRecipes] = useState<RecipeWithStats[]>(
    recipesData.slice(0, 4).map((r) => ({
      ...r,
      totalPoints: 0,
      likesCount: 0,
      lovesCount: 0,
    }))
  );

  useEffect(() => {
    const fetchPopularRecipes = async () => {
      const { data, error } = await supabase
        .from("reactions_stats")
        .select("content_id, total_points, likes_count, loves_count")
        .eq("content_type", "recipe")
        .order("total_points", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching popular recipes:", error);
        return;
      }

      if (data && data.length > 0) {
        const recipesWithStats = data
          .map((stat) => {
            const recipe = recipesData.find((r) => r.id === stat.content_id);
            if (recipe) {
              return {
                ...recipe,
                totalPoints: Number(stat.total_points) || 0,
                likesCount: Number(stat.likes_count) || 0,
                lovesCount: Number(stat.loves_count) || 0,
              };
            }
            return null;
          })
          .filter((r): r is RecipeWithStats => r !== null);

        if (recipesWithStats.length > 0) {
          setPopularRecipes(recipesWithStats);
        }
      }
    };

    fetchPopularRecipes();
  }, []);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white border-0 shadow-lg text-xs px-1.5">
            <Flame className="h-3 w-3" />
          </Badge>
        );
      case 1:
        return (
          <Badge className="absolute -top-2 -right-2 bg-slate-400 text-white border-0 shadow-lg text-xs px-1.5">
            #2
          </Badge>
        );
      case 2:
        return (
          <Badge className="absolute -top-2 -right-2 bg-amber-700 text-white border-0 shadow-lg text-xs px-1.5">
            #3
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-display font-bold text-foreground">
          Popularne przepisy
        </h2>
      </div>

      <div className="space-y-4">
        {popularRecipes.map((recipe, index) => (
          <Link key={recipe.id} to={`/przepisy/${recipe.id}`} className="group block">
            <Card className="relative border-border hover:border-primary transition-all duration-300 hover:shadow-lg group-hover:scale-[1.02] bg-card overflow-hidden">
              {getRankBadge(index)}
              
              <div className="flex gap-3 p-3">
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {recipe.name}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {recipe.likesCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp className="h-3 w-3" />
                        {recipe.likesCount}
                      </span>
                    )}
                    {recipe.lovesCount > 0 && (
                      <span className="flex items-center gap-0.5 text-rose-500">
                        <Heart className="h-3 w-3 fill-current" />
                        {recipe.lovesCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Link
        to="/przepisy"
        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium transition-colors mt-4"
      >
        Wszystkie przepisy
        <span>→</span>
      </Link>
    </div>
  );
};

export default PopularRecipesSidebar;
