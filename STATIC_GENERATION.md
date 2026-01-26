# Static Generation with ISR

## Overview

The main price display page now uses **Incremental Static Regeneration (ISR)** to provide static HTML performance while keeping prices up-to-date.

## How It Works

### Server-Side Price Fetching

The homepage (`frontend/src/app/page.tsx`) fetches metal prices **at build time** directly from the Django backend:

```typescript
async function getMetalPrices() {
  const backendUrl = process.env.BACKEND_URL || 'http://python-backend:8000';
  const res = await fetch(`${backendUrl}/gold_rate_admin/metal-rate/`, {
    next: { revalidate: 86400 } // Revalidate every 24 hours
  });
  // ... returns prices
}
```

### ISR Revalidation

- **Revalidation Period**: 24 hours (86400 seconds)
- **How it works**:
  1. Page is generated as static HTML at build time with current prices
  2. First visitor after 24 hours triggers a background regeneration
  3. New static HTML is generated with updated prices
  4. All subsequent visitors get the updated static page

### Benefits

1. **Fast Performance**: Page loads as static HTML (no server processing)
2. **SEO Friendly**: Fully rendered HTML with actual prices
3. **Automatic Updates**: No manual rebuilds needed
4. **Reduced Server Load**: Backend only hit once per day per page

## Client-Side vs Server-Side

### What's Server-Side (Static)
- Main price display page (`/`)
- Initial price data embedded in HTML
- Fast first load with real prices

### What's Client-Side (Dynamic)
- Admin panel (`/admin`)
- Authentication flows
- Manual price updates

## Configuration

### Environment Variables

Set in `docker-compose.yaml` or `.env`:

```bash
BACKEND_URL=http://python-backend:8000
NEXT_PUBLIC_BACKEND_URL=http://python-backend:8000
```

### Next.js Config

Current config (`next.config.mjs`):

```javascript
const nextConfig = {
  output: 'standalone',  // Required for Docker + ISR
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
};
```

**Note**: `output: 'standalone'` is correct for ISR. Do NOT use `output: 'export'` as it disables server features.

## Build and Deploy

### Development

```bash
docker-compose up
```

The page will fetch fresh prices on each request in development.

### Production

```bash
# Build the Docker image
docker-compose build frontend

# Deploy
docker-compose up -d
```

The build process:
1. Fetches current prices from backend
2. Generates static HTML with prices
3. Serves HTML for 24 hours
4. Regenerates when needed

## Price Update Flow

### Daily Price Update (Automated)

1. Cron job runs at 3:30 AM (`gold_rate_update.py`)
2. Fetches from external API
3. Updates database with new prices
4. Next visitor after 24 hours gets regenerated page

### Manual Price Update (Admin)

1. Admin logs into `/admin`
2. Updates prices manually
3. Sets `is_manual_override = True`
4. Next visitor after 24 hours gets regenerated page with manual prices

### Forcing Immediate Update

If you need prices to update immediately after a manual change:

**Option 1: Restart Frontend Container**
```bash
docker-compose restart frontend
```

**Option 2: On-Demand Revalidation** (requires code change)
Add a revalidation API endpoint to trigger immediate rebuild.

## Disabling Client-Side Fetching

The `MainContent.tsx` component now uses server props as the primary data source. Client-side fetching is **disabled** by default since:

- Prices only update once daily
- ISR handles page regeneration
- No need for real-time updates

### Re-enabling Client-Side Updates

If you want a fallback client-side check, uncomment in `MainContent.tsx`:

```typescript
// Fetch data once per hour as a fallback
const intervalId = setInterval(fetchAndUpdateData, 3600000);
```

## Full Static Export (Alternative)

If you want **completely static HTML** without a Node.js server:

### 1. Change Next.js Config

```javascript
// next.config.mjs
const nextConfig = {
  output: 'export',  // Full static export
  images: {
    unoptimized: true  // Required for static export
  }
};
```

### 2. Build Static Files

```bash
cd frontend
npm run build
```

This creates `frontend/out/` with static HTML.

### 3. Serve with Nginx

```nginx
server {
  listen 80;
  root /path/to/frontend/out;
  index index.html;
}
```

### 4. Rebuild Daily

Add a cron job to rebuild after price updates:

```bash
30 4 * * * cd /path/to/frontend && npm run build
```

### Trade-offs of Full Static Export

**Pros:**
- No Node.js server needed
- Cheapest hosting (can use GitHub Pages, S3, etc.)
- Maximum performance

**Cons:**
- Admin panel won't work (needs server)
- Must rebuild manually or via cron after price updates
- No ISR automatic regeneration
- API routes disabled

## Recommended Setup

For your use case (daily price updates):

✅ **Use ISR (Current Setup)**
- Keep `output: 'standalone'`
- 24-hour revalidation
- Admin panel works
- Automatic updates

❌ **Don't use full static export** unless:
- You don't need the admin panel
- You're okay with manual rebuilds
- You want to use cheaper static hosting

## Monitoring

### Check if ISR is Working

1. Visit the homepage and note the "Price Updated" date
2. Update prices via admin panel
3. Wait 24+ hours or restart frontend
4. Revisit homepage - date should reflect new update

### Debugging

**Prices not updating:**
- Check backend is accessible: `curl http://python-backend:8000/gold_rate_admin/metal-rate/`
- Check Next.js logs: `docker-compose logs frontend`
- Verify database has latest prices: Check Django admin or database directly

**Page showing old prices:**
- ISR cache is still valid (< 24 hours)
- Restart frontend container to force regeneration
- Check that backend is returning new data

## Performance Metrics

With ISR enabled:
- **First Load**: ~50-200ms (static HTML)
- **Backend Hit**: Once per 24 hours
- **Admin Panel**: Still dynamic (not cached)

Without ISR (old setup):
- **First Load**: ~500-2000ms (API call)
- **Backend Hit**: Every page visit
- **Client Updates**: Every 5 minutes

## Summary

Your main page is now **effectively static** with prices baked into HTML, but automatically regenerates daily. This gives you:

1. ⚡ Static site speed
2. 🔄 Automatic updates
3. 🎯 SEO-friendly
4. 🔒 Admin panel still works
5. 💾 Reduced server load

Best of both worlds for your daily price update use case!
