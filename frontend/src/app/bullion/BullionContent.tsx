'use client';

import { useEffect, useState } from 'react';
import PriceCard from '../../components/price_cards';

interface LiveRate {
  rate_999_per_10gram: number;
  rate_22kt_per_10gram: number;
  rate_18kt_per_10gram: number;
  valid: boolean;
}

const GoldDivider = () => (
  <div className="flex items-center gap-3 w-full">
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #D1B000)' }} />
    <span style={{ color: '#D1B000' }} className="text-xs">◆</span>
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #D1B000)' }} />
  </div>
);

const BullionContent = () => {
  const [liveRate, setLiveRate] = useState<LiveRate | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const es = new EventSource('http://localhost:8080/live_rate_stream');
    es.onmessage = (event) => {
      setLiveRate(JSON.parse(event.data));
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  return (
    <main className="flex flex-col items-center p-4 sm:p-6 lg:p-10 xl:p-12 2xl:p-16">
      <div className="w-full max-w-7xl flex flex-col gap-6">

        {/* Section heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
            Live Bullion Rates
          </h2>
          <GoldDivider />

          {/* Date badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            <span style={{ color: '#D1B000' }}>◆</span>
            {lastUpdated ? `Last Updated: ${lastUpdated}` : 'Connecting...'}
            <span style={{ color: '#D1B000' }}>◆</span>
          </div>

          <p className="text-xs opacity-50 tracking-wide">
            Prices per gram &nbsp;·&nbsp; Exclusive of GST &nbsp;·&nbsp; Live rate
          </p>
        </div>

        {/* Price cards */}
        <div className="flex flex-col gap-3 w-full lg:w-1/2">
          <PriceCard title="Gold 999" price={liveRate?.rate_999_per_10gram} />
        </div>

      </div>
    </main>
  );
};

export default BullionContent;
