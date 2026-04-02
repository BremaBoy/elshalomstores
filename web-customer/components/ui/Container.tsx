import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

export const Container = ({ children, className, fluid = false }: ContainerProps) => {
  return (
    <div
      className={cn(
        "mx-auto px-4 md:px-6 lg:px-8",
        fluid ? "max-w-full" : "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
};
