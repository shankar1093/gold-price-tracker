// src/pages/api/gold_price.js
import { NextApiRequest, NextApiResponse } from 'next';

function price_adjustment(price: number) {
  return Math.round(price / 5) * 5;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let rate_22kt = null;
  let rate_24kt = null;
  let rate_24kt_9999 = null;
  let rate_18kt = null;
  let rate_silver = null;

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/gold_rate_admin/metal-rate/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    rate_18kt = data.rate_18kt;
    rate_22kt = data.rate_22kt;
    rate_24kt = data.rate_24kt;
    rate_24kt_9999 = data.rate_24kt_9999;
    rate_silver = data.rate_silver;
  } catch (error) {
    console.error('Error fetching gold price data:', error);
    return res.status(500).json({ error: 'Error fetching gold price data' });
  }

  res.status(200).json({
    gold18kt: rate_18kt,
    gold22kt: rate_22kt,
    gold24kt: rate_24kt,
    gold24kt9999: rate_24kt_9999,
    silver: rate_silver,
    date: new Date().toLocaleDateString("en-IN"),
  });
}