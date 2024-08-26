import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  try {
    // Fetch media from Instagram
    const response = await fetch(`https://graph.instagram.com/v12.0/${userId}/media?fields=id,media_type,media_url,thumbnail_url&access_token=${accessToken}`);
    const data = await response.json();

    // Check if the response contains data
    if (!data || !data.data) {
      return res.status(404).json({ error: 'No media found' });
    }

    // Filter for images only
    const images = data.data.filter((item: any) => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM').map((item: any) => item.media_url);

    // Fetch additional media if necessary (pagination)
    let nextPage = data.paging?.next;
 
    while (nextPage) {
      const nextResponse = await fetch(nextPage);
      const nextData = await nextResponse.json();
      if (nextData && nextData.data) {
        const moreImages = nextData.data.filter((item: any) => item.media_type === 'IMAGE').map((item: any) => item.media_url);
        images.push(...moreImages);
      }
      nextPage = nextData.paging?.next;
    }

    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching Instagram images:', error);
    res.status(500).json({ error: 'Error fetching Instagram images' });
  }
}