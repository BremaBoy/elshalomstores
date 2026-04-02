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
    <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 py-3">
      <Container>
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-sm">
          <Link 
            href="/" 
            className="text-slate-500 hover:text-primary transition-colors flex items-center"
          >
            <Home className="h-4 w-4" />
          </Link>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-slate-300" />
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-slate-500 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-900 dark:text-white">
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
