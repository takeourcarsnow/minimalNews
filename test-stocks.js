async function fetchJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  // sometimes dev server may return HTML if wrong port; try to parse JSON safely
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Not JSON from ${url}: ${text.slice(0, 200)}`);
  }
}

async function testStocksAPI() {
  const ports = [3001, 3002, 3000];
  const host = (path) => {
    for (const p of ports) {
      const url = `http://localhost:${p}${path}`;
      // we'll attempt each sequentially
      // the caller will catch and move on
      // keep url for logging
      return url;
    }
  };

  try {
    console.log('\n-- Default (1d,1w,1m) for AAPL,MSFT,GOOGL');
    let response, data, url;
    url = `http://localhost:3001/api/stocks?symbols=AAPL,MSFT,GOOGL`;
    try { data = await fetchJson(url); } catch (_) { url = `http://localhost:3002/api/stocks?symbols=AAPL,MSFT,GOOGL`; data = await fetchJson(url); }
    console.log('Response:', JSON.stringify(data, null, 2));

    console.log('\n-- Only 24h (1d) for AAPL,MSFT');
    url = `http://localhost:3001/api/stocks?symbols=AAPL,MSFT&periods=1d`;
    try { data = await fetchJson(url); } catch (_) { url = `http://localhost:3002/api/stocks?symbols=AAPL,MSFT&periods=1d`; data = await fetchJson(url); }
    console.log('Response:', JSON.stringify(data, null, 2));

    console.log('\n-- Only 1w & 1m for TSLA,GOOGL');
    url = `http://localhost:3001/api/stocks?symbols=TSLA,GOOGL&periods=1w,1m`;
    try { data = await fetchJson(url); } catch (_) { url = `http://localhost:3002/api/stocks?symbols=TSLA,GOOGL&periods=1w,1m`; data = await fetchJson(url); }
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error testing stocks API:', error);
  }
}

testStocksAPI();