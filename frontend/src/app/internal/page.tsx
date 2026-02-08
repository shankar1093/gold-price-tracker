'use client';

import React, { useEffect, useState } from 'react';

interface InternalPricing {
  gold18kt: number;
  gold22kt: number;
  gold24kt: number;
  silver: number;
  // Add internal-specific fields
  gold22kt_buyback: number;
  arihant_rate_22kt: number;
  arihant_rate_24kt: number;
  date: string;
}

const fetchInternalPricing = async (): Promise<InternalPricing> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://python-backend:8080';
    const res = await fetch(`${backendUrl}/gold_rate_admin/metal-rate/`);
    const data = await res.json();

    return {
      gold18kt: data.rate_18kt || 0,
      gold22kt: data.rate_22kt || 0,
      gold24kt: data.rate_24kt || 0,
      silver: data.rate_silver || 0,
      gold22kt_buyback: Math.round((data.rate_22kt || 0) * 0.9), // 10% less
      arihant_rate_22kt: data.arihant_rate_22kt || 0,
      arihant_rate_24kt: data.arihant_rate_24kt || 0,
      date: data.date || new Date().toLocaleDateString("en-IN"),
    };
  } catch (error) {
    console.error('Error fetching internal pricing:', error);
    return {
      gold18kt: 0,
      gold22kt: 0,
      gold24kt: 0,
      silver: 0,
      gold22kt_buyback: 0,
      arihant_rate_22kt: 0,
      arihant_rate_24kt: 0,
      date: new Date().toLocaleDateString("en-IN"),
    };
  }
};

const PriceRow = ({ label, price, highlight = false }: { label: string; price: number; highlight?: boolean }) => (
  <tr className={highlight ? 'bg-yellow-50' : ''}>
    <td className="border px-4 py-3 font-medium">{label}</td>
    <td className="border px-4 py-3 text-right font-bold text-lg">
      ₹{price.toLocaleString('en-IN')}
    </td>
  </tr>
);

export default function InternalPage() {
  const [pricing, setPricing] = useState<InternalPricing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPricing = async () => {
      const data = await fetchInternalPricing();
      setPricing(data);
      setLoading(false);
    };
    loadPricing();

    // Refresh every 5 minutes
    const interval = setInterval(loadPricing, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-2">Internal Pricing</h1>
          <p className="text-center text-gray-500 mb-6">
            Updated: {pricing?.date}
          </p>

          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border px-4 py-3 text-left">Metal</th>
                <th className="border px-4 py-3 text-right">Rate/gram</th>
              </tr>
            </thead>
            <tbody>
              <PriceRow label="24K Gold" price={pricing?.gold24kt || 0} />
              <PriceRow label="22K Gold" price={pricing?.gold22kt || 0} highlight />
              <PriceRow label="18K Gold" price={pricing?.gold18kt || 0} />
              <PriceRow label="Silver (92.5)" price={pricing?.silver || 0} />
            </tbody>
          </table>

          <h2 className="text-xl font-bold mt-8 mb-4">Buyback Rates</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="border px-4 py-3 text-left">Type</th>
                <th className="border px-4 py-3 text-right">Rate/gram</th>
              </tr>
            </thead>
            <tbody>
              <PriceRow label="22K Gold Buyback" price={pricing?.gold22kt_buyback || 0} />
            </tbody>
          </table>

          {(pricing?.arihant_rate_22kt || pricing?.arihant_rate_24kt) ? (
            <>
              <h2 className="text-xl font-bold mt-8 mb-4">Arihant Reference Rates</h2>
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="border px-4 py-3 text-left">Type</th>
                    <th className="border px-4 py-3 text-right">Rate/gram</th>
                  </tr>
                </thead>
                <tbody>
                  <PriceRow label="Arihant 24K" price={pricing?.arihant_rate_24kt || 0} />
                  <PriceRow label="Arihant 22K" price={pricing?.arihant_rate_22kt || 0} />
                </tbody>
              </table>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
