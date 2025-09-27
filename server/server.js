const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Proxy endpoint for handling CORS issues with external media
app.use('/proxy', async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) {
      res.statusCode = 400;
      res.end('Missing url param');
      return;
    }

    const response = await fetch(target);
    res.statusCode = response.status;
    
    // Pass through content-type if present
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // Allow browser to consume the resource cross-origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');

    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    res.statusCode = 502;
    res.end(`Proxy error: ${err?.message || 'unknown'}`);
  }
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 Video Editor server running on http://localhost:${PORT}`);
  console.log(`🌐 Accessible from other devices on your network`);
  console.log(`📁 Serving files from: ${path.join(__dirname, '../dist')}`);
});
