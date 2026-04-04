import { NextApiRequest, NextApiResponse } from 'next';

// Proxies /api/photo/media/photos/<filename> -> Django MEDIA_URL
// This keeps image requests same-origin so the browser never needs to
// know the Django backend's internal hostname.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { slug } = req.query;
    const filePath = Array.isArray(slug) ? slug.join('/') : slug;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    const upstream = await fetch(`${backendUrl}/${filePath}`);
    if (!upstream.ok) {
      return res.status(upstream.status).end();
    }

    const buffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error proxying photo:', error);
    res.status(500).end();
  }
}
