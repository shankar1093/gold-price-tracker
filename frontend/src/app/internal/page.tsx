import React from 'react';
import MainContent from './MainContent';

const HomePage = async () => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

  let prices = { gold18kt: 0, gold22kt: 0, gold24kt: 0, silver: 0 };
  try {
    const res = await fetch(`${backendUrl}/gold_rate_admin/metal-rate/`, { cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      prices = {
        gold18kt: data.rate_18kt ?? 0,
        gold22kt: data.rate_22kt ?? 0,
        gold24kt: data.rate_24kt ?? 0,
        silver:   data.rate_silver ?? 0,
      };
    }
  } catch (e) {
    console.error('Build-time price fetch failed (internal):', e);
  }

  let photos: string[] = [];
  try {
    const res = await fetch(`${backendUrl}/gold_rate_admin/photos/`, { cache: 'force-cache' });
    if (res.ok) photos = await res.json();
  } catch (e) {
    console.error('Build-time photo fetch failed (internal):', e);
  }

  return (
    <div className="flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto">
          <MainContent
            gold18kt={prices.gold18kt}
            gold22kt={prices.gold22kt}
            gold24kt={prices.gold24kt}
            silver={prices.silver}
            date={new Date().toLocaleDateString('en-IN')}
            images={photos}
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
