// api/addon.js - VERCEL HANDLER PURO (NO DIPENDENZE ESTERNE)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  try {
    // MANIFEST
    if (!pathname || pathname === 'manifest.json') {
      return res.status(200).json({
        id: 'org.vitouchiha.cinemanello',
        version: '1.0.0',
        name: '🍿 Cinemanello',
        description: 'Addon catalogo film personalizzato',
        types: ['movie'],
        catalogs: [
          {
            type: 'movie',
            id: 'alcinema',
            name: '🎬 Al Cinema'
          }
        ]
      });
    }

    // CATALOG
    if (pathname.startsWith('catalog/')) {
      const films = [
        {
          id: 'tmdb:939243',
          type: 'movie',
          name: 'People We Meet on Vacation',
          year: 2026,
          poster: 'https://image.tmdb.org/t/p/w500/xzZaU0MN6L9oc1pl0RUXSB7hWwD.jpg'
        },
        {
          id: 'tmdb:1315303',
          type: 'movie',
          name: 'Primate',
          year: 2026,
          poster: 'https://image.tmdb.org/t/p/w500/5Q1zdYe9PYEXMGELzjfjyx8Eb7H.jpg'
        }
      ];
      
      return res.status(200).json({ metas: films });
    }

    // STATUS
    if (pathname === 'status') {
      return res.status(200).json({
        status: 'OK',
        api_version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    res.status(404).json({ error: 'Not found' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
