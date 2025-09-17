# Video Composition API Integration

## Overview
This document describes the minimalistic MVP integration of the Video Composition API into the video editor microfrontend.

## Features Implemented

### ✅ Core Functionality
- **Save Composition**: Save current video composition to backend
- **Load Composition**: Load previously saved compositions
- **Composition List**: View recent compositions in dropdown

### ✅ UI Components
- **Save Button**: Added to navbar next to RENDER button
- **Load Dropdown**: Replaced hardcoded Load button with dynamic dropdown
- **Save Modal**: Simple modal for entering composition name

### ✅ API Integration
- **API Service**: `src/services/compositionApi.ts`
- **Composition Store**: `src/features/editor/store/use-composition-store.ts`
- **Data Mapping**: Converts between API format and internal data structures

## File Structure

```
src/
├── services/
│   └── compositionApi.ts              # API service for composition operations
├── features/editor/store/
│   └── use-composition-store.ts       # Zustand store for composition state
├── components/
│   ├── SaveModal.tsx                  # Modal for saving compositions
│   └── LoadDropdown.tsx               # Dropdown for loading compositions
└── features/editor/
    └── navbar.tsx                     # Updated navbar with Save/Load buttons
```

## Usage

### Save Composition
1. Click the **Save** button in the navbar
2. Enter a name for your composition
3. Click **Save** to save to backend

### Load Composition
1. Click the **Load** dropdown in the navbar
2. Select a composition from the list
3. The composition will load into the editor

## API Endpoints Used

- `GET /compositions` - List recent compositions
- `GET /compositions/{id}` - Get specific composition
- `POST /compositions` - Create new composition

## Data Flow

### Save Flow
```
User clicks Save → SaveModal opens → User enters name → 
API call to create composition → Success feedback → Modal closes
```

### Load Flow
```
User clicks Load → Dropdown shows recent compositions → 
User selects composition → API call to get composition → 
Data mapped to internal format → Editor state updated
```

## Error Handling

- API errors are caught and displayed to user
- Loading states are shown during API calls
- Network errors are handled gracefully

## Testing

A test file is available at `src/test-composition-api.ts` to verify API integration:

```typescript
import { testCompositionAPI } from './test-composition-api';
testCompositionAPI(); // Run API tests
```

## Future Enhancements

- Auto-save functionality
- Composition thumbnails
- Search and filtering
- Categories and tags
- Public/private compositions
- Keyboard shortcuts (Ctrl+S, Ctrl+O)

## Dependencies

- Uses existing parent communication system for authentication
- Integrates with existing Zustand store
- Uses existing UI components (shadcn/ui)
