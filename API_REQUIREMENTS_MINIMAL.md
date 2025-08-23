# Simple API Requirements - Asset Listing

## Overview
Single endpoint to list assets by type (video, image, audio) as a drop-in replacement for static data arrays.

## API Endpoint
```
GET /assets?type={video|image|audio}
```

## Request Parameters
- `type` (required): "video", "image", or "audio"

## Response Format
```json
{
  "success": true,
  "data": {
    "assets": [/* array of assets */]
  }
}
```

---

## Test Scenarios

### 1. Video Assets

#### Request
```bash
curl -X GET "https://api.yourdomain.com/v1/assets?type=video"
```

#### Expected Response
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "video100",
        "details": {
          "src": "https://cdn.designcombo.dev/videos/Happiness%20shouldn%E2%80%99t%20depend.mp4"
        },
        "type": "video",
        "preview": "https://cdn.designcombo.dev/thumbnails/Happiness-shouldnt-depend.png",
        "duration": 17000
      },
      {
        "id": "video1",
        "details": {
          "src": "https://cdn.designcombo.dev/videos/demo-video-1.mp4"
        },
        "type": "video",
        "preview": "https://cdn.designcombo.dev/thumbnails/demo-video-s-1.png",
        "duration": 17000
      }
    ]
  }
}
```

---

### 2. Image Assets

#### Request
```bash
curl -X GET "https://api.yourdomain.com/v1/assets?type=image"
```

#### Expected Response
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "images1",
        "details": {
          "src": "https://ik.imagekit.io/wombo/images/img1.jpg"
        },
        "preview": "https://ik.imagekit.io/wombo/images/img1.jpg?tr=w-190",
        "type": "image"
      },
      {
        "id": "images2",
        "details": {
          "src": "https://ik.imagekit.io/wombo/images/img2.jpg"
        },
        "preview": "https://ik.imagekit.io/wombo/images/img2.jpg?tr=w-190",
        "type": "image"
      }
    ]
  }
}
```

---

### 3. Audio Assets

#### Request
```bash
curl -X GET "https://api.yourdomain.com/v1/assets?type=audio"
```

#### Expected Response
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "xxx0",
        "details": {
          "src": "https://cdn.designcombo.dev/audio/OpenAI%20CEO%20on%20Artificial%20Intelligence%20Changing%20Society.mp3"
        },
        "name": "Open AI",
        "type": "audio",
        "metadata": {
          "author": "Open AI"
        }
      },
      {
        "id": "xx1",
        "details": {
          "src": "https://cdn.designcombo.dev/audio/Dawn%20of%20change.mp3"
        },
        "name": "Dawn of change",
        "type": "audio",
        "metadata": {
          "author": "Roman Senyk"
        }
      }
    ]
  }
}
```

---

## Data Structure Requirements

### Video Asset
- `id`: string
- `details.src`: string (MP4 URL)
- `type`: "video"
- `preview`: string (PNG thumbnail URL)
- `duration`: number (milliseconds)

### Image Asset
- `id`: string
- `details.src`: string (JPG/PNG URL)
- `preview`: string (optimized thumbnail URL)
- `type`: "image"

### Audio Asset
- `id`: string
- `details.src`: string (MP3 URL)
- `name`: string
- `type`: "audio"
- `metadata.author`: string

## Notes
- Response structure must match existing TypeScript interfaces exactly
- All fields are required as shown above
- No authentication required for this minimal scope
