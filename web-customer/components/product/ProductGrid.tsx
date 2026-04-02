import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: any[];
  columns?: 2 | 3 | 4;
}

export const ProductGrid = ({ products, columns = 4 }: ProductGridProps) => {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 md:gap-6 ${gridCols[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
