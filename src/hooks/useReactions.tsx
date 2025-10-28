import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ReactionType = "like" | "love";

interface ReactionStats {
  likesCount: number;
  lovesCount: number;
  totalPoints: number;
}

export const useReactions = (contentType: string, contentId: string) => {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [stats, setStats] = useState<ReactionStats>({
    likesCount: 0,
    lovesCount: 0,
    totalPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch stats
  const fetchStats = async () => {
    const { data } = await supabase
      .from("reactions_stats")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .maybeSingle();

    if (data) {
      setStats({
        likesCount: data.likes_count || 0,
        lovesCount: data.loves_count || 0,
        totalPoints: data.total_points || 0,
      });
    } else {
      setStats({ likesCount: 0, lovesCount: 0, totalPoints: 0 });
    }
  };

  // Fetch user reaction
  const fetchUserReaction = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("reactions")
      .select("reaction_type")
      .eq("user_id", user.id)
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .maybeSingle();

    setUserReaction((data?.reaction_type as ReactionType) || null);
  };

  // Toggle reaction
  const toggleReaction = async (reactionType: ReactionType) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Musisz być zalogowany",
        description: "Zaloguj się, aby dodać reakcję",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // If clicking the same reaction, remove it
      if (userReaction === reactionType) {
        await supabase
          .from("reactions")
          .delete()
          .eq("user_id", user.id)
          .eq("content_type", contentType)
          .eq("content_id", contentId);
        
        setUserReaction(null);
      } else {
        // Upsert new reaction
        await supabase
          .from("reactions")
          .upsert({
            user_id: user.id,
            content_type: contentType,
            content_id: contentId,
            reaction_type: reactionType,
          }, {
            onConflict: "user_id,content_type,content_id"
          });
        
        setUserReaction(reactionType);
      }

      await fetchStats();
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać reakcji",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchUserReaction()]);
      setIsLoading(false);
    };

    loadData();
  }, [contentType, contentId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`reactions:${contentType}:${contentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reactions",
          filter: `content_type=eq.${contentType},content_id=eq.${contentId}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentType, contentId]);

  return {
    userReaction,
    stats,
    toggleReaction,
    isLoading,
  };
};
