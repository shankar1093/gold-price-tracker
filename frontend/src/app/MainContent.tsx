'use client';

import React, { useEffect, useState } from 'react';
import PriceCard from '../components/price_cards';
import ImageCard from '../components/image_card';

interface HomePageProps {
  gold18kt: number;
  gold22kt: number;
  gold24kt: number;
  silver: number;
  date: string;
}

const fetchGoldDataFromServer = async (): Promise<HomePageProps> => {
  try {
    // For static export: try to fetch from pre-built static JSON first
    const staticRes = await fetch('/data/prices.json');
    if (staticRes.ok) {
      const data = await staticRes.json();
      return {
        gold18kt: data.gold18kt || 0,
        gold22kt: data.gold22kt || 0,
        gold24kt: data.gold24kt || 0,
        silver: data.silver || 0,
        date: data.date || new Date().toLocaleDateString("en-IN"),
      };
    }
  } catch {
    // Static file not available, fall through to backend API
  }

  try {
    // Fallback: fetch from backend API (for development)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/gold_rate_admin/metal-rate/`);
    const data = await res.json();
    return {
      gold18kt: data.rate_18kt || 0,
      gold22kt: data.rate_22kt || 0,
      gold24kt: data.rate_24kt || 0,
      silver: data.rate_silver || 0,
      date: data.date || new Date().toLocaleDateString("en-IN"),
    };
  } catch (error) {
    console.error('Error fetching gold price data:', error);
    return {
      gold18kt: 0,
      gold22kt: 0,
      gold24kt: 0,
      silver: 0,
      date: new Date().toLocaleDateString("en-IN"),
    };
  }
};

const MainContent: React.FC<HomePageProps> = ({ gold18kt, gold22kt, gold24kt, silver, date }) => {
  const [data, setData] = useState<HomePageProps>({ gold18kt, gold22kt, gold24kt, silver, date });

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
    <main className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 xl:p-12 2xl:p-16">
      {/* Date above everything, as plain text */}
      <div className="w-full max-w-7xl mb-4 flex justify-end">
        <span className="text-primary text-2xl font-medium">
          Price Updated: {data.date}
        </span>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
        {/* Price Cards Section */}
        <div className="flex flex-col gap-4 w-full lg:w-1/2">
          <PriceCard title="24kt Gold Price"  price={data.gold24kt} />
          <PriceCard title="22kt Gold Price" price={data.gold22kt} />
          <div className='block md:hidden flex flex-col gap-4'>
            <PriceCard title="Gold Buy Back (22kt)" price={(data.gold22kt-data.gold22kt*0.1)} />
          </div>
          <PriceCard title="18kt Gold Price" price={data.gold18kt}/>
          <PriceCard title="Silver Price" price={data.silver}/>
        </div>

        {/* Image Section */}
        <div className="hidden lg:block w-full lg:w-1/2 h-full">
          <ImageCard className="w-full h-full" />
        </div>
      </div>
    </main>
  );
};


export default MainContent;