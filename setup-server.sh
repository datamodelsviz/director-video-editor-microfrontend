#!/bin/bash

echo "🚀 Setting up Video Editor Server..."

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist folder not found. Please build the project first with 'pnpm build'"
    exit 1
fi

# Create server directory
mkdir -p server
cd server

# Create package.json
cat > package.json << 'EOF'
{
  "name": "video-editor-server",
  "version": "1.0.0",
  "description": "Simple HTTP server for Video Editor",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Create server.js
cat > server.js << 'EOF'
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
EOF

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Server setup complete!"
echo ""
echo "To start the server:"
echo "  cd server && npm start"
echo ""
echo "To access from other devices on your network:"
echo "  http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "To stop the server: Ctrl+C"
