import { buildAffiliateUrl } from "@/utils/affiliateUrl";
import { trackShopClick } from "@/utils/trackShopClick";

interface BuyButtonProps {
  productUrl?: string | null;
  shopUrl?: string | null;
  shopName: string;
  cultureName: string;
}

const BuyButton = ({ productUrl, shopUrl, shopName, cultureName }: BuyButtonProps) => {
  const hasLink = !!(productUrl?.trim() || shopUrl?.trim());
  if (!hasLink) return null;

  const href = buildAffiliateUrl(productUrl, cultureName, shopName, shopUrl);

  const handleClick = () => trackShopClick(cultureName, shopName);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-block border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors px-3 py-1 rounded-md"
    >
      Kup w {shopName} →
    </a>
  );
};

export default BuyButton;
