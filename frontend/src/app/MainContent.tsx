'use client';

import React, { useState } from 'react';
import MyCard from '../components/price_cards';
import ImageCard from '../components/image_card';

const MainContent: React.FC<HomePageProps> = ({ gold22kt, gold24kt, date }) => {
  const [data] = useState<HomePageProps>({ gold22kt, gold24kt, date });

  return (
    <main className="flex-1 bg-background text-foreground p-4 flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <MyCard title="22kt Gold Price" price={data.gold22kt} date={data.date} />
        <MyCard title="24kt Gold Price" price={data.gold24kt} date={data.date} />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-lg font-bold mb-2">Gold Price Images</h2>
        <div className="flex-1 relative" style={{ minHeight: '300px' }}>
          <ImageCard className="absolute inset-0" />
        </div>
      </div>
    </main>
  );
};

export default MainContent;