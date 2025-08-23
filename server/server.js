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
