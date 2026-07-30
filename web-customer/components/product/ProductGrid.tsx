import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  columns?: 2 | 3 | 4;
}

export const ProductGrid = ({ products, columns = 4 }: ProductGridProps) => {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  return (
    <div className={`grid gap-3 md:gap-4 ${gridCols[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
