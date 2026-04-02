import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const SectionTitle = ({ title, subtitle, align = 'left', className }: SectionTitleProps) => {
  return (
    <div
      className={cn(
        "mb-10",
        align === 'center' && "text-center",
        align === 'right' && "text-right",
        className
      )}
    >
      <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3 uppercase tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-secondary text-base md:text-lg max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};
