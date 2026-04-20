'use client';

import React from 'react';
import PriceCard from '../../components/price_cards';
import ImageCard from '../../components/image_card';

interface MainContentProps {
  gold18kt: number;
  gold22kt: number;
  gold24kt: number;
  silver: number;
  date: string;
  images: string[];
}

const MainContent: React.FC<MainContentProps> = ({ gold18kt, gold22kt, gold24kt, silver, date, images }) => {
  return (
    <main className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 xl:p-12 2xl:p-16">
      <div className="w-full max-w-7xl mb-4 flex justify-end">
        <span className="text-primary text-2xl font-medium">
          Price Updated: {date}
        </span>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
        <div className="flex flex-col gap-4 w-full lg:w-1/2">
          <PriceCard title="24kt Gold Price (with GST)"  price={gold24kt * 1.03} />
          <PriceCard title="24kt Gold Price (Retail)"    price={gold24kt * 1.04} />
          <PriceCard title="22kt Gold Price"             price={gold22kt} />
          <PriceCard title="Gold Buy Back (22kt)"        price={gold22kt - gold22kt * 0.1} />
          <PriceCard title="18kt Gold Price"             price={gold18kt} />
          <PriceCard title="Silver Price"                price={silver} />
          <PriceCard title="Diamond Price"               price={70000} />
        </div>

        <div className="hidden lg:block w-full lg:w-1/2 h-full">
          <ImageCard className="w-full h-full" images={images} />
        </div>
      </div>
    </main>
  );
};

export default MainContent;
