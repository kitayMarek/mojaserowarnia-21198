import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface TLDRSectionProps {
  children: React.ReactNode;
  title?: string;
}

const TLDRSection = ({ children, title = "W skrócie (TL;DR)" }: TLDRSectionProps) => {
  return (
    <Card className="mb-8 bg-primary/5 border-primary/20 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2 text-primary">{title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TLDRSection;
