const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Proxy endpoint for handling CORS issues with external media
app.get('/proxy', async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) {
      res.status(400).send('Missing url param');
      return;
    }

    const response = await fetch(target);
    
    // Pass through content-type if present
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // Allow browser to consume the resource cross-origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');

    const arrayBuffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(502).send(`Proxy error: ${err?.message || 'unknown'}`);
  }
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// Handle SPA routing (compatible with Express 4 and 5)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`🎬 Video Editor server running on http://localhost:${PORT}`);
  console.log(`🌐 Server listening on ${HOST}:${PORT}`);
  console.log(`🌐 Accessible from other devices on your network`);
  console.log(`📁 Serving files from: ${path.join(__dirname, '../dist')}`);
});
