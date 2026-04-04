import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/gold_rate_admin/photos/`);
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    // Django returns fully-qualified S3 URLs — pass them straight through.
    const urls: string[] = await response.json();
    res.status(200).json(urls);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
}
