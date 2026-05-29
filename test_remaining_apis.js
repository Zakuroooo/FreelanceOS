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

async function checkApi(name, url, options, validateRes) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
    let data;
    const text = await res.text();
    try { data = JSON.parse(text); } catch { data = text; }
    
    const isValid = validateRes(res, data);
    console.log(`[${isValid ? 'OK' : 'FAIL'}] ${name} (Status: ${res.status})`);
    if (!isValid) console.log(`  -> Response:`, typeof data === 'string' ? data.substring(0, 150) : JSON.stringify(data).substring(0, 150));
    return isValid;
  } catch (err) {
    console.log(`[ERROR] ${name}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('--- TESTING REMAINING APIs ---');

  const newFsqKey = 'ZFRROWNNZO2O1RRNKPN2EXYY3SFXSCAC0Z1X3LIMJITHEHOF';
  await checkApi('Foursquare (New Key)', 'https://api.foursquare.com/v3/places/search?query=coffee&limit=1', {
    headers: { Authorization: newFsqKey, Accept: 'application/json' }
  }, res => res.status === 200);

  const testUrl = encodeURIComponent('https://example.com');

  if (env.SCRAPINGBEE_KEY) {
    await checkApi('ScrapingBee', `https://app.scrapingbee.com/api/v1/?api_key=${env.SCRAPINGBEE_KEY}&url=${testUrl}&render_js=false`, {}, res => res.status === 200);
  } else console.log('[SKIP] ScrapingBee (Key missing)');

  if (env.SCRAPINGANT_KEY) {
    await checkApi('ScrapingAnt', `https://api.scrapingant.com/v2/general?url=${testUrl}&x-api-key=${env.SCRAPINGANT_KEY}&browser=false`, {}, res => res.status === 200);
  } else console.log('[SKIP] ScrapingAnt (Key missing)');

  if (env.ZENROWS_KEY) {
    await checkApi('ZenRows', `https://api.zenrows.com/v1/?apikey=${env.ZENROWS_KEY}&url=${testUrl}`, {}, res => res.status === 200);
  } else console.log('[SKIP] ZenRows (Key missing)');
}

main();
