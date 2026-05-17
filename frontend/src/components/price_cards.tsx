'use client';
import React from 'react';

interface PriceCardProps {
  title: string;
  price: undefined | number;
  onBuy?: () => void;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price, onBuy }) => {
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

      {/* Right side: price + fixed-width icon slot so cards align consistently */}
      <div className="flex items-center gap-2">
        <span
          className="text-2xl sm:text-3xl md:text-4xl font-bold"
          style={{ color: 'hsl(var(--primary))' }}
        >
          ₹{displayPrice}
        </span>

        {/* Always reserve the same width whether icon is shown or not */}
        <div className="w-9 flex items-center justify-center">
          {onBuy && (
            <button
              onClick={onBuy}
              title="Buy"
              className="p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              style={{ color: 'hsl(var(--primary))' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
