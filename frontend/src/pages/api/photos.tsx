import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    // PUBLIC_BACKEND_URL is the externally accessible URL for the Django backend.
    // Used to rewrite /media/ paths so the browser can load the images.
    const publicBackendUrl = process.env.PUBLIC_BACKEND_URL || backendUrl;

    const response = await fetch(`${backendUrl}/gold_rate_admin/photos/`);
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const paths: string[] = await response.json();
    const urls = paths.map((path) => `${publicBackendUrl}${path}`);

    res.status(200).json(urls);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
}
