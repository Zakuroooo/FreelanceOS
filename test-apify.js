/* eslint-disable @typescript-eslint/no-require-imports */
const fetch = require('node-fetch');
async function test() {
  const startRes = await fetch(
    'https://api.apify.com/v2/acts/apify~google-maps-scraper/runs',
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.APIFY_API_TOKEN}` },
      body: JSON.stringify({
        searchStringsArray:  [`cafes in Kanchrapara West Bengal`],
        maxCrawledPlaces:    5,
        language:            'en'
      })
    }
  );
  if (!startRes.ok) {
    const text = await startRes.text();
    console.error('Error starting:', text);
  } else {
    const data = await startRes.json();
    console.log('Started run:', data.data.id);
  }
}
test();
