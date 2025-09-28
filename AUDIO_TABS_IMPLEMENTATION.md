# Audio Tabs Implementation Summary

## Overview
Implemented tabs for the audio section similar to the video tabs, with "Music" and "Voice" categories based on the `generation_type` field from the API response.

## Changes Made

### 1. Updated Audio Data Fetching (`fetch-audios.ts`)
- Added support for `source` and `generation_type` fields from API response
- These fields are now included in the normalized audio objects

### 2. Enhanced Audio Hook (`use-audios-data.ts`)
- Added `groupAudiosByGenerationType()` helper function to group audios by generation_type
- Updated return interface to include:
  - `audiosByGenerationType`: Record<string, Partial<IAudio>[]>
  - `generationTypes`: string[]
- Updated state management to track categorized audio data

### 3. Updated Audio Component (`menu-item/audios.tsx`)
- Added tabs import from UI components
- Added `formatGenerationTypeName()` helper to format tab labels
- Implemented conditional rendering:
  - Shows tabs when `generationTypes.length > 1`
  - Falls back to single list when only one type or no categorization
- Added proper loading and error states with tab indicators

## API Response Structure Expected

```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "vx-generated-20250915-134510",
        "details": {"src": "https://..."},
        "name": "vx-generated-20250915-134510.mp3",
        "type": "audio",
        "metadata": {},
        "source": "ai_generation",
        "generation_type": "voice"
      },
      {
        "id": "vx-generated-20250918-161154",
        "details": {"src": "https://..."},
        "name": "vx-generated-20250918-161154.wav",
        "type": "audio",
        "metadata": {},
        "source": "ai_generation",
        "generation_type": "music"
      }
    ]
  }
}
```

## Tab Behavior

### When Multiple Generation Types Exist:
- Shows tabs with formatted names: "Music", "Voice"
- Each tab displays only audios of that generation_type
- First tab is selected by default

### When Single or No Generation Types:
- Shows single list of all audios (fallback behavior)
- No tabs displayed

## Testing

A test file `test-audio-api.ts` has been created to verify:
- API response structure
- Audio grouping by generation_type
- Tab display logic

## Environment Variables

Make sure `VITE_AUDIOS_API_ENABLED=true` is set to enable API fetching instead of static fallback data.

## Files Modified

1. `src/features/editor/data/fetch-audios.ts` - Added source and generation_type support
2. `src/features/editor/data/use-audios-data.ts` - Added grouping and categorization logic
3. `src/features/editor/menu-item/audios.tsx` - Implemented tabs UI
4. `src/test-audio-api.ts` - Created test file for verification

## Next Steps

1. Enable the audio API in your environment
2. Test with actual API data containing both "music" and "voice" generation_types
3. Verify tabs appear and function correctly
4. Test fallback behavior when only one generation_type exists
