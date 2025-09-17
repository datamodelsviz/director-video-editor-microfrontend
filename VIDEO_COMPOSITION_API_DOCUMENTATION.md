# Video Composition API Documentation

## Overview
This document provides comprehensive curl commands and examples for the Video Composition API endpoints. Use this documentation for frontend integration and API testing.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All API requests require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
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

### Curl Commands

#### Basic List
```bash
curl -X GET "http://localhost:8000/api/v1/compositions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### With Pagination
```bash
curl -X GET "http://localhost:8000/api/v1/compositions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### With Search
```bash
curl -X GET "http://localhost:8000/api/v1/compositions?search=video" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### With Category Filter
```bash
curl -X GET "http://localhost:8000/api/v1/compositions?category=social_media" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### With Sorting
```bash
curl -X GET "http://localhost:8000/api/v1/compositions?sort=name&order=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Combined Filters
```bash
curl -X GET "http://localhost:8000/api/v1/compositions?search=test&category=social_media&page=1&limit=5&sort=updated_at&order=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response Format
```json
{
  "success": true,
  "data": {
    "compositions": [
      {
        "id": "AABFYEHPJZNMOIGE",
        "name": "Test Video Composition",
        "description": "A test composition for API testing",
        "thumbnail": "https://cdn.designcombo.dev/thumbnails/test-preview.png",
        "duration": 30000.0,
        "fps": 30,
        "size": {
          "width": 1080,
          "height": 1920
        },
        "tracks_count": 2,
        "created_at": "2025-09-17T18:14:07.462000Z",
        "updated_at": "2025-09-17T18:14:07.462000Z",
        "created_by": "4530f6c2-1a68-4f7d-9f83-2d973824b598",
        "is_public": true,
        "category": "social_media",
        "tags": ["test", "video", "api"]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "items_per_page": 20,
      "has_next": false,
      "has_prev": false
    }
  },
  "meta": {
    "request_id": "req_2d54c6f35f32",
    "timestamp": "2025-09-17T18:13:22.469689Z"
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

### Curl Commands

#### Basic Details
```bash
curl -X GET "http://localhost:8000/api/v1/compositions/AABFYEHPJZNMOIGE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### With Options
```bash
curl -X GET "http://localhost:8000/api/v1/compositions/AABFYEHPJZNMOIGE?include_assets=true&include_timeline=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response Format
```json
{
  "success": true,
  "data": {
    "composition": {
      "id": "AABFYEHPJZNMOIGE",
      "name": "Test Video Composition",
      "description": "A test composition for API testing",
      "thumbnail": "https://cdn.designcombo.dev/thumbnails/test-preview.png",
      "created_at": "2025-09-17T18:14:07.462000Z",
      "updated_at": "2025-09-17T18:14:07.462000Z",
      "created_by": "4530f6c2-1a68-4f7d-9f83-2d973824b598",
      "is_public": true,
      "category": "social_media",
      "tags": ["test", "video", "api"],
      "design": {
        "id": "test-design-123",
        "size": {
          "width": 1080,
          "height": 1920
        },
        "fps": 30,
        "tracks": [
          {
            "id": "track-1",
            "accepts": ["video", "audio"],
            "type": "video",
            "items": ["item-1"],
            "magnetic": false,
            "static": false
          }
        ],
        "trackItemIds": ["item-1"],
        "trackItemsMap": {
          "item-1": {
            "id": "item-1",
            "type": "video",
            "name": "test-video",
            "details": {
              "src": "https://example.com/video.mp4",
              "width": 1080,
              "height": 1920,
              "opacity": 100,
              "volume": 1.0
            },
            "display": {
              "from": 0,
              "to": 30000
            },
            "isMain": false
          }
        },
        "duration": 30000.0,
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
    "request_id": "req_7c695d117be9",
    "timestamp": "2025-09-17T18:14:19.902812Z"
  }
}
```

---

## 3. Create Composition

### Endpoint
```
POST /compositions
```

### Description
Creates a new video composition with the provided data.

### Curl Command
```bash
curl -X POST "http://localhost:8000/api/v1/compositions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Video Composition",
    "description": "A new composition for my video project",
    "thumbnail": "https://cdn.designcombo.dev/thumbnails/my-preview.png",
    "duration": 30000,
    "fps": 30,
    "size": {
      "width": 1080,
      "height": 1920
    },
    "tracks_count": 2,
    "is_public": true,
    "category": "social_media",
    "tags": ["video", "social", "test"],
    "design": {
      "id": "design-123",
      "size": {
        "width": 1080,
        "height": 1920
      },
      "fps": 30,
      "tracks": [
        {
          "id": "track-1",
          "accepts": ["video", "audio"],
          "type": "video",
          "items": ["item-1"],
          "magnetic": false,
          "static": false
        }
      ],
      "trackItemIds": ["item-1"],
      "trackItemsMap": {
        "item-1": {
          "id": "item-1",
          "type": "video",
          "name": "main-video",
          "details": {
            "src": "https://example.com/video.mp4",
            "width": 1080,
            "height": 1920,
            "opacity": 100,
            "volume": 1.0
          },
          "display": {
            "from": 0,
            "to": 30000
          },
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
      "duration": 30000,
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
  }'
```

### Response Format
```json
{
  "success": true,
  "data": {
    "composition": {
      "id": "AABFYEHPJZNMOIGE",
      "name": "My New Video Composition",
      "description": "A new composition for my video project",
      "thumbnail": "https://cdn.designcombo.dev/thumbnails/my-preview.png",
      "created_at": "2025-09-17T18:14:07.462545Z",
      "updated_at": "2025-09-17T18:14:07.462545Z",
      "created_by": "4530f6c2-1a68-4f7d-9f83-2d973824b598",
      "is_public": true,
      "category": "social_media",
      "tags": ["video", "social", "test"],
      "design": { ... },
      "options": { ... }
    }
  },
  "meta": {
    "request_id": "req_14a2ca3903e9",
    "timestamp": "2025-09-17T18:14:07.465981Z"
  }
}
```

---

## 4. Update Composition

### Endpoint
```
PUT /compositions/{composition_id}
```

### Description
Updates an existing video composition. Only fields provided in the request body will be updated.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `composition_id` | string | Yes | Unique identifier of the composition |

### Curl Commands

#### Update Basic Fields
```bash
curl -X PUT "http://localhost:8000/api/v1/compositions/AABFYEHPJZNMOIGE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Video Composition",
    "description": "Updated description for the composition",
    "tags": ["video", "updated", "test"]
  }'
```

#### Update Design Data
```bash
curl -X PUT "http://localhost:8000/api/v1/compositions/AABFYEHPJZNMOIGE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 45000,
    "fps": 60,
    "design": {
      "id": "updated-design-123",
      "duration": 45000,
      "tracks": [
        {
          "id": "track-1",
          "accepts": ["video", "audio", "text"],
          "type": "video",
          "items": ["item-1", "item-2"],
          "magnetic": true,
          "static": false
        }
      ]
    }
  }'
```

### Response Format
```json
{
  "success": true,
  "data": {
    "composition": {
      "id": "AABFYEHPJZNMOIGE",
      "name": "Updated Video Composition",
      "description": "Updated description for the composition",
      "updated_at": "2025-09-17T18:14:26.726000Z",
      "tags": ["video", "updated", "test"],
      "design": { ... },
      "options": { ... }
    }
  },
  "meta": {
    "request_id": "req_834214de75d1",
    "timestamp": "2025-09-17T18:14:26.734592Z"
  }
}
```

---

## 5. Delete Composition

### Endpoint
```
DELETE /compositions/{composition_id}
```

### Description
Deletes a video composition. Only the composition owner can delete their compositions.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `composition_id` | string | Yes | Unique identifier of the composition |

### Curl Command
```bash
curl -X DELETE "http://localhost:8000/api/v1/compositions/AABFYEHPJZNMOIGE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response
- **Success**: `204 No Content` (empty response body)
- **Error**: JSON error response with details

---

## 6. Get User Compositions

### Endpoint
```
GET /compositions/user/{user_id}
```

### Description
Retrieves compositions created by a specific user. Users can only see their own compositions or public compositions from other users.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User ID to get compositions for |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 20 | Number of items per page (max 100) |

### Curl Commands

#### Get User's Own Compositions
```bash
curl -X GET "http://localhost:8000/api/v1/compositions/user/4530f6c2-1a68-4f7d-9f83-2d973824b598" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### With Pagination
```bash
curl -X GET "http://localhost:8000/api/v1/compositions/user/4530f6c2-1a68-4f7d-9f83-2d973824b598?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response Format
Same as the list compositions response format.

---

## Error Responses

### Common Error Formats

#### Authentication Error (401)
```json
{
  "detail": "Not authenticated"
}
```

#### Composition Not Found (404)
```json
{
  "detail": {
    "success": false,
    "error": {
      "code": "COMPOSITION_NOT_FOUND",
      "message": "Composition not found",
      "details": "No composition found with ID: NONEXISTENT"
    },
    "meta": {
      "request_id": "req_702f8ad80a62",
      "timestamp": "2025-09-17T18:15:17.130628Z"
    }
  }
}
```

#### Access Denied (403)
```json
{
  "detail": {
    "success": false,
    "error": {
      "code": "ACCESS_DENIED",
      "message": "Access denied",
      "details": "You don't have permission to access this composition"
    },
    "meta": {
      "request_id": "req_123456789",
      "timestamp": "2025-09-17T18:15:17.130628Z"
    }
  }
}
```

#### Validation Error (422)
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### Internal Server Error (500)
```json
{
  "detail": {
    "success": false,
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "Failed to retrieve compositions",
      "details": "Database connection error"
    },
    "meta": {
      "request_id": "req_123456789",
      "timestamp": "2025-09-17T18:15:17.130628Z"
    }
  }
}
```

---

## Frontend Integration Examples

### JavaScript/TypeScript Examples

#### Fetch Compositions List
```javascript
const fetchCompositions = async (token, options = {}) => {
  const params = new URLSearchParams(options);
  const response = await fetch(`http://localhost:8000/api/v1/compositions?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch compositions');
  }
  
  return response.json();
};

