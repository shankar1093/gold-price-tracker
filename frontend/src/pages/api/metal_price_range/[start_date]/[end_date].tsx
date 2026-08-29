import { NextApiRequest, NextApiResponse } from 'next';

interface MetalRate {
  date: string;
  rate_22kt: number;
  rate_24kt: number;
  rate_24kt_9999: number;
  rate_18kt: number;
  rate_silver: number;
  arihant_rate_22kt: number;
  arihant_rate_24kt: number;
  arihant_rate_18kt: number;
  arihant_rate_silver: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { start_date, end_date } = req.query;
  const api_key = req.headers['x-api-key'];
  if (api_key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!start_date || !end_date || Array.isArray(start_date) || Array.isArray(end_date)) {
    return res.status(400).json({ error: 'Invalid start_date or end_date' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/gold_rate_admin/metal-rate/${start_date}/${end_date}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    let responses: MetalRate[];

    if (Array.isArray(data.rates)) {
      // If the response contains an 'objects' array
      responses = data.rates.map((rate: MetalRate) => ({
        date: rate.date,
        rate_22kt: rate.rate_22kt,
        rate_24kt: rate.rate_24kt,
        rate_24kt_9999: rate.rate_24kt_9999,
        rate_18kt: rate.rate_18kt,
        rate_silver: rate.rate_silver,
        arihant_rate_22kt: rate.arihant_rate_22kt,
        arihant_rate_24kt: rate.arihant_rate_24kt,
        arihant_rate_silver: rate.arihant_rate_silver,
      }));
    }
    else {
      throw new Error('Unexpected response format');
    }

    res.status(200).json({ responses });
  } catch (error) {
    console.error('Error fetching gold price data:', error);
    res.status(500).json({ error: 'Error fetching gold price data' });
  }
}


