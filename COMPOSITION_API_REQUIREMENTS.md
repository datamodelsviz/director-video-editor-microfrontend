# Composition API Requirements

## Overview
This document outlines the API requirements for managing video compositions in the Director Video Editor. The APIs will replace the hardcoded JSON data currently used in the LoadButton component with dynamic data fetched from a backend service.

## Base URL
```
https://api.designcombo.dev/v1/compositions
```

## Authentication
All API requests require authentication via Bearer token:
```
Authorization: Bearer <access_token>
```

---

## 1. List All Compositions

### Endpoint
```
GET /compositions
```

### Description
Retrieves a paginated list of all available compositions with basic metadata.

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 20 | Number of items per page (max 100) |
| `search` | string | No | - | Search term for composition name/description |
| `category` | string | No | - | Filter by composition category |
| `sort` | string | No | "created_at" | Sort field (created_at, updated_at, name, duration) |
| `order` | string | No | "desc" | Sort order (asc, desc) |

### Response Format
```json
{
  "success": true,
  "data": {
    "compositions": [
      {
        "id": "ITRvUWizSBcgo1sM",
        "name": "Sample Video Composition",
        "description": "A sample composition with video, audio, text, and image tracks",
        "thumbnail": "https://cdn.designcombo.dev/thumbnails/composition-preview.png",
        "duration": 23870.113,
        "fps": 30,
        "size": {
          "width": 1080,
          "height": 1920
        },
        "tracks_count": 4,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "created_by": "user123",
        "is_public": true,
        "category": "social_media",
        "tags": ["video", "audio", "text", "image"]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "items_per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  },
  "meta": {
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication token is required",
    "details": "Please provide a valid Bearer token in the Authorization header"
  },
  "meta": {
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## 2. Get Composition Details

### Endpoint
```
GET /compositions/{composition_id}
```

### Description
Retrieves the complete details of a specific composition including all tracks, track items, and configuration.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `composition_id` | string | Yes | Unique identifier of the composition |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `include_assets` | boolean | No | true | Include full asset details (sources, metadata) |
| `include_timeline` | boolean | No | true | Include timeline configuration |

### Response Format
```json
{
  "success": true,
  "data": {
    "composition": {
      "id": "ITRvUWizSBcgo1sM",
      "name": "Sample Video Composition",
      "description": "A sample composition with video, audio, text, and image tracks",
      "thumbnail": "https://cdn.designcombo.dev/thumbnails/composition-preview.png",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "created_by": "user123",
      "is_public": true,
      "category": "social_media",
      "tags": ["video", "audio", "text", "image"],
      "design": {
        "id": "ITRvUWizSBcgo1sM",
        "size": {
          "width": 1080,
          "height": 1920
        },
        "fps": 30,
        "tracks": [
          {
            "id": "MjHP7vh9MxMfy7j9sEGEZ",
            "accepts": [
              "text", "image", "video", "audio", "composition", "caption",
              "template", "customTrack", "customTrack2", "illustration",
              "custom", "main", "shape", "linealAudioBars", "radialAudioBars",
              "progressFrame", "progressBar", "rect"
            ],
            "type": "audio",
            "items": ["pLbo2d7SWwCQqOTm"],
            "magnetic": false,
            "static": false
          },
          {
            "id": "MmNGcBsRoDxATxfFINWRy",
            "accepts": [
              "text", "image", "video", "audio", "composition", "caption",
              "template", "customTrack", "customTrack2", "illustration",
              "custom", "main", "shape", "linealAudioBars", "radialAudioBars",
              "progressFrame", "progressBar", "rect"
            ],
            "type": "text",
            "items": ["QCULubmkiPjXL9iK"],
            "magnetic": false,
            "static": false
          },
          {
            "id": "87v4AMQPwQsggse2ZPbUe",
            "accepts": [
              "text", "image", "video", "audio", "composition", "caption",
              "template", "customTrack", "customTrack2", "illustration",
              "custom", "main", "shape", "linealAudioBars", "radialAudioBars",
              "progressFrame", "progressBar", "rect"
            ],
            "type": "image",
            "items": ["RjEc6eNTXUHvFkdf"],
            "magnetic": false,
            "static": false
          },
          {
            "id": "KOai2qUuYI8tNK1h5Pn3S",
            "accepts": [
              "text", "image", "video", "audio", "composition", "caption",
              "template", "customTrack", "customTrack2", "illustration",
              "custom", "main", "shape", "linealAudioBars", "radialAudioBars",
              "progressFrame", "progressBar", "rect"
            ],
            "type": "video",
            "items": ["Nl88NJRd1btWW"],
            "magnetic": false,
            "static": false
          }
        ],
        "trackItemIds": [
          "Nl88NJRd1btWW",
          "RjEc6eNTXUHvFkdf",
          "QCULubmkiPjXL9iK",
          "pLbo2d7SWwCQqOTm"
        ],
        "trackItemsMap": {
          "Nl88NJRd1btWW": {
            "id": "Nl88NJRd1btWW",
            "details": {
              "width": 360,
              "height": 640,
              "opacity": 100,
              "src": "https://cdn.designcombo.dev/videos/Happiness%20shouldn%E2%80%99t%20depend.mp4",
              "volume": 1,
              "borderRadius": 0,
              "borderWidth": 0,
              "borderColor": "#000000",
              "boxShadow": {
                "color": "#000000",
                "x": 0,
                "y": 0,
                "blur": 0
              },
              "top": "640px",
              "left": "360px",
              "transform": "scale(3)",
              "blur": 0,
              "brightness": 100,
              "flipX": false,
              "flipY": false,
              "rotate": "0deg",
              "visibility": "visible"
            },
            "metadata": {
              "previewUrl": "https://cdn.designcombo.dev/thumbnails/Happiness-shouldnt-depend.png"
            },
            "trim": {
              "from": 0,
              "to": 23870.113
            },
            "type": "video",
            "name": "video",
            "playbackRate": 1,
            "display": {
              "from": 0,
              "to": 23870.113
            },
            "duration": 23870.113,
            "isMain": false
          },
          "RjEc6eNTXUHvFkdf": {
            "id": "RjEc6eNTXUHvFkdf",
            "type": "image",
            "name": "image",
            "display": {
              "from": 0,
              "to": 5000
            },
            "playbackRate": 1,
            "details": {
              "src": "https://ik.imagekit.io/wombo/images/img4.jpg",
              "width": 1280,
              "height": 1920,
              "opacity": 100,
              "transform": "scale(0.418949, 0.418949)",
              "border": "none",
              "borderRadius": 0,
              "boxShadow": {
                "color": "#000000",
                "x": 0,
                "y": 0,
                "blur": 0
              },
              "top": "-561.296px",
              "left": "157.636px",
              "borderWidth": 0,
              "borderColor": "#000000",
              "blur": 0,
              "brightness": 100,
              "flipX": false,
              "flipY": false,
              "rotate": "0deg",
              "visibility": "visible"
            },
            "metadata": {
              "previewUrl": "https://ik.imagekit.io/wombo/images/img4.jpg?tr=w-190"
            },
            "isMain": false
          },
          "QCULubmkiPjXL9iK": {
            "id": "QCULubmkiPjXL9iK",
            "name": "text",
            "type": "text",
            "display": {
              "from": 0,
              "to": 5000
            },
            "details": {
              "text": "Heading and some body",
              "fontSize": 120,
              "width": 600,
              "fontUrl": "https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf",
              "fontFamily": "Roboto-Bold",
              "color": "#ffffff",
              "wordWrap": "break-word",
              "textAlign": "center",
              "borderWidth": 0,
              "borderColor": "#000000",
              "boxShadow": {
                "color": "#ffffff",
                "x": 0,
                "y": 0,
                "blur": 0
              },
              "fontWeight": "normal",
              "fontStyle": "normal",
              "textDecoration": "none",
              "lineHeight": "normal",
              "letterSpacing": "normal",
              "wordSpacing": "normal",
              "backgroundColor": "transparent",
              "border": "none",
              "textShadow": "none",
              "opacity": 100,
              "wordBreak": "normal",
              "WebkitTextStrokeColor": "#ffffff",
              "WebkitTextStrokeWidth": "0px",
              "top": "748.5px",
              "left": "240px",
              "textTransform": "none",
              "transform": "none",
              "skewX": 0,
              "skewY": 0,
              "height": 423,
              "whiteSpace": "pre-wrap"
            },
            "metadata": {},
            "isMain": false
          },
          "pLbo2d7SWwCQqOTm": {
            "id": "pLbo2d7SWwCQqOTm",
            "name": "Dawn of change",
            "type": "audio",
            "display": {
              "from": 0,
              "to": 23870.113
            },
            "trim": {
              "from": 0,
              "to": 23870.112999999998
            },
            "playbackRate": 1,
            "details": {
              "src": "https://cdn.designcombo.dev/audio/Dawn%20of%20change.mp3",
              "volume": 1
            },
            "metadata": {
              "author": "Roman Senyk"
            },
            "duration": 117242.833,
            "isMain": false
          }
        },
        "transitionIds": [],
        "transitionsMap": {},
        "scale": {
          "index": 7,
          "unit": 300,
          "zoom": 0.0033333333333333335,
          "segments": 5
        },
        "duration": 23870.113,
        "activeIds": [],
        "structure": [],
        "background": {
          "type": "color",
          "value": "transparent"
        }
      },
      "options": {
        "fps": 30,
        "size": {
          "width": 1080,
          "height": 1920
        },
        "format": "mp4"
      }
    }
  },
  "meta": {
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

#### Composition Not Found
```json
{
  "success": false,
  "error": {
    "code": "COMPOSITION_NOT_FOUND",
    "message": "Composition not found",
    "details": "No composition found with ID: ITRvUWizSBcgo1sM"
  },
  "meta": {
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Access Denied
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied",
    "details": "You don't have permission to access this composition"
  },
  "meta": {
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Data Structure Specifications

### Track Types
The composition supports the following track types:
- `video` - Video tracks with video elements
- `audio` - Audio tracks with audio elements
- `text` - Text tracks with text elements
- `image` - Image tracks with image elements

### Track Item Properties

#### Video Items
- `src` - Video source URL
- `width`, `height` - Dimensions
- `opacity` - Opacity (0-100)
- `volume` - Audio volume (0-1)
- `transform` - CSS transform string
- `top`, `left` - Position coordinates
- `trim` - Trim settings (from, to)
- `display` - Timeline display settings (from, to)

#### Audio Items
- `src` - Audio source URL
- `volume` - Volume (0-1)
- `trim` - Trim settings (from, to)
- `duration` - Audio duration in milliseconds
- `metadata.author` - Audio author/artist

#### Text Items
- `text` - Text content
- `fontSize` - Font size in pixels
- `fontFamily` - Font family name
- `fontUrl` - Font file URL
- `color` - Text color (hex)
- `textAlign` - Text alignment
- `width`, `height` - Text dimensions
- `top`, `left` - Position coordinates

#### Image Items
- `src` - Image source URL
- `width`, `height` - Dimensions
- `opacity` - Opacity (0-100)
- `transform` - CSS transform string
- `top`, `left` - Position coordinates
- `borderRadius` - Border radius
- `boxShadow` - Box shadow settings

---

## Implementation Notes

### Caching
- Composition lists should be cached for 5 minutes
- Individual composition details should be cached for 1 hour
- Cache keys should include user ID and composition ID

### Rate Limiting
- List compositions: 100 requests per minute per user
- Get composition details: 200 requests per minute per user

### Error Handling
- All API responses should include a unique request ID
- Error responses should be consistent across all endpoints
- Include helpful error messages and error codes

### Security
- Validate composition access permissions
- Sanitize all user inputs
- Implement proper CORS headers
- Use HTTPS for all API calls

---

## Integration with Frontend

### LoadButton Component Update
The current hardcoded JSON in the LoadButton component should be replaced with:

```typescript
const handleLoad = async (compositionId: string) => {
  try {
    const response = await fetch(`/api/compositions/${compositionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load composition');
    }
    
    const data = await response.json();
    const payload = data.data.composition.design;
    
    // Use the existing payload processing logic
    // ... rest of the existing code
  } catch (error) {
    console.error('Error loading composition:', error);
  }
};
```

### Composition Selection UI
A new component should be added to allow users to select from available compositions:

```typescript
const CompositionSelector = () => {
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadCompositions();
  }, []);
  
  const loadCompositions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compositions');
      const data = await response.json();
      setCompositions(data.data.compositions);
    } catch (error) {
      console.error('Error loading compositions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render composition list UI
};
```

---

## Testing Requirements

### Unit Tests
- Test API endpoint responses
- Test error handling scenarios
- Test data validation

### Integration Tests
- Test composition loading in the editor
- Test track rendering with API data
- Test error states and loading states

### Performance Tests
- Test API response times
- Test with large compositions
- Test concurrent user scenarios

---

## Future Enhancements

### Additional Endpoints
- `POST /compositions` - Create new composition
- `PUT /compositions/{id}` - Update composition
- `DELETE /compositions/{id}` - Delete composition
- `POST /compositions/{id}/duplicate` - Duplicate composition

### Advanced Features
- Composition versioning
- Collaboration features
- Real-time updates
- Asset management integration
- Export/import functionality
