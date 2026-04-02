import { kv } from '@vercel/kv';

const SYSTEM = `You are a Content Research Agent for D-DOUBLEU MEDIA. You monitor content creators, competitors, and industry voices daily. Your job: find what's working, what's trending, and what content Dennis should create next.

You receive:
1. YOUTUBE DATA — exact stats (views, likes, comments, upload date) for recent videos from monitored channels
2. WEB SEARCH ACCESS — use it to check Twitter/X accounts and Instagram accounts for recent posts, engagement, and trends

Your job:
- For each monitored account, identify their most recent content and performance
- Spot content that's performing unusually well (viral signals)
- Identify patterns: what topics, formats, hooks are getting the most engagement
- Connect trends across platforms — if a topic is hot on Twitter AND YouTube, that's a signal
- Produce specific content ideas Dennis should create based on what's working

Use web_search to check each Twitter/X handle for recent tweets and engagement, and each Instagram handle for recent posts.

Respond ONLY in valid JSON:
{
  "date": "YYYY-MM-DD",
  "executive_summary": "3-5 sentences. What's happening today. Lead with the most actionable finding.",

  "platform_breakdown": {
    "youtube": {
      "channels_analyzed": 0,
      "top_performing": [
        {"channel": "", "video_title": "", "views": 0, "age": "e.g. 2 days", "why_its_working": "", "url": ""}
      ],
      "patterns": ["What's working across YouTube channels right now"],
      "content_gaps": ["Topics/formats these channels AREN'T covering that Dennis could"]
    },
    "twitter": {
      "accounts_analyzed": 0,
      "viral_posts": [
        {"account": "", "post_summary": "", "engagement_signal": "", "url_if_found": ""}
      ],
      "hot_topics": ["Topics getting the most engagement on Twitter"],
      "thread_patterns": ["Thread styles/hooks working well"]
    },
    "instagram": {
      "accounts_analyzed": 0,
      "top_posts": [
        {"account": "", "post_type": "reel/carousel/static", "topic": "", "engagement_signal": ""}
      ],
      "format_trends": ["What IG formats are performing"],
      "caption_patterns": ["Caption styles getting engagement"]
    }
  },

  "viral_signals": [
    {
      "signal": "What's going viral or picking up",
      "platform": "YouTube/Twitter/Instagram/Cross-platform",
      "velocity": "fast/building/early",
      "relevance": "How relevant to Dennis's audience",
      "action": "What to do about it"
    }
  ],

  "content_ideas": [
    {
      "priority": 1,
      "idea": "Specific content idea",
      "platform": "Twitter/YouTube/Instagram/All",
      "format": "Tweet/Thread/Short-form video/Reel/Carousel/Long-form video",
      "hook": "The opening hook",
      "angle": "Strategic angle",
      "why_now": "Why this content this day — what data supports it",
      "reference": "Which monitored account or trend inspired this",
      "estimated_effort": "Quick (30 min) / Medium (1-2 hrs) / Deep (half day+)"
    }
  ],

  "competitor_moves": [
    {"who": "", "what": "", "engagement": "", "take": "Dennis's strategic response"}
  ],

  "weekly_trends": {
    "rising_topics": ["Topics gaining momentum this week"],
    "declining_topics": ["Topics losing steam — move on"],
    "format_shifts": ["Format changes across platforms"]
  },

  "raw_stats": {
    "youtube_channels": 0,
    "twitter_accounts": 0,
    "instagram_accounts": 0,
    "total_content_pieces_analyzed": 0
  }
}

RULES:
- Generate 8-15 content ideas ranked by priority
- Be specific with hooks — "What if X" not "Ask a question"
- Every idea must reference which data point inspired it
- Viral signals: only flag things with genuine velocity, not just any popular post
- Content gaps are the most valuable output — what NOBODY is talking about yet
- If web search doesn't find recent content for an account, say so — don't fabricate`;

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && !req.query.manual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = (await kv.get('content-researcher-data')) || { profiles: [], config: {} };
    if (!data.profiles?.length) return res.status(200).json({ message: 'No profiles configured' });

    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    const googleApiKey = process.env.GOOGLE_API_KEY;

    // 1. Separate profiles by platform
    const ytChannels = data.profiles.filter(p => p.platform === 'youtube');
    const twAccounts = data.profiles.filter(p => p.platform === 'twitter');
    const igAccounts = data.profiles.filter(p => p.platform === 'instagram');

    // 2. Fetch YouTube data
    let ytData = {};
    if (ytChannels.length > 0 && googleApiKey) {
      for (const ch of ytChannels.slice(0, 8)) {
        try {
          // Get recent videos
          const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ch.profileId}&maxResults=5&order=date&type=video&key=${googleApiKey}`);
          const searchData = await searchRes.json();
          const videoIds = (searchData.items || []).map(v => v.id.videoId).filter(Boolean);

          if (videoIds.length > 0) {
            const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${googleApiKey}`);
            const statsData = await statsRes.json();
            ytData[ch.name] = (statsData.items || []).map(v => ({
              title: v.snippet.title,
              published: v.snippet.publishedAt,
              views: v.statistics.viewCount,
              likes: v.statistics.likeCount,
              comments: v.statistics.commentCount,
              url: `https://youtube.com/watch?v=${v.id}`,
            }));
          }
          await new Promise(r => setTimeout(r, 500));
        } catch (e) { ytData[ch.name] = [{ error: e.message }]; }
      }
    }

    // 3. Build brief for Claude
    let brief = `TODAY: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

    if (Object.keys(ytData).length > 0) {
      brief += '--- YOUTUBE DATA (from API) ---\n';
      for (const [name, videos] of Object.entries(ytData)) {
        brief += `\n${name}:\n`;
        videos.forEach(v => {
          if (v.error) { brief += `  Error: ${v.error}\n`; return; }
          brief += `  "${v.title}" — ${v.views} views, ${v.likes} likes, ${v.comments} comments (${v.published})\n`;
        });
      }
    }

    // Twitter accounts to search
    if (twAccounts.length > 0) {
      brief += '\n--- TWITTER/X ACCOUNTS TO SEARCH ---\n';
      brief += 'Use web_search to find recent tweets from each of these accounts. Search for: "from:[handle] site:twitter.com" or "[handle] twitter recent"\n';
      twAccounts.forEach(a => { brief += `  @${a.profileId} (${a.name})\n`; });
    }

    // Instagram accounts to search
    if (igAccounts.length > 0) {
      brief += '\n--- INSTAGRAM ACCOUNTS TO SEARCH ---\n';
      brief += 'Use web_search to find recent Instagram posts from each. Search for: "[handle] instagram recent posts" or "instagram.com/[handle]"\n';
      igAccounts.forEach(a => { brief += `  @${a.profileId} (${a.name})\n`; });
    }

    // Context
    if (data.config?.niche) brief += `\nNICHE/INDUSTRY: ${data.config.niche}\n`;
    if (data.config?.notes) brief += `FOCUS: ${data.config.notes}\n`;
    brief += '\nSearch for each Twitter and Instagram account. Analyze all data. Produce the daily content intelligence report.';

    // 4. Send to Claude with web search
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 16000, system: SYSTEM,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: brief }],
      }),
    });

    if (!claudeRes.ok) return res.status(500).json({ error: `Claude: ${claudeRes.status}` });
    const claudeData = await claudeRes.json();

    // Extract JSON — web search responses have narration text mixed in
    let text = '';
    for (const block of (claudeData.content || [])) { if (block.type === 'text') text += '\n' + block.text; }
    text = text.replace(/```json|```/g, '').trim();

    // Find JSON: locate first '{' and parse from there
    let parsed;
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) throw new Error('No JSON found in response');
    const jsonCandidate = text.substring(firstBrace);
    try { parsed = JSON.parse(jsonCandidate); }
    catch (e) {
      // Fix unclosed brackets
      let f = jsonCandidate;
      const ob = (f.match(/{/g) || []).length, cb = (f.match(/}/g) || []).length;
      for (let i = 0; i < ob - cb; i++) f += '}';
      const oq = (f.match(/\[/g) || []).length, cq = (f.match(/\]/g) || []).length;
      for (let i = 0; i < oq - cq; i++) f += ']';
      // Trim trailing text after the last }
      const lastBrace = f.lastIndexOf('}');
      if (lastBrace > 0) f = f.substring(0, lastBrace + 1);
      try { parsed = JSON.parse(f); }
      catch (e2) { throw new Error('Failed to parse JSON from response'); }
    }

    // 5. Save
    const existing = (await kv.get('content-researcher-reports')) || [];
    existing.push({ date: new Date().toISOString(), report: parsed });
    await kv.set('content-researcher-reports', existing.slice(-30));

    // 6. Slack
    if (slackWebhook) {
      const r = parsed;
      const ideas = (r.content_ideas || []).slice(0, 5).map(i => `${i.priority}. *${i.idea}* (${i.platform} · ${i.format})\n   _${i.hook}_`).join('\n');
      const viral = (r.viral_signals || []).slice(0, 3).map(v => `• ${v.signal} (${v.platform} · ${v.velocity})`).join('\n');

      const blocks = [
        { type: 'header', text: { type: 'plain_text', text: `📡 Daily Content Intel — ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`, emoji: true } },
        { type: 'section', text: { type: 'mrkdwn', text: r.executive_summary || 'No summary.' } },
        { type: 'divider' },
      ];
      if (ideas) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*🎯 Top Content Ideas*\n${ideas}` } });
      if (viral) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*🔥 Viral Signals*\n${viral}` } });
      blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `_Content Researcher · ${r.raw_stats?.total_content_pieces_analyzed || '?'} pieces analyzed_` }] });

      await fetch(slackWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blocks }) });
    }

    return res.status(200).json({ ok: true, ideas: parsed.content_ideas?.length || 0 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
