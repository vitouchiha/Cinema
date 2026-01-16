#!/usr/bin/env node
import fetch from 'node-fetch';
import { addonBuilder, serveHTTP } from 'stremio-addon-sdk';

const API_KEY = process.env.TMDB_API_KEY || 'e890df2418826db2ddd76f2152ca7a9c';

const manifest = {
  id: 'org.vito.alcinema',
  version: '1.0.0',
  name: 'Al Cinema 🎬',
  description: 'Film in sala da TMDB (Italia)',
  logo: 'https://www.themoviedb.org/assets/2/v4/logos/293x302-powered-by-square-green-5e5e1b9a18ef76e8864c8ad5ac2ffb5f0e14ff55b3c9c2869a1a40add3524bdf.png',
  resources: ['catalog'],
  types: ['movie'],
  catalogs: [
    {
      type: 'movie',
      id: 'al_cinema',
      name: '🎬 Al Cinema (Italia)'
    }
  ],
  idPrefixes: ['tmdb:']
};

const builder = new addonBuilder(manifest);

async function fetchAlCinema(page = 1) {
  const today = new Date();
  const dateFrom = new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dateTo = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const url = new URL('https://api.themoviedb.org/3/discover/movie');
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('sort_by', 'popularity.desc');
  url.searchParams.append('primary_release_date.gte', dateFrom);
  url.searchParams.append('primary_release_date.lte', dateTo);
  url.searchParams.append('with_release_type', '2,3');
  url.searchParams.append('language', 'it-IT');
  url.searchParams.append('region', 'IT');
  url.searchParams.append('page', page.toString());

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  const data = await response.json();
  return data.results || [];
}

function tmdbToMeta(movie) {
  return {
    id: `tmdb:${movie.id}`,
    type: 'movie',
    name: movie.title || movie.original_title || 'Sconosciuto',
    description: movie.overview || '',
    year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : 0,
    releaseInfo: movie.release_date || '',
    imdbRating: movie.vote_average || 0,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    background: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : undefined,
    genre: movie.genre_ids || [],
    cast: movie.credits?.cast?.slice(0, 5).map(actor => actor.name) || []
  };
}

builder.defineCatalogHandler(async (args) => {
  if (args.type !== 'movie' || args.id !== 'al_cinema') {
    return { metas: [] };
  }

  const skip = Number(args.extra?.skip || 0);
  const page = Math.floor(skip / 20) + 1;

  try {
    console.log(`Fetching Al Cinema page ${page} (skip=${skip})`);
    const results = await fetchAlCinema(page);
    const metas = results.map(tmdbToMeta);
    
    return {
      metas,
      cacheMaxAge: 3600 // 1 ora cache
    };
  } catch (error) {
    console.error('Al Cinema error:', error);
    return { metas: [] };
  }
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });

console.log(`
🎬 Al Cinema Addon Avviato!
📱 URL Stremio: http://localhost:${process.env.PORT || 7000}/manifest.json
🌐 TMDB API: ${API_KEY ? '✅ Configurata' : '❌ Manca TMDB_API_KEY'}
`);
