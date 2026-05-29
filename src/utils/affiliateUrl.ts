const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/\s+/g, "-");

export function buildAffiliateUrl(
  productUrl: string | undefined | null,
  cultureName: string,
  shopName: string,
  shopUrl?: string | null
): string {
  const base = productUrl && productUrl.trim() ? productUrl : (shopUrl || "");
  if (!base) return "";

  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", "mojaserowarnia");
    url.searchParams.set("utm_medium", "baza_kultur");
    url.searchParams.set("utm_campaign", slugify(shopName));
    url.searchParams.set("utm_content", slugify(cultureName).slice(0, 50));
    return url.toString();
  } catch {
    return base;
  }
}
