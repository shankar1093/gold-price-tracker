// src/pages/api/gold_price.js
import { NextApiRequest, NextApiResponse } from 'next';

function price_adjustment(price: number) {
  return Math.round(price / 5) * 5;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let rate_22kt = null;
  let rate_24kt = null;
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/gold_rate_admin/gold-rate/`);
    console.log(backendUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response data:", data);

    rate_22kt = data.rate_22kt;
    rate_24kt = data.rate_24kt;
  } catch (error) {
    console.error('Error fetching gold price data:', error);
    return res.status(500).json({ error: 'Error fetching gold price data' });
  }

  res.status(200).json({
    gold22kt: rate_22kt,
    gold24kt: rate_24kt,
    date: new Date().toLocaleDateString("en-IN"),
  });
}