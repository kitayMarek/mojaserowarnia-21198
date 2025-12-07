import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Heart, ThumbsUp, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { recipesData, Recipe } from "@/data/recipesData";

interface RecipeWithStats extends Recipe {
  totalPoints: number;
  likesCount: number;
  lovesCount: number;
}

const PopularRecipes = () => {
  // Initialize with first 4 recipes as fallback immediately
  const [popularRecipes, setPopularRecipes] = useState<RecipeWithStats[]>(
    recipesData.slice(0, 4).map((r) => ({
      ...r,
      totalPoints: 0,
      likesCount: 0,
      lovesCount: 0,
    }))
  );
  const [isVisible, setIsVisible] = useState(false);

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
        // Fallback to first 4 recipes if no reactions yet
        setPopularRecipes(
          recipesData.slice(0, 4).map((r) => ({
            ...r,
            totalPoints: 0,
            likesCount: 0,
            lovesCount: 0,
          }))
        );
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

        // If we have some popular recipes, use them; otherwise fallback
        if (recipesWithStats.length > 0) {
          setPopularRecipes(recipesWithStats);
        } else {
          setPopularRecipes(
            recipesData.slice(0, 4).map((r) => ({
              ...r,
              totalPoints: 0,
              likesCount: 0,
              lovesCount: 0,
            }))
          );
        }
      } else {
        // No reactions yet - show first 4 recipes
        setPopularRecipes(
          recipesData.slice(0, 4).map((r) => ({
            ...r,
            totalPoints: 0,
            likesCount: 0,
            lovesCount: 0,
          }))
        );
      }
    };

    fetchPopularRecipes();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("popular-recipes-section");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Badge className="absolute -top-2 -left-2 bg-amber-500 text-white border-0 shadow-lg">
            <Flame className="h-3 w-3 mr-1" />
            #1
          </Badge>
        );
      case 1:
        return (
          <Badge className="absolute -top-2 -left-2 bg-slate-400 text-white border-0 shadow-lg">
            #2
          </Badge>
        );
      case 2:
        return (
          <Badge className="absolute -top-2 -left-2 bg-amber-700 text-white border-0 shadow-lg">
            #3
          </Badge>
        );
      default:
        return null;
    }
  };

  if (popularRecipes.length === 0) {
    return null;
  }

  return (
    <section
      id="popular-recipes-section"
      className="py-16 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Najpopularniejsze przepisy
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Przepisy najczęściej wybierane przez naszą społeczność serowarów
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRecipes.map((recipe, index) => (
            <Link
              key={recipe.id}
              to={`/przepisy/${recipe.id}`}
              className={`group transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="relative h-full border-border hover:border-primary transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02] bg-card overflow-hidden">
                {getRankBadge(index)}
                
                <div className="aspect-video overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <CardContent className="p-4">
                  <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {recipe.name}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {recipe.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {recipe.likesCount > 0 && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {recipe.likesCount}
                        </span>
                      )}
                      {recipe.lovesCount > 0 && (
                        <span className="flex items-center gap-1 text-rose-500">
                          <Heart className="h-3.5 w-3.5 fill-current" />
                          {recipe.lovesCount}
                        </span>
                      )}
                    </div>
                    
                    {recipe.totalPoints > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {recipe.totalPoints} pkt
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div
          className={`text-center mt-8 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link
            to="/przepisy"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Zobacz wszystkie przepisy
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularRecipes;
