'use client';

import React, { useEffect, useState } from 'react';
import MyCard from '../components/price_cards';
import TimeseriesChart from '../components/price_series_chart';

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
    console.error('Error fetching gold price data:', error);
    return {
      gold22kt: 6500,
      gold24kt: 7200,
      date: new Date().toLocaleDateString("en-IN"),
    };
  }
};

const MainContent = ({ gold22kt, gold24kt, date }: HomePageProps) => {
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
  }, []);

  return (
    <div className="flex flex-col justify-center flex-grow">
      <main className="flex-1 bg-background text-foreground py-6 px-4 flex flex-col justify-center">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
          <MyCard title="22kt Gold Price" price={data.gold22kt} date={data.date} />
          <MyCard title="24kt Gold Price" price={data.gold24kt} date={data.date} />
        </div>
        <div className="container mx-auto mt-6 flex-grow flex flex-col justify-center">
          <div className="bg-card rounded-lg shadow-lg p-6 flex-grow flex flex-col justify-center mb-4">
            <h2 className="text-xl font-bold mb-4">Gold Price Trends</h2>
            <div className="w-full h-[300px] flex-grow">
              <TimeseriesChart className="chart" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainContent;