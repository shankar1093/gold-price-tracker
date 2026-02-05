export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const userId = env.INSTAGRAM_USER_ID;
    const accessToken = env.INSTAGRAM_ACCESS_TOKEN;

    if (!userId || !accessToken) {
      return new Response(JSON.stringify({ error: 'Missing Instagram credentials' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/v22.0/${userId}/media?fields=id,media_type,media_url,thumbnail_url&access_token=${accessToken}`
      );
      const data = await response.json();

      if (!data || !data.data) {
        return new Response(JSON.stringify({ error: 'No media found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Filter for images only
      let images = data.data
        .filter(item => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM')
        .map(item => item.media_url);

      // Handle pagination
      let nextPage = data.paging?.next;
      while (nextPage) {
        const nextResponse = await fetch(nextPage);
        const nextData = await nextResponse.json();
        if (nextData && nextData.data) {
          const moreImages = nextData.data
            .filter(item => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM')
            .map(item => item.media_url);
          images.push(...moreImages);
        }
        nextPage = nextData.paging?.next;
      }

      return new Response(JSON.stringify(images), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Error fetching Instagram images' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
