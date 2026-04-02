import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'warning';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className }: BadgeProps) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-white border-transparent',
    outline: 'bg-transparent text-text-secondary border-border',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
