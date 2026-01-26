import React from 'react';
import Link from 'next/link';
import MainContent from './MainContent';
import Footer from '../components/footer';
import Header from '../components/header';

// Fetch prices server-side at build time
async function getMetalPrices() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://python-backend:8000';
    const res = await fetch(`${backendUrl}/gold_rate_admin/metal-rate/`, {
      next: { revalidate: 86400 } // Revalidate every 24 hours (86400 seconds)
    });

    if (!res.ok) {
      throw new Error('Failed to fetch metal prices');
    }

    const data = await res.json();
    return {
      gold18kt: data.rate_18kt || 0,
      gold22kt: data.rate_22kt || 0,
      gold24kt: data.rate_24kt || 0,
      silver: data.rate_silver || 0,
      date: data.date || new Date().toLocaleDateString("en-IN"),
    };
  } catch (error) {
    console.error('Error fetching prices server-side:', error);
    // Return default values if fetch fails
    return {
      gold18kt: 0,
      gold22kt: 0,
      gold24kt: 0,
      silver: 0,
      date: new Date().toLocaleDateString("en-IN"),
    };
  }
}

const HomePage = async () => {
  const prices = await getMetalPrices();

  return (
    <div className="flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto">
          <MainContent
            gold18kt={prices.gold18kt}
            gold22kt={prices.gold22kt}
            gold24kt={prices.gold24kt}
            silver={prices.silver}
            date={prices.date}
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;