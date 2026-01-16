#!/usr/bin/env node
import fetch from 'node-fetch';
import { addonBuilder } from 'stremio-addon-sdk';

const API_KEY = process.env.TMDB_API_KEY || 'e890df2418826db2ddd76f2152ca7a9c';

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

const builder = new addonBuilder(manifest);

async function fetchAlCinema(page = 1) {
  const today = new Date();
  const dateFrom = new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dateTo = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_date.gte=${dateFrom}&primary_release_date.lte=${dateTo}&with_release_type=2,3&language=it-IT&region=IT&page=${page}`;

  const response = await fetch(url);
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
    background: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : undefined
  };
}

builder.defineCatalogHandler(async ({ type, id, extra }) => {
  if (type !== 'movie' || id !== 'al_cinema') return { metas: [] };

  const skip = Number(extra?.skip || 0);
  const page = Math.floor(skip / 20) + 1;

  try {
    const results = await fetchAlCinema(page);
    const metas = results.map(tmdbToMeta);
    return { metas, cacheMaxAge: 3600 };
  } catch (error) {
    console.error('Error:', error);
    return { metas: [] };
  }
});

export default builder.getInterface();
