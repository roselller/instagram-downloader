import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting InstaSave Automated End-to-End Tests...\n');

  // Test 1: Health check / Homepage
  console.log('Test 1: Homepage accessibility');
  const homeRes = await fetch(`${BASE_URL}/`);
  assert.strictEqual(homeRes.status, 200, 'Homepage should return status 200');
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('InstaSave'), 'Homepage must contain brand InstaSave');
  assert(homeHtml.includes('Legal Disclaimer'), 'Homepage must contain legal compliance disclaimer');
  console.log('✅ Passed Test 1: Homepage renders successfully with SEO and legal disclaimers\n');

  // Test 2: Invalid URL handling
  console.log('Test 2: Invalid URL validation');
  const invalidRes = await fetch(`${BASE_URL}/api/fetch-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://youtube.com/watch?v=12345' }),
  });
  assert.strictEqual(invalidRes.status, 400, 'Should reject invalid URL with 400');
  const invalidJson = await invalidRes.json();
  assert.strictEqual(invalidJson.success, false);
  assert.strictEqual(invalidJson.error.code, 'INVALID_URL');
  console.log('✅ Passed Test 2: Invalid URL properly rejected with 400 and clear message\n');

  // Test 3: Fetching Video / Reel Post
  console.log('Test 3: Fetching Reel post metadata');
  const reelRes = await fetch(`${BASE_URL}/api/fetch-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.instagram.com/reel/sample_reel/?igsh=demo123' }),
  });
  assert.strictEqual(reelRes.status, 200, 'Reel fetch should return status 200');
  const reelJson = await reelRes.json();
  assert.strictEqual(reelJson.success, true);
  assert.strictEqual(reelJson.data.postType, 'video');
  assert.strictEqual(reelJson.data.items.length, 1);
  assert(reelJson.data.items[0].downloadUrl.startsWith('/api/download?token='), 'Download URL must be securely proxied');
  assert(!reelJson.data.items[0].downloadUrl.includes('http'), 'Raw CDN URL must never be exposed');
  assert(reelJson.data.items[0].qualities.length >= 2, 'Should offer multiple quality options');
  console.log('✅ Passed Test 3: Reel metadata parsed with author, type, and quality tiers\n');

  // Test 4: Proxy Video Download Stream
  console.log('Test 4: Video download stream via proxy');
  const reelDownloadUrl = `${BASE_URL}${reelJson.data.items[0].downloadUrl}`;
  const reelDlRes = await fetch(reelDownloadUrl);
  assert.strictEqual(reelDlRes.status, 200, 'Proxy download must return 200');
  const cdHeader = reelDlRes.headers.get('content-disposition');
  assert(cdHeader && cdHeader.includes('attachment; filename='), 'Must set attachment Content-Disposition header');
  assert(cdHeader.endsWith('.mp4"'), 'Filename must have proper .mp4 extension');
  const reelBuffer = await reelDlRes.arrayBuffer();
  assert(reelBuffer.byteLength > 100000, `Video file must be valid binary stream (received ${reelBuffer.byteLength} bytes)`);
  console.log(`✅ Passed Test 4: Video downloaded successfully (${(reelBuffer.byteLength / 1024).toFixed(1)} KB) with attachment headers\n`);

  // Test 5: Fetching Photo Post
  console.log('Test 5: Fetching Photo post metadata');
  const photoRes = await fetch(`${BASE_URL}/api/fetch-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.instagram.com/p/sample_photo/' }),
  });
  assert.strictEqual(photoRes.status, 200);
  const photoJson = await photoRes.json();
  assert.strictEqual(photoJson.data.postType, 'photo');
  assert(photoJson.data.items[0].downloadUrl.startsWith('/api/download?token='));
  console.log('✅ Passed Test 5: Photo post metadata successfully fetched\n');

  // Test 6: Fetching Carousel Post
  console.log('Test 6: Fetching Multi-item Carousel post metadata');
  const carouselRes = await fetch(`${BASE_URL}/api/fetch-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.instagram.com/p/sample_carousel/' }),
  });
  assert.strictEqual(carouselRes.status, 200);
  const carouselJson = await carouselRes.json();
  assert.strictEqual(carouselJson.data.postType, 'carousel');
  assert.strictEqual(carouselJson.data.items.length, 4, 'Carousel should have 4 items');
  assert(carouselJson.data.zipDownloadUrl, 'Carousel must have a zipDownloadUrl');
  assert(carouselJson.data.zipDownloadUrl.startsWith('/api/download-zip?token='));
  console.log('✅ Passed Test 6: Multi-item carousel parsed with 4 slides & zipDownloadUrl\n');

  // Test 7: Carousel ZIP Packaging and Streaming
  console.log('Test 7: Streaming Carousel .ZIP Archive');
  const zipUrl = `${BASE_URL}${carouselJson.data.zipDownloadUrl}`;
  const zipRes = await fetch(zipUrl);
  assert.strictEqual(zipRes.status, 200, 'ZIP download must return status 200');
  assert.strictEqual(zipRes.headers.get('content-type'), 'application/zip');
  const zipCd = zipRes.headers.get('content-disposition');
  assert(zipCd && zipCd.includes('attachment; filename="instasave_sample_carousel_carousel.zip"'));
  const zipBuffer = await zipRes.arrayBuffer();
  assert(zipBuffer.byteLength > 500000, `ZIP archive must contain all bundled items (received ${zipBuffer.byteLength} bytes)`);
  console.log(`✅ Passed Test 7: Carousel ZIP streamed successfully (${(zipBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB)\n`);

  console.log('🎉 ALL 7 E2E TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
