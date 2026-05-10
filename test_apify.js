const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const businessType = "cafes";
const location = "Kanchrapara West Bengal";

async function run() {
  console.log(`Starting run — "${businessType} in ${location}"`);
  const startRes = await fetch(
    'https://api.apify.com/v2/acts/compass~crawler-google-places/runs',
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${APIFY_TOKEN}` },
      body: JSON.stringify({
        searchStringsArray:  [`${businessType} in ${location}`],
        maxCrawledPlaces:    5,
        language:            'en',
        maxImages:           0,
        maxReviews:          0,
        scrapeContacts:      true,
        includeHistogram:    false,
        includeOpeningHours: false,
      }),
    }
  );
  if (!startRes.ok) {
    console.error('Apify start failed:', startRes.status, await startRes.text());
    return;
  }
  const runData = await startRes.json();
  const runId = runData?.data?.id;
  console.log('Run ID:', runId);

  let rawResults = [];
  for (let attempt = 0; attempt < 60; attempt++) {
    await new Promise(r => setTimeout(r, 2000));
    const stRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
    });
    const stData = await stRes.json();
    const runStatus = stData?.data?.status;
    console.log('Apify run status:', runStatus);

    if (runStatus === 'SUCCEEDED') {
      rawResults = await (await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?limit=5`,
        { headers: { Authorization: `Bearer ${APIFY_TOKEN}` } }
      )).json();
      console.log('Results count:', Array.isArray(rawResults) ? rawResults.length : 'not-array');
      break;
    }
    if (runStatus === 'FAILED' || runStatus === 'ABORTED') {
      console.error(`Apify actor ${runStatus}`);
      return;
    }
  }
}
run();
