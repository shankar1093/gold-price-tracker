'use client';

import React from 'react';
import PriceCard from '../components/price_cards';
import ImageCard from '../components/image_card';

interface MainContentProps {
  gold18kt: number;
  gold22kt: number;
  gold24kt: number;
  silver: number;
  date: string;
  images: string[];
}

const GoldDivider = () => (
  <div className="flex items-center gap-3 w-full">
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #D1B000)' }} />
    <span style={{ color: '#D1B000' }} className="text-xs">◆</span>
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #D1B000)' }} />
  </div>
);

const MainContent: React.FC<MainContentProps> = ({ gold18kt, gold22kt, gold24kt, silver, date, images }) => {
  return (
    <main className="flex flex-col items-center p-4 sm:p-6 lg:p-10 xl:p-12 2xl:p-16">
      <div className="w-full max-w-7xl flex flex-col gap-6">

        {/* Section heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
            Today&apos;s Gold &amp; Silver Rates
          </h2>
          <GoldDivider />

          {/* Date badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            <span style={{ color: '#D1B000' }}>◆</span>
            Price Updated: {date}
            <span style={{ color: '#D1B000' }}>◆</span>
          </div>

          <p className="text-xs opacity-50 tracking-wide">
            Prices per gram &nbsp;·&nbsp; Exclusive of GST
          </p>
        </div>

        {/* Prices left, carousel right */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">

          <div className="flex flex-col gap-3 w-full lg:w-1/2">
            <PriceCard title="24kt Gold Price" price={gold24kt} />
            <PriceCard title="22kt Gold Price" price={gold22kt} />
            <PriceCard title="18kt Gold Price" price={gold18kt} />
            <PriceCard title="Silver Price"    price={silver} />
          </div>

          <div className="hidden lg:flex w-full lg:w-1/2 flex-col gap-2">
            <div className="rounded-lg overflow-hidden border-2" style={{ borderColor: '#D1B000' }}>
              <ImageCard className="w-full" images={images} />
            </div>
            <p className="text-xs text-center opacity-40 tracking-widest uppercase">Our Collection</p>
          </div>

        </div>
      </div>
    </main>
  );
};

export default MainContent;
