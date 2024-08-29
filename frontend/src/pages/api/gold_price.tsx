// src/pages/api/gold_price.js
import { NextApiRequest, NextApiResponse } from 'next';

function price_adjustment(price: number) {
  return Math.round(price / 5) * 5;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let gold995WithGST = null;
  try {
    // use localhost:8080 if deploying on FARGATE via ECS
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8080';
    const response = await fetch(`${backendUrl}/gold_price`);
    const data = await response.json();
    console.log(data[6].description.toLowerCase());
    // Updated to match only on "Gold 995(1KG) INDIAN-BIS"
    gold995WithGST = data.find((item: { description: string; }) => {
      const desc = item.description.toLowerCase().replace(/\s+/g, ' ').trim();
      return desc.includes('gold 995') && 
             desc.includes('1kg') && 
             desc.includes('indian') && 
             desc.includes('bis');
    });
  } catch (error) {
    console.error('Error fetching gold price data:', error);
    return res.status(500).json({ error: 'Error fetching gold price data' });
  }

  const gold24ktPrice = gold995WithGST && !isNaN(parseFloat(gold995WithGST.ask)) ? parseFloat(gold995WithGST.ask) / 10 : 0;
  const gold22ktPrice = !isNaN(gold24ktPrice) ? (920 / 995) * gold24ktPrice : 0;

  const adjustedGold22ktPrice = price_adjustment(gold22ktPrice*1.013) // Increased by 1.5%
  const adjustedGold24ktPrice = price_adjustment(gold24ktPrice*1.013) // Increased by 1.5%
  
  res.status(200).json({
    gold22kt: adjustedGold22ktPrice,
    gold24kt: adjustedGold24ktPrice,
    gold22kt_raw: gold22ktPrice,
    gold24kt_raw: gold24ktPrice,
    date: new Date().toLocaleDateString("en-IN"),
  });
}