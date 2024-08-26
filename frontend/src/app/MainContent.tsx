'use client';

import React from 'react';
import MyCard from '../components/price_cards';
import ImageCard from '../components/image_card';

const MainContent: React.FC<{
  gold22kt: number;
  gold24kt: number;
  date: string;
}> = ({ gold22kt, gold24kt, date }) => {
  return (
    <main className="flex-1 bg-background text-foreground p-4 flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
        <div className="mt-4"> 
          <MyCard title="22kt Gold Price" price={gold22kt} date={date} />
        </div>
        <div className="mt-4"> 
          <MyCard title="24kt Gold Price" price={gold24kt} date={date} />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-2xl font-bold mb-2 text-center">Our Jewellery</h2> 
        <div className="flex-1 relative mt-4" style={{ minHeight: '300px' }}>
          <ImageCard className="absolute inset-0" />
        </div>
      </div>
    </main>
  );
};

export default MainContent;