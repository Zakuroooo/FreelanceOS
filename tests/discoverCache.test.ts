import assert from 'node:assert';
import mongoose from 'mongoose';
import DiscoverCache from '../src/lib/models/DiscoverCache';

async function runTest() {
  console.log('Testing DiscoverCache model...');

  // 1. Assert the model exists
  assert.ok(DiscoverCache, 'DiscoverCache model should exist');

  // 2. Validate schema structure (check if key paths exist)
  const paths = DiscoverCache.schema.paths;
  
  const expectedPaths = [
    'placeId',
    'businessName',
    'industry',
    'location',
    'website',
    'websiteLive',
    'metaDescription',
    'email',
    'emailConfidence',
    'phone',
    'socials.instagram',
    'socials.facebook',
    'socials.linkedin',
    'socials.twitter',
    'socials.youtube',
    'socials.whatsapp',
    'socialCount',
    'detectedGaps',
    'source',
    'opportunityScore',
    'rating',
    'reviewCount',
    'googleMapsUrl',
    'category',
    'updatedAt'
  ];

  for (const p of expectedPaths) {
    assert.ok(paths[p], `Schema should have path: ${p}`);
  }

  // 3. Test TTL Index
  const indexes = DiscoverCache.schema.indexes() as [Record<string, unknown>, { expireAfterSeconds: number }][];
  const ttlIndex = indexes.find(i => i[0].updatedAt !== undefined && i[1].expireAfterSeconds !== undefined);
  assert.ok(ttlIndex, 'Should have a TTL index on updatedAt');
  assert.strictEqual(ttlIndex[1].expireAfterSeconds, 2592000, 'TTL should be 30 days (2592000 seconds)');

  console.log('All tests passed!');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
