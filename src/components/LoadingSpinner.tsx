import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">Ładowanie...</p>
          <p className="text-sm text-muted-foreground">Przygotowujemy stronę dla Ciebie</p>
        </div>
      </div>
    </div>
  );
};
