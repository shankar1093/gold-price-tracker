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

  const fetchAndUpdateData = async () => {
    const newData = await fetchGoldDataFromServer();
    setData(newData);
  };

  useEffect(() => {
    // Fetch data immediately on mount
    fetchAndUpdateData();

    // Set up interval to fetch data every 5 minutes (300000 ms)
    const intervalId = setInterval(fetchAndUpdateData, 300000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="flex flex-col min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <MyCard title="22kt Gold Price" price={data.gold22kt} date={data.date} />
        <MyCard title="24kt Gold Price" price={data.gold24kt} date={data.date} />
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