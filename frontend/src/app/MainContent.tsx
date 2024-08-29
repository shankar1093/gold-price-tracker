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
    const fetchAndUpdateData = async () => {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
      } else {
        const newData = await fetchGoldDataFromServer();
        setData(newData);
        cacheData(newData);
      }
    };

    const scheduleNextUpdate = () => {
      const now = new Date();
      const nextUpdate = new Date(now);
      nextUpdate.setHours(9, 0, 0, 0);
      
      if (now >= nextUpdate) {
        nextUpdate.setDate(nextUpdate.getDate() + 1);
      }

      const msUntilNextUpdate = nextUpdate.getTime() - now.getTime();
      return setTimeout(() => {
        fetchAndUpdateData();
        scheduleNextUpdate();
      }, msUntilNextUpdate);
    };

    // Fetch data immediately on mount
    fetchAndUpdateData();

    // Schedule next update
    const timeoutId = scheduleNextUpdate();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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

function getCachedData(): HomePageProps | null {
  const cachedString = localStorage.getItem('goldPriceData');
  if (!cachedString) return null;

  const cached = JSON.parse(cachedString);
  const cachedDate = new Date(cached.date);
  const today = new Date();

  if (cachedDate.toDateString() === today.toDateString() && today.getHours() < 9) {
    return cached;
  }

  return null;
}

function cacheData(data: HomePageProps) {
  localStorage.setItem('goldPriceData', JSON.stringify(data));
}

export default MainContent;