import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AMERICAN CEMENTS USA BRAND SHAPE (Ribbon A)
 * Vector icon brand element:
 * - Trazo Diagonal Rojo (Pantone Red 032c #F22331)
 * - Trazo Diagonal Azul (Pantone 293c #002B99)
 */
export function BrandRibbon({ className, size = 'default' }) {
  const isCompact = size === 'compact';
  const width = isCompact ? 28 : 36;
  const height = isCompact ? 16 : 20;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 36 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
    >
      {/* Elemento Diagonal Rojo (Pantone Red 032c) */}
      <path
        d="M2 18L14 6C15.2 4.8 17.5 4.8 18.7 6L15.5 9.2C14.8 8.5 13.5 8.5 12.8 9.2L5.5 16.5C4.5 17.5 3 18 2 18Z"
        fill="#F22331"
      />
      {/* Elemento Diagonal Azul (Pantone 293c) */}
      <path
        d="M17.3 14L20.5 10.8C21.2 11.5 22.5 11.5 23.2 10.8L30.5 3.5C31.5 2.5 33 2 34 2L22 14C20.8 15.2 18.5 15.2 17.3 14Z"
        fill="#002B99"
      />
    </svg>
  );
}
