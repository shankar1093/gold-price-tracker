// src/pages/api/gold_price.js
import { NextApiRequest, NextApiResponse } from 'next';

function price_adjustment(price: number) {
  let rounding_val = price % 100;
  if (rounding_val > 75) {
    price = price - rounding_val + 100;
  } else if (rounding_val > 25) { // Adjusted condition to correctly check the value
    price = price - rounding_val + 50;
  } else {
    price = price - rounding_val;
  }
  return price;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let gold995WithGST = null;
  try {
    // use localhost:8080 if deploying on FARGATE via ECS
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8080';
    const response = await fetch(`${backendUrl}/gold_price`);
    const data = await response.json();
    
    // Updated to match only on "Gold 995(1KG) INDIAN-BIS"
    gold995WithGST = data.find((item: { description: string; }) => 
      item.description.startsWith('Gold 995(1KG) INDIAN-BIS')
    );
  } catch (error) {
    console.error('Error fetching gold price data:', error);
    return res.status(500).json({ error: 'Error fetching gold price data' });
  }

  const gold24ktPrice = gold995WithGST && !isNaN(parseFloat(gold995WithGST.ask)) ? parseFloat(gold995WithGST.ask) / 10 : 0;
  const gold22ktPrice = !isNaN(gold24ktPrice) ? (916 / 995) * gold24ktPrice : 0;

  const adjustedGold22ktPrice = price_adjustment(gold22ktPrice);
  const adjustedGold24ktPrice = price_adjustment(gold24ktPrice);
  

  res.status(200).json({
    gold22kt: adjustedGold22ktPrice,
    gold24kt: adjustedGold24ktPrice,
    gold22kt_raw: gold22ktPrice,
    gold24kt_raw: gold24ktPrice,
    date: new Date().toLocaleDateString("en-IN"),
  });
}