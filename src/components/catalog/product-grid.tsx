'use client';

import { motion } from 'framer-motion';
import { ProductCard } from './product-card';
import type { Product } from '@/src/types';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type ProductGridProps = {
  products: Product[];
  className?: string;
};

export function ProductGrid({
  products,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8',
}: ProductGridProps) {
  return (
    <motion.div
      className={className}
      variants={gridVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {products.map((product, index) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} index={index} animateOnMount={false} />
        </motion.div>
      ))}
    </motion.div>
  );
}
