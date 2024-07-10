// src/pages/api/gold_price.js
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let gold995WithGST = null;
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8080';
    const response = await fetch(`${backendUrl}/gold_price`);
    const data = await response.json();
    gold995WithGST = data.find((item: { description: string; }) => item.description === 'GOLD 995 WITH GST ');
  } catch (error) {
    console.error('Error fetching gold price data:', error);
    return res.status(500).json({ error: 'Error fetching gold price data' });
  }

  const gold24ktPrice = gold995WithGST && !isNaN(parseFloat(gold995WithGST.bid)) ? parseFloat(gold995WithGST.bid) / 10 : 7200;
  const gold22ktPrice = !isNaN(gold24ktPrice) ? (916 / 995) * gold24ktPrice : 6500;

  res.status(200).json({
    gold22kt: gold22ktPrice,
    gold24kt: gold24ktPrice,
    date: new Date().toLocaleDateString("en-IN"),
  });
}