#!/usr/bin/env node

/**
 * Pre-build script for static export
 * Fetches prices and Instagram images from the backend and saves them as static JSON files.
 * Run this before building the static export.
 */

const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

async function fetchPrices() {
  console.log(`Fetching prices from ${BACKEND_URL}...`);
  try {
    const response = await fetch(`${BACKEND_URL}/gold_rate_admin/metal-rate/`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();

    const prices = {
      gold18kt: data.rate_18kt || 0,
      gold22kt: data.rate_22kt || 0,
      gold24kt: data.rate_24kt || 0,
      silver: data.rate_silver || 0,
      date: data.date || new Date().toLocaleDateString("en-IN"),
      fetchedAt: new Date().toISOString(),
    };

    console.log('Prices fetched:', prices);
    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error.message);
    throw error;
  }
}

async function fetchInstagramImages() {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
    console.log('Instagram credentials not provided, skipping Instagram fetch.');
    console.log('Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID environment variables.');
    return null;
  }

  console.log('Fetching Instagram images...');
  try {
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${INSTAGRAM_USER_ID}/media?fields=id,media_type,media_url,thumbnail_url&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.data) {
      console.log('No Instagram media found');
      return [];
    }

    // Filter for images only
    let images = data.data
      .filter(item => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM')
      .map(item => item.media_url);

    // Handle pagination
    let nextPage = data.paging?.next;
    while (nextPage) {
      const nextResponse = await fetch(nextPage);
      const nextData = await nextResponse.json();
      if (nextData && nextData.data) {
        const moreImages = nextData.data
          .filter(item => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM')
          .map(item => item.media_url);
        images.push(...moreImages);
      }
      nextPage = nextData.paging?.next;
    }

    console.log(`Fetched ${images.length} Instagram images`);
    return images;
  } catch (error) {
    console.error('Error fetching Instagram images:', error.message);
    return [];
  }
}

async function main() {
  console.log('=== Pre-build Script for Static Export ===\n');

  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created directory: ${DATA_DIR}\n`);
  }

  // Fetch and save prices
  try {
    const prices = await fetchPrices();
    const pricesPath = path.join(DATA_DIR, 'prices.json');
    fs.writeFileSync(pricesPath, JSON.stringify(prices, null, 2));
    console.log(`Saved prices to ${pricesPath}\n`);
  } catch (error) {
    console.error('Failed to fetch prices. Make sure the backend is running.');
    process.exit(1);
  }

  // Fetch and save Instagram images
  const images = await fetchInstagramImages();
  if (images !== null) {
    const imagesPath = path.join(DATA_DIR, 'instagram.json');
    fs.writeFileSync(imagesPath, JSON.stringify({ images, fetchedAt: new Date().toISOString() }, null, 2));
    console.log(`Saved Instagram images to ${imagesPath}\n`);
  }

  console.log('=== Pre-build complete ===');
}

main();
