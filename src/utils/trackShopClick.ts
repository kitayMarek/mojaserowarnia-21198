import { supabase } from "@/integrations/supabase/client";

// Wspólny pomiar kliknięć w linki do sklepów (afiliacja).
// Fire-and-forget — nigdy nie blokuje ani nie przerywa przejścia do sklepu.
// Używany przez BuyButton oraz wszystkie surowe linki do sklepu w bazie/porównywarce,
// żeby statystyki nie były zaniżone (każda kultura ma kilka linków do sklepu).
export function trackShopClick(cultureName: string, shopName: string) {
  try {
    supabase
      .from("culture_clicks")
      .insert({
        culture_name: cultureName,
        shop_name: shopName,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      })
      .then(
        () => {},
        () => {}
      );
  } catch {
    // cisza — pomiar nie może psuć UX
  }
}