// Usage
const compositions = await fetchCompositions(token, {
  page: 1,
  limit: 20,
  search: 'video',
  category: 'social_media'
});
```

#### Create Composition
```javascript
const createComposition = async (token, compositionData) => {
  const response = await fetch('http://localhost:8000/api/v1/compositions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(compositionData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.error?.message || 'Failed to create composition');
  }
  
  return response.json();
};
```

#### Update Composition
```javascript
const updateComposition = async (token, compositionId, updateData) => {
  const response = await fetch(`http://localhost:8000/api/v1/compositions/${compositionId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.error?.message || 'Failed to update composition');
  }
  
  return response.json();
};
```

#### Delete Composition
```javascript
const deleteComposition = async (token, compositionId) => {
  const response = await fetch(`http://localhost:8000/api/v1/compositions/${compositionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.error?.message || 'Failed to delete composition');
  }
  
  return response.status === 204; // 204 No Content for successful deletion
};
```

---

## Rate Limiting & Best Practices

### Rate Limits
- **List compositions**: 100 requests per minute per user
- **Get composition details**: 200 requests per minute per user
- **Create/Update/Delete**: 50 requests per minute per user

### Best Practices
1. **Always include Authorization header** with valid Bearer token
2. **Use pagination** for large datasets to avoid timeouts
3. **Implement proper error handling** for all API calls
4. **Cache composition lists** for 5 minutes to reduce API calls
5. **Cache composition details** for 1 hour for better performance
6. **Use search and filtering** to reduce data transfer
7. **Handle 401/403 errors** by redirecting to login
8. **Implement retry logic** for 5xx errors with exponential backoff

---

## Testing Commands Summary

Here are the essential curl commands for quick testing:

```bash
# 1. List compositions
curl -X GET "http://localhost:8000/api/v1/compositions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# 2. Get composition details
curl -X GET "http://localhost:8000/api/v1/compositions/COMPOSITION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# 3. Create composition (minimal)
curl -X POST "http://localhost:8000/api/v1/compositions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Composition", "description": "Test description"}'

# 4. Update composition
curl -X PUT "http://localhost:8000/api/v1/compositions/COMPOSITION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# 5. Delete composition
curl -X DELETE "http://localhost:8000/api/v1/compositions/COMPOSITION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Support

For API support and questions, refer to the main API documentation or contact the development team.
