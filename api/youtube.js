// YouTube Data API v3 - fetches recent videos with stats
// Requires GOOGLE_API_KEY with YouTube Data API enabled

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { channelIds } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(200).json({ results: {}, error: 'No GOOGLE_API_KEY' });
  if (!channelIds?.length) return res.status(400).json({ error: 'channelIds required' });

  const results = {};

  for (const channelId of channelIds.slice(0, 10)) {
    try {
      // Get channel info
      const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`);
      const chData = await chRes.json();
      const channel = chData.items?.[0];

      // Get recent videos (last 10)
      const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`);
      const searchData = await searchRes.json();
      const videoIds = (searchData.items || []).map(v => v.id.videoId).filter(Boolean);

      let videos = [];
      if (videoIds.length > 0) {
        const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`);
        const statsData = await statsRes.json();
        videos = (statsData.items || []).map(v => ({
          title: v.snippet.title,
          published: v.snippet.publishedAt,
          views: parseInt(v.statistics.viewCount || '0'),
          likes: parseInt(v.statistics.likeCount || '0'),
          comments: parseInt(v.statistics.commentCount || '0'),
          duration: v.contentDetails.duration,
          thumbnail: v.snippet.thumbnails?.medium?.url,
          url: `https://youtube.com/watch?v=${v.id}`,
          description: (v.snippet.description || '').substring(0, 300),
        }));
      }

      results[channelId] = {
        name: channel?.snippet?.title || channelId,
        subscribers: parseInt(channel?.statistics?.subscriberCount || '0'),
        totalViews: parseInt(channel?.statistics?.viewCount || '0'),
        totalVideos: parseInt(channel?.statistics?.videoCount || '0'),
        videos,
      };

      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      results[channelId] = { error: e.message };
    }
  }

  return res.status(200).json({ results });
}
