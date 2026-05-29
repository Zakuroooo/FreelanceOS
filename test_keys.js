const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function checkSerper() {
  const r = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: 'apple' })
  });
  console.log('SERPER:', r.status);
}

async function checkPlaces() {
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName'
    },
    body: JSON.stringify({ textQuery: 'cafe in NY', maxResultCount: 1 })
  });
  console.log('GOOGLE_PLACES:', r.status);
  if (!r.ok) console.log(await r.text());
}

checkSerper();
checkPlaces();
