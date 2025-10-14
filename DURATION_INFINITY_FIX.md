# Duration Infinity Error Fix

## Problem
When adding video to the frame editor, got this error:
```
Unexpected Application Error!
The "durationInFrames" prop of the <Player/> component must be an integer, but got Infinity.
```

## Root Cause
The `durationInFrames` is calculated in the Player component as:
```typescript
durationInFrames={Math.round((duration / 1000) * fps) || 1}
```

The issue was that `duration` was being set to `Infinity` or `NaN` from the frame data, causing the calculation to result in `Infinity`.

## Solution

### 1. **Fixed stateManagerConverter.ts**
Added validation to ensure valid duration and fps values:

```typescript
// Ensure valid duration - prevent Infinity/NaN
const frameDuration = frame.duration;
const validDuration = (frameDuration && isFinite(frameDuration) && frameDuration > 0) 
  ? frameDuration 
  : 5; // Default 5 seconds

// Ensure valid fps
const validFps = (frame.fps && isFinite(frame.fps) && frame.fps > 0) 
  ? frame.fps 
  : 30; // Default 30 fps
```

### 2. **Fixed updateFrameFromStateManager function**
Added the same validation when converting back from StateManager:

```typescript
// Ensure valid duration - prevent Infinity/NaN
const stateDuration = stateManagerState.duration;
const validDuration = (stateDuration && isFinite(stateDuration) && stateDuration > 0) 
  ? stateDuration / 1000 // Convert from milliseconds
  : 5; // Default 5 seconds

// Ensure valid fps
const validFps = (stateManagerState.fps && isFinite(stateManagerState.fps) && stateManagerState.fps > 0) 
  ? stateManagerState.fps 
  : 30; // Default 30 fps
```

### 3. **Added Safety Checks in FrameEditorWrapper**
Added double-checks in both StateManager initialization points:

```typescript
// Double-check for valid duration to prevent Infinity error
if (!initialState.duration || !isFinite(initialState.duration) || initialState.duration <= 0) {
  initialState.duration = 5000; // 5 seconds in milliseconds
}

// Double-check for valid fps
if (!initialState.fps || !isFinite(initialState.fps) || initialState.fps <= 0) {
  initialState.fps = 30;
}
```

## How It Works Now

### **Duration Validation**
- ✅ **Checks for finite values**: `isFinite(duration)`
- ✅ **Checks for positive values**: `duration > 0`
- ✅ **Provides fallback**: Default 5 seconds if invalid
- ✅ **Applied everywhere**: Initial conversion, updates, and StateManager initialization

### **FPS Validation**
- ✅ **Checks for finite values**: `isFinite(fps)`
- ✅ **Checks for positive values**: `fps > 0`
- ✅ **Provides fallback**: Default 30 fps if invalid
- ✅ **Applied everywhere**: Initial conversion, updates, and StateManager initialization

### **Player Component**
Now receives valid values:
```typescript
durationInFrames={Math.round((duration / 1000) * fps) || 1}
// duration is always finite and positive
// fps is always finite and positive
// Result is always a valid integer
```

## Testing

✅ **Video Addition**: Should work without Infinity error
✅ **Duration Calculation**: Always produces valid integers
✅ **FPS Handling**: Always uses valid fps values
✅ **Fallback Values**: Uses sensible defaults (5s, 30fps)

## Files Modified

1. **stateManagerConverter.ts**: Added validation in `frameToStateManagerData()` and `updateFrameFromStateManager()`
2. **FrameEditorWrapper.tsx**: Added safety checks in StateManager initialization

## Result

The frame editor now handles invalid duration/fps values gracefully and always provides valid data to the Player component, preventing the Infinity error when adding videos.
