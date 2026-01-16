// API endpoint handler per Vercel
export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Manifest endpoint
  if (url.pathname === '/manifest.json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const manifest = {
      id: 'org.vito.alcinema',
      version: '1.0.0',
      name: 'Al Cinema 🎬',
      description: 'Film in sala da TMDB (Italia)',
      logo: 'https://www.themoviedb.org/assets/2/v4/logos/293x302-powered-by-square-green-5e5e1b9a18ef76e8864c8ad5ac2ffb5f0e14ff55b3c9c2869a1a40add3524bdf.png',
      resources: ['catalog'],
      types: ['movie'],
      catalogs: [{
        type: 'movie',
        id: 'al_cinema',
        name: '🎬 Al Cinema (Italia)'
      }],
      idPrefixes: ['tmdb:']
    };
    
    res.status(200).json(manifest);
    return;
  }
  
  // Catalog endpoint
  if (url.pathname === '/catalog/movie/al_cinema.json') {
    const skip = Number(url.searchParams.get('skip') || 0);
    const page = Math.floor(skip / 20) + 1;
    
    try {
      const API_KEY = process.env.TMDB_API_KEY || 'e890df2418826db2ddd76f2152ca7a9c';
      const today
