import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { recipesData, type Recipe } from "@/data/recipesData";

/**
 * Najczęściej czytane przepisy na stronie głównej (od 24.10.2026): cztery karty ze
 * zdjęciem. Kolejność z reakcji (reactions_stats, jak dawny PopularRecipesSidebar),
 * ale BEZ liczników: przy kilku polubieniach „1” wyglądało pusto.
 */
const NA_START = ["caciotta", "mozzarella", "korycinski", "camembert"];

const przepisyPoId = (ids: string[]) =>
  ids.map((id) => recipesData.find((r) => r.id === id)).filter((r): r is Recipe => !!r);

const PopularnePrzepisy = () => {
  const [przepisy, setPrzepisy] = useState<Recipe[]>(() => przepisyPoId(NA_START));

  useEffect(() => {
    supabase
      .from("reactions_stats")
      .select("content_id")
      .eq("content_type", "recipe")
      .order("total_points", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        const zReakcji = przepisyPoId((data ?? []).map((d) => d.content_id as string));
        // Dopełnienie do 4 przepisami startowymi, gdy reakcji jest mało.
        const razem = [...zReakcji, ...przepisyPoId(NA_START).filter((p) => !zReakcji.some((r) => r.id === p.id))];
        if (razem.length) setPrzepisy(razem.slice(0, 4));
      });
  }, []);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4 lg:gap-5">
      {przepisy.map((p) => (
        <Link key={p.id} to={`/przepisy/${p.id}`} className="group flex min-w-0 flex-col gap-2.5 text-foreground no-underline">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-28 w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-40"
          />
          <span className="font-display text-lg group-hover:text-primary sm:text-xl">{p.name}</span>
          <span className="line-clamp-2 text-sm leading-relaxed text-foreground/80">{p.description}</span>
        </Link>
      ))}
    </div>
  );
};

export default PopularnePrzepisy;
