import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Container } from "./Container";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <div className="bg-card border-b border-border py-3">
      <Container>
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-sm">
          <Link 
            href="/" 
            className="text-text-secondary hover:text-primary transition-colors flex items-center"
          >
            <Home className="h-4 w-4" />
          </Link>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-text-secondary/40" />
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-text-primary">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </Container>
    </div>
  );
};
