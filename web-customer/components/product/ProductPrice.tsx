import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductPriceProps {
  price: number;
  discountPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductPrice = ({ price, discountPrice, className, size = 'md' }: ProductPriceProps) => {
  const currentPrice = discountPrice || price;
  
  const sizeClasses = {
    sm: "text-base",
    md: "text-lg md:text-xl",
    lg: "text-2xl md:text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className={cn("font-black text-primary tracking-tighter", sizeClasses[size])}>
        ₦{currentPrice.toLocaleString()}
      </span>
      {discountPrice && (
        <span className={cn("text-text-secondary line-through font-bold opacity-40", size === 'lg' ? "text-lg" : "text-[10px]")}>
          ₦{price.toLocaleString()}
        </span>
      )}
    </div>
  );
};
