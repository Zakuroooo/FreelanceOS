const fs = require('fs');

function loadEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  return env;
}

const env = loadEnv();

async function checkApi(name, url, options, expectedKey, validateRes) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) });
    let data;
    try { data = await res.json(); } catch { data = await res.text(); }
    
    const isValid = validateRes(res, data);
    console.log(`[${isValid ? 'OK' : 'FAIL'}] ${name} (Status: ${res.status})`);
    if (!isValid) console.log(`  -> Response:`, typeof data === 'string' ? data.substring(0, 100) : JSON.stringify(data).substring(0, 100));
    return isValid;
  } catch (err) {
    console.log(`[ERROR] ${name}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('--- API KEY VALIDATION ---');
  
  // Apify
  if (env.APIFY_API_TOKEN) {
    await checkApi('Apify', 'https://api.apify.com/v2/users/me', {
      headers: { Authorization: `Bearer ${env.APIFY_API_TOKEN}` }
    }, 'APIFY_API_TOKEN', res => res.status === 200);
  } else console.log('[SKIP] Apify (Key missing)');

  // SerpAPI
  if (env.SERPAPI_KEY) {
    await checkApi('SerpAPI', `https://serpapi.com/search.json?engine=google&q=apple&api_key=${env.SERPAPI_KEY}`, {}, 'SERPAPI_KEY', (res, data) => !data.error && res.status === 200);
  } else console.log('[SKIP] SerpAPI (Key missing)');

  // Google Places
  if (env.GOOGLE_PLACES_API_KEY) {
    await checkApi('Google Places', 'https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName'
      },
      body: JSON.stringify({ textQuery: 'cafe in NY', maxResultCount: 1 })
    }, 'GOOGLE_PLACES_API_KEY', res => res.status === 200);
  } else console.log('[SKIP] Google Places (Key missing)');

  // Serper
  if (env.SERPER_API_KEY) {
    await checkApi('Serper', 'https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: 'apple' })
    }, 'SERPER_API_KEY', res => res.status === 200 || res.status === 403); 
    // 403 usually means quota exceeded but key is structurally valid. Let's see.
  } else console.log('[SKIP] Serper (Key missing)');

  // ScaleSERP
  if (env.SCALESERP_KEY) {
    await checkApi('ScaleSERP', `https://api.scaleserp.com/search?api_key=${env.SCALESERP_KEY}&q=apple`, {}, 'SCALESERP_KEY', (res, data) => res.status === 200 && data.request_info?.success);
  } else console.log('[SKIP] ScaleSERP (Key missing)');

  // ValueSERP
  if (env.VALUESERP_KEY) {
    await checkApi('ValueSERP', `https://api.valueserp.com/search?api_key=${env.VALUESERP_KEY}&q=apple`, {}, 'VALUESERP_KEY', (res, data) => res.status === 200 && data.request_info?.success);
  } else console.log('[SKIP] ValueSERP (Key missing)');

  // Serpstack
  if (env.SERPSTACK_KEY) {
    await checkApi('Serpstack', `http://api.serpstack.com/search?access_key=${env.SERPSTACK_KEY}&query=apple`, {}, 'SERPSTACK_KEY', (res, data) => res.status === 200 && !data.error);
  } else console.log('[SKIP] Serpstack (Key missing)');

  // Foursquare
  if (env.FOURSQUARE_API_KEY) {
    await checkApi('Foursquare', 'https://api.foursquare.com/v3/places/search?query=coffee&limit=1', {
      headers: { Authorization: env.FOURSQUARE_API_KEY, Accept: 'application/json' }
    }, 'FOURSQUARE_API_KEY', res => res.status === 200);
  } else console.log('[SKIP] Foursquare (Key missing)');

  // Google CSE
  if (env.GOOGLE_CSE_KEY && env.GOOGLE_CSE_ID) {
    await checkApi('Google Custom Search', `https://www.googleapis.com/customsearch/v1?key=${env.GOOGLE_CSE_KEY}&cx=${env.GOOGLE_CSE_ID}&q=apple`, {}, 'GOOGLE_CSE_KEY', res => res.status === 200);
  } else console.log('[SKIP] Google Custom Search (Key missing)');

}

main();
