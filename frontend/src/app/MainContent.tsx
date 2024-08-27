'use client';

import React, { useEffect, useState } from 'react';
import MyCard from '../components/price_cards';
import ImageCard from '../components/image_card';

interface HomePageProps {
  gold22kt: number;
  gold24kt: number;
  date: string;
}


const fetchGoldDataFromServer = async (): Promise<HomePageProps> => {
  try {
    const res = await fetch('/api/gold_price');
    return await res.json();
  } catch (error) {
    console.error('Error fetching gold price data, MC:', error);
    return {
      gold22kt: 0,
      gold24kt: 0,
      date: new Date().toLocaleDateString("en-IN"),
    };
  }
};

const MainContent: React.FC<HomePageProps> = ({ gold22kt, gold24kt, date }) => {
  const [data, setData] = useState<HomePageProps>({ gold22kt, gold24kt, date });
  useEffect(() => {
    const refreshData = async () => {
      const newData = await fetchGoldDataFromServer();
      setData(newData);
    };

    // Immediate refresh after 2 seconds on startup
    const timeoutId = setTimeout(refreshData, 2000);
    // Calculate time until next 9 AM
    const now = new Date();
    const nextNineAM = new Date(now);
    nextNineAM.setHours(9, 0, 0, 0); // Set time to 9 AM today

    if (now.getHours() >= 9) {
      nextNineAM.setDate(nextNineAM.getDate() + 1); // If it's past 9 AM today, set to 9 AM tomorrow
    }

    const msUntilNineAM = nextNineAM.getTime() - now.getTime();

    // Refresh at next 9 AM and then every 24 hours
    const dailyTimeoutId = setTimeout(() => {
      refreshData();
      setInterval(refreshData, 24 * 60 * 60 * 1000); // Refresh every 24 hours
    }, msUntilNineAM);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(dailyTimeoutId);
    };
  }, [data]);

  return (
    <main className="flex flex-col min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <MyCard title="22kt Gold Price" price={data.gold22kt} date={date} />
        <MyCard title="24kt Gold Price" price={data.gold24kt} date={date} />
      </div>
      <div className="flex-grow flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Our Jewellery</h2>
        <div className="flex-grow">
          <ImageCard className="w-full h-full" />
        </div>
      </div>
    </main>
  );
};

export default MainContent;