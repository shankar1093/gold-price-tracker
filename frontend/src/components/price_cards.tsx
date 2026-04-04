'use client';
import React from 'react';

interface PriceCardProps {
  title: string;
  price: undefined | number;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price }) => {
  const displayPrice = isNaN(Number(price)) ? 'N/A' : Math.floor(price || 0).toLocaleString('en-IN');

  return (
    <div
      className="
        w-full rounded-lg p-4 md:p-5 xl:p-6
        bg-card border border-border
        flex items-center justify-between
        transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        relative overflow-hidden
      "
    >
      {/* Gold left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ background: 'linear-gradient(to bottom, hsl(42,77%,44%), hsl(44,85%,60%))' }}
      />

      <span className="pl-3 text-base sm:text-lg md:text-xl font-medium text-foreground opacity-80">
        {title}
      </span>

      <span
        className="text-2xl sm:text-3xl md:text-4xl font-bold"
        style={{ color: 'hsl(var(--primary))' }}
      >
        ₹{displayPrice}
      </span>
    </div>
  );
};

export default PriceCard;
