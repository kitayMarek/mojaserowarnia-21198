import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin, isPending: rolaNieznana } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user,
  });

  // DLACZEGO isPending, A NIE isLoading: w react-query 5 `isLoading` to
  // (isPending && isFetching). Zapytanie dopiero co włączone przez `enabled`
  // startuje w efekcie, czyli JUŻ PO renderze — więc przez jeden render ma
  // isFetching=false, isLoading=false i `data` równe undefined.
  //
  // Strażnik wpadał wtedy prosto w `if (!isAdmin)` i odsyłał na /dashboard,
  // zanim zapytanie o rolę w ogóle ruszyło. Objaw: administrator wchodzi na
  // /admin z paska adresu albo odświeża stronę i ląduje na swoim koncie, choć
  // wiersz z rolą `admin` siedzi w bazie. Przy przejściu wewnątrz aplikacji
  // bywało dobrze, bo rola była już w pamięci podręcznej z wcześniejszej wizyty.
  //
  // `isPending` jest prawdziwe dopóki nie ma danych — także gdy zapytanie czeka
  // wyłączone. Stąd warunek `!!user`: bez zalogowanego użytkownika o roli nie
  // pytamy i to niżej rozstrzyga `if (!user)`, a nie wieczna kręciołka.
  const roleLoading = !!user && rolaNieznana;

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
