import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    const response = await fetch(`${backendUrl}/gold_rate_admin/photos/`);
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    // Django returns ["/media/photos/foo.jpg", ...]
    // Rewrite to /api/photo/photos/foo.jpg so the browser hits Next.js
    // (same origin) and Next.js proxies the file server-to-server.
    const paths: string[] = await response.json();
    const urls = paths.map((path) => `/api/photo${path}`);

    res.status(200).json(urls);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
}
