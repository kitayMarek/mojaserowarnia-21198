import { ThumbsUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useReactions } from "@/hooks/useReactions";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  contentType: string;
  contentId: string;
  variant?: "default" | "compact";
}

const ReactionButton = ({ contentType, contentId, variant = "default" }: ReactionButtonProps) => {
  const { userReaction, stats, toggleReaction, isLoading } = useReactions(contentType, contentId);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  // Calculate badge size and color based on points
  const getBadgeStyle = (points: number) => {
    if (points === 0) return { scale: "scale-90", color: "bg-muted text-muted-foreground" };
    if (points < 10) return { scale: "scale-95", color: "bg-secondary text-secondary-foreground" };
    if (points < 50) return { scale: "scale-100", color: "bg-primary/20 text-primary" };
    if (points < 100) return { scale: "scale-105", color: "bg-primary/40 text-primary" };
    if (points < 500) return { scale: "scale-110", color: "bg-primary/60 text-primary-foreground" };
    return { scale: "scale-125", color: "bg-primary text-primary-foreground" };
  };

  const badgeStyle = getBadgeStyle(stats.totalPoints);
  const isCompact = variant === "compact";

  return (
    <div className={cn(
      "flex items-center gap-2",
      isCompact ? "flex-row" : "flex-col sm:flex-row"
    )}>
      {/* Reaction buttons */}
      <div className="flex items-center gap-1">
        <Button
          size={isCompact ? "sm" : "default"}
          variant={userReaction === "like" ? "default" : "secondary"}
          onClick={() => toggleReaction("like")}
          disabled={isLoading}
          className={cn(
            "transition-all duration-300",
            userReaction === "like" && "animate-scale-in"
          )}
        >
          <ThumbsUp className={cn(
            isCompact ? "h-3 w-3" : "h-4 w-4",
            userReaction === "like" && "fill-current"
          )} />
          {!isCompact && <span className="ml-1 text-xs">{stats.likesCount}</span>}
        </Button>

        <Button
          size={isCompact ? "sm" : "default"}
          variant={userReaction === "love" ? "default" : "secondary"}
          onClick={() => toggleReaction("love")}
          disabled={isLoading}
          className={cn(
            "transition-all duration-300",
            userReaction === "love" && "animate-scale-in"
          )}
        >
          <Heart className={cn(
            isCompact ? "h-3 w-3" : "h-4 w-4",
            userReaction === "love" && "fill-current"
          )} />
          {!isCompact && <span className="ml-1 text-xs">{stats.lovesCount}</span>}
        </Button>
      </div>

      {/* Growing balloon badge with points */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={cn(
                "transition-all duration-500 ease-out cursor-help font-bold",
                badgeStyle.scale,
                badgeStyle.color,
                "animate-scale-in",
                isCompact ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
              )}
            >
              {formatNumber(stats.totalPoints)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p className="font-semibold mb-1">Punkty: {stats.totalPoints}</p>
              <p>👍 Łapki: {stats.likesCount} × 1 = {stats.likesCount}</p>
              <p>❤️ Serca: {stats.lovesCount} × 2 = {stats.lovesCount * 2}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ReactionButton;
