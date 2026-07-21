'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type SectionHeadingProps = {
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: 'h1' | 'h2';
  animate?: boolean;
  className?: string;
  titleClassName?: string;
};

const baseTitleClass = 'font-black uppercase tracking-tighter text-neutral-950 text-3xl md:text-4xl';

export function SectionHeading({
  label,
  title,
  description,
  action,
  as = 'h2',
  animate = true,
  className = 'mb-10',
  titleClassName = baseTitleClass,
}: SectionHeadingProps) {
  const Title = as;
  const hasAction = Boolean(action);

  const content = (
    <>
      <div>
        {label ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">{label}</p>
        ) : null}
        <Title className={titleClassName}>{title}</Title>
        {description ? (
          <p className="text-neutral-500 mt-3 max-w-lg text-sm md:text-base leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action}
    </>
  );

  const layoutClass = hasAction ? `flex items-end justify-between gap-4 ${className}` : className;

  if (!animate) {
    return <div className={layoutClass}>{content}</div>;
  }

  return (
    <motion.div
      className={layoutClass}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  );
}
