# Discovery Pipeline: Cached Enrichment & Pagination

## Understanding Summary
- **What is being built:** 
  1. A MongoDB-backed global cache for the expensive 7-layer social enrichment data.
  2. A pagination system ("Load More" offset) for the discovery API.
- **Why it exists:** To prevent API credit waste on already-enriched leads while keeping data fresh (30-day TTL), and to allow endless iteration of searches without getting stuck on the same 15 results.
- **Who it is for:** FreelanceOS users searching for leads.
- **Key constraints:** Must avoid redundant API calls, handle rate limits gracefully, and preserve the private nature of user-specific actions (saved/pitched leads).
- **Explicit non-goals:** We are not caching the initial cheap discovery calls (Apify/Google), only the expensive 7-layer social enrichment.

## Assumptions
- MongoDB is available and configured for the project.
- Apify, Google Places, and other discovery providers support an `offset` or `limit`/`skip` parameter for pagination.
- 30 days is a reasonable expiration threshold for social media and website data.

## Decision Log
1. **Cache Scope:** Decided to make the cache **Global** for enriched data to maximize API savings across users, while keeping "Actions" (Saved/Pitched) strictly **Private** in the existing `clients` collection.
2. **Pagination UI:** Decided to use a "Load More" button with an `offset` state rather than reusing the "Search" button, as it provides a clearer UX for iterating through leads.
3. **Cache Content:** Decided to cache the *enriched* data (Option A) rather than the raw search results, as the enrichment is the bottleneck and cost center.

## Final Design
1. **Database Schema:** Create a `DiscoverCache` MongoDB model storing the place ID, social links, website status, opportunity score, and an `updatedAt` timestamp.
2. **API Logic:** 
   - Accept `offset` from the client.
   - Run raw search with `offset`.
   - Before enrichment, query `DiscoverCache` for the raw place IDs.
   - For cache hits (< 30 days old), return cached data.
   - For cache misses, run 7-layer enrichment and save to `DiscoverCache`.
   - Return `{ clients, metrics: { cacheHits, apiCalls, savedCredits } }`.
3. **Frontend UI:**
   - Add `offset` state.
   - Add "Load More" button at the bottom of the results.
   - Display cache metrics in the UI.

## Implementation Steps
- **Step 1:** Create the MongoDB Cache model (`DiscoverCache`) and integrate it into the `route.ts` enrichment loop.
- **Step 2:** Add `offset` parameter support to the raw discovery providers in `route.ts` and add the "Load More" button to `page.tsx`.
- **Step 3:** Pass cache stats (`cacheHits`, `apiCalls`) back to the frontend and display a small metrics badge.
