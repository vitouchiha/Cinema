// api/addon.js
// Cinemanello Kodi/Stremio Addon API - Vercel Serverless
// Deploy: https://cinemanello-vitouchiha.vercel.app

export default async function handler(req, res) {
  // ==================== CORS HEADERS ====================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ==================== PARSE URL ====================
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1); // rimuovi /
  const query = url.searchParams;

  try {
    // ==================== MANIFEST (/)  ====================
    if (pathname === '' || pathname === 'manifest.json' || pathname === 'manifest') {
      return res.status(200).json({
        id: 'org.vitouchiha.cinemanello',
        version: '1.0.0',
        name: '🍿 Cinemanello',
        description: 'Addon Stremio/Kodi per catalogo personalizzato film',
        logo: 'https://raw.githubusercontent.com/vitouchiha/cinemanello/main/icon.png',
        background: 'https://raw.githubusercontent.com/vitouchiha/cinemanello/main/bg.jpg',
        resources: ['catalog', 'meta', 'stream'],
        types: ['movie', 'tv'],
        catalogs: [
          {
            type: 'movie',
            id: 'alcinema',
            name: '🎬 Al Cinema',
            extra: []
          },
          {
            type: 'movie',
            id: 'populari',
            name: '⭐ Film Popolari',
            extra: []
          },
          {
            type: 'tv',
            id: 'serietv',
            name: '📺 Serie TV',
            extra: []
          }
        ],
        contactEmail: 'vitouchiha@email.com',
        supportedTypes: ['movie', 'tv']
      });
    }

    // ==================== CATALOG HANDLER ====================
    if (pathname.startsWith('catalog/')) {
      const parts = pathname.split('/');
      const type = parts[1]; // movie o tv
      const catalogId = parts[2]; // alcinema, populari, etc

      // Dataset film Al Cinema
      const filmsAlCinema = [
        {
          id: 'tmdb:939243',
          type: 'movie',
          name: 'People We Meet on Vacation',
          year: 2026,
          rating: 7.2,
          poster: 'https://image.tmdb.org/t/p/w500/xzZaU0MN6L9oc1pl0RUXSB7hWwD.jpg',
          background: 'https://image.tmdb.org/t/p/w1280/bg1.jpg',
          description: 'Una coppia in vacanza si ritrova coinvolta in una misteriosa avventura'
        },
        {
          id: 'tmdb:1315303',
          type: 'movie',
          name: 'Primate',
          year: 2026,
          rating: 6.8,
          poster: 'https://image.tmdb.org/t/p/w500/5Q1zdYe9PYEXMGELzjfjyx8Eb7H.jpg',
          background: 'https://image.tmdb.org/t/p/w1280/bg2.jpg',
          description: 'Lucy e i suoi amici si trovano in una situazione pericolosa'
        },
        {
          id: 'tmdb:1404101',
          type: 'movie',
          name: 'Greenland 2: Migration',
          year: 2026,
          rating: 7.5,
          poster: 'https://image.tmdb.org/t/p/w500/abc123.jpg',
          background: 'https://image.tmdb.org/t/p/w1280/bg3.jpg',
          description: 'Continua la storia della migrazione verso la Groenlandia'
        }
      ];

      const filmPopulari = [
        {
          id: 'tmdb:550',
          type: 'movie',
          name: 'Fight Club',
          year: 1999,
          rating: 8.8,
          poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PchJ.jpg',
          description: 'Un capolavoro del cinema moderno'
        },
        {
          id: 'tmdb:278',
          type: 'movie',
          name: 'The Shawshank Redemption',
          year: 1994,
          rating: 9.3,
          poster: 'https://image.tmdb.org/t/p/w500/q6725aR8Zs4IwGMSnEE4XpHn9QI.jpg',
          description: 'Il miglior film di tutti i tempi'
        }
      ];

      let metas = [];

      if (type === 'movie') {
        if (catalogId === 'alcinema') {
          metas = filmsAlCinema;
        } else if (catalogId === 'populari') {
          metas = filmPopulari;
        }
      }

      return res.status(200).json({
        metas: metas,
        cacheMaxAge: 3600 // Cache 1 ora
      });
    }

    // ==================== META HANDLER ====================
    if (pathname.startsWith('meta/')) {
      const parts = pathname.split('/');
      const type = parts[1]; // movie o tv
      const id = parts[2]; // tmdb:123

      // Metadata dettagliato per singolo film
      const metadata = {
        id: id,
        type: type,
        name: 'Film Example',
        year: 2026,
        released: '2026-01-15',
        rating: 7.5,
        runtime: 120,
        genres: ['Action', 'Adventure'],
        director: ['Director Name'],
        cast: ['Actor 1', 'Actor 2'],
        description: 'Descrizione del film',
        poster: 'https://image.tmdb.org/t/p/w500/poster.jpg',
        background: 'https://image.tmdb.org/t/p/w1280/bg.jpg',
        logo: 'https://image.tmdb.org/t/p/w500/logo.png'
      };

      return res.status(200).json({
        meta: metadata,
        cacheMaxAge: 86400
      });
    }

    // ==================== STREAM HANDLER ====================
    if (pathname.startsWith('stream/')) {
      const parts = pathname.split('/');
      const type = parts[1];
      const id = parts[2];

      // Mock stream data
      const streams = [
        {
          title: 'HD 1080p',
          url: 'https://example.com/stream.m3u8',
          quality: '1080p',
          type: 'http'
        },
        {
          title: 'HD 720p',
          url: 'https://example.com/stream-720.m3u8',
          quality: '720p',
          type: 'http'
        }
      ];

      return res.status(200).json({
        streams: streams,
        cacheMaxAge: 3600
      });
    }

    // ==================== SEARCH ====================
    if (pathname.startsWith('search/')) {
      const query = url.searchParams.get('q') || '';
      
      return res.status(200).json({
        results: [
          {
            id: 'tmdb:123',
            type: 'movie',
            name: `Risultato per "${query}"`,
            year: 2026,
            poster: 'https://image.tmdb.org/t/p/w500/abc.jpg'
          }
        ],
        cacheMaxAge: 600
      });
    }

    // ==================== STATUS ====================
    if (pathname === 'status' || pathname === 'ping') {
      return res.status(200).json({
        status: 'OK',
        api_version: '1.0.0',
        addon: 'Cinemanello',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    }

    // ==================== 404 ====================
    res.status(404).json({
      error: 'Endpoint non trovato',
      path: pathname,
      available_endpoints: [
        '/manifest.json',
        '/catalog/movie/alcinema',
        '/catalog/movie/populari',
        '/meta/movie/:id',
        '/stream/movie/:id',
        '/search/?q=query',
        '/status'
      ]
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
