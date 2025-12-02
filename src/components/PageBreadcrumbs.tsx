import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItemType[];
  baseUrl?: string;
}

const PageBreadcrumbs = ({ items, baseUrl = "https://serowarstwo.pl" }: PageBreadcrumbsProps) => {
  // Build full breadcrumb path including home
  const homeItem = { name: "Strona główna", url: baseUrl };
  
  const schemaItems = [
    homeItem,
    ...items.map((item, index) => ({
      name: item.label,
      url: item.href ? `${baseUrl}${item.href}` : `${baseUrl}${window.location.pathname}`
    }))
  ];

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      
      <div className="container mx-auto px-4 py-4 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:inline">Strona główna</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              
              return (
                <div key={index} className="flex items-center gap-1.5">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </>
  );
};

export default PageBreadcrumbs;
