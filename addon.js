// api/addon.js - Cinemanello Kodi Addon Server Vercel
export default async function handler(req, res) {
  // CORS per Kodi/Stremio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.slice(1); // Rimuovi /
  
  try {
    // MANIFEST Kodi addon (/)
    if (path === '' || path === 'manifest.json') {
      return res.status(200).json({
        "id": "plugin.video.cinemanello",
        "version": "1.0.0",
        "icon": "https://vitouchiha.github.io/cinemanello/icon.png",
        "background": "https://vitouchiha.github.io/cinemanello/bg.jpg",
        "fanart": "https://vitouchiha.github.io/cinemanello/fanart.jpg",
        "type": "xbmc.python.pluginsource",
        "name": "Cinemanello",
        "provides": ["video"],
        "label": "🍿 Cinemanello",
        "languages": ["it"]
      });
    }
    
    // CATALOGHI (es. /catalog/movies)
    if (path.startsWith('catalog/')) {
      const type = path.split('/')[1]; // movies, tv
      return res.status(200).json({
        "meta": { "limit": 20 },
        "data": [
          {"name": `Film ${type}`, "id": `movie.${type}.popular`, "type": "directory"},
          {"name": `Serie ${type}`, "id": `tv.${type}.popular`, "type": "directory"}
        ]
      });
    }
    
    // SEARCH
    if (path.startsWith('search/')) {
      const query = url.searchParams.get('query') || '';
      return res.status(200).json({
        "meta": { "limit": 50 },
        "data": [
          {
            "name": `${query} - TMDB`,
            "id": `search.${query}`,
            "type": "directory",
            "poster": "https://image.tmdb.org/t/p/w500/abc123.jpg"
          }
        ]
      });
    }
    
    // STREAM RESOLVE (es. /catalog/movie.id/manifest)
    if (path.endsWith('/manifest')) {
      const id = path.split('/')[1];
      return res.status(200).json({
        "meta": { "limit": 3 },
        "data": [
          {
            "name": "HD 1080p [Torrent]",
            "id": `stream.${id}.1080p`,
            "type": "video",
            "manifest": `https://example.com/stream/${id}.m3u8`
          }
        ]
      });
    }
    
    // 404 per altro
    res.status(404).json({ "error": "Endpoint non trovato", "path": path });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ "error": "Server error", "message": error.message });
  }
}
