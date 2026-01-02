import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface SeeAlsoLink {
  title: string;
  href: string;
  description?: string;
}

interface SeeAlsoProps {
  links: SeeAlsoLink[];
  title?: string;
}

const SeeAlso = ({ links, title = "Zobacz też" }: SeeAlsoProps) => {
  if (links.length === 0) return null;

  return (
    <Card className="mt-12 bg-secondary/30 border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span>📚</span> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <nav aria-label="Powiązane artykuły">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.href}
                  className="group flex items-start gap-2 p-3 rounded-lg border border-border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  <div>
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">
                      {link.title}
                    </span>
                    {link.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {link.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
};

export default SeeAlso;
