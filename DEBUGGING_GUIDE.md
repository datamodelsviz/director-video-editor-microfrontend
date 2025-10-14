# Debugging Guide - Single Frame Focus Mode Issues

## Current Status

I've added extensive debugging logs to help identify the root cause of the issues. The build is successful, but the functionality is still not working as expected.

## What I've Done

### 1. Removed Duplicate `useStateManagerEvents` Call
- **Removed** the direct call to `useStateManagerEvents` in `FrameEditorWrapper`
- **Reason**: Timeline component already calls this hook, and calling it twice was causing conflicts
- **Result**: Timeline component now handles all StateManager-to-Zustand synchronization

### 2. Added Debugging Logs
Added console.log statements at key points to trace the data flow:

```typescript
// StateManager creation
console.log('FrameEditorWrapper: Creating StateManager with initialState:', initialState);
console.log('FrameEditorWrapper: StateManager created:', stateManagerRef.current);

// StateManager initialization
console.log('FrameEditorWrapper: Initializing StateManager with state:', initialState);
console.log('FrameEditorWrapper: Syncing initial state to Zustand store');
```

### 3. Ensured Initial State Synchronization
- StateManager is initialized with frame data
- Initial state is immediately synced to Zustand store
- This ensures RightDrawer has access to the data from the start

## How to Debug

### Step 1: Open Browser Console
When you enter single frame focus mode, check the console for these logs:

```
FrameEditorWrapper: Creating StateManager with initialState: {...}
FrameEditorWrapper: StateManager created: StateManager {...}
FrameEditorWrapper: Initializing StateManager with state: {...}
FrameEditorWrapper: Syncing initial state to Zustand store
useStateManagerEvents StateManager {...}
```

### Step 2: Check Initial State
Look at the `initialState` object in the console. Verify:
- `trackItemsMap`: Should contain all media items
- `trackItemIds`: Should be an array of item IDs
- `activeIds`: Should be an empty array initially
- `duration`: Should be a valid number (not Infinity)
- `fps`: Should be a valid number (usually 30)

### Step 3: Test Timeline Selection
Click on an item in the timeline and check the console for:

```
RightDrawer: activeIds changed: [...] trackItemsMap: {...}
RightDrawer: Selected item: {...}
RightDrawer: Opening drawer for item: video/image/text
```

If you DON'T see these logs, it means:
- StateManager is not updating `activeIds` when items are clicked
- OR Zustand store is not being updated
- OR RightDrawer is not receiving the updates

### Step 4: Test Canvas Selection
Click on an item in the canvas and check the console for similar logs.

### Step 5: Check trackItemsMap
In the console, run:
```javascript
// Check Zustand store
window.__ZUSTAND_STORE__ = require('@/features/editor/store/use-store').default.getState()
console.log('Zustand trackItemsMap:', window.__ZUSTAND_STORE__.trackItemsMap)
console.log('Zustand activeIds:', window.__ZUSTAND_STORE__.activeIds)
```

## Potential Issues to Check

### Issue 1: trackItemsMap is Empty
**Symptom**: `trackItemsMap` in Zustand store is empty or missing items
**Cause**: Frame data is not being properly converted to StateManager format
**Fix**: Check `frameToStateManagerData` function in `stateManagerConverter.ts`

### Issue 2: activeIds Not Updating
**Symptom**: Clicking items doesn't update `activeIds` in Zustand store
**Cause**: StateManager events are not being dispatched or received
**Fix**: Check if Timeline component is properly calling `useStateManagerEvents`

### Issue 3: RightDrawer Not Opening
**Symptom**: `activeIds` updates but RightDrawer doesn't open
**Cause**: RightDrawer's useEffect is not triggering or trackItem is not found
**Fix**: Check RightDrawer's useEffect dependencies and trackItemsMap lookup

### Issue 4: Canvas Movement Not Working
**Symptom**: Can't drag items in canvas
**Cause**: SceneInteractions component is not properly initialized
**Fix**: Check if Scene component is receiving the correct StateManager

## Architecture Overview

### Data Flow for Selection:
```
User clicks timeline item
         ↓
CanvasTimeline (in Timeline component)
         ↓
Dispatches LAYER_SELECTION event
         ↓
useTimelineEvents hook (listens to event)
         ↓
Updates Zustand store with activeIds
         ↓
RightDrawer (reads from Zustand store)
         ↓
Opens with item properties
```

### Data Flow for Canvas Selection:
```
User clicks canvas item
         ↓
SceneInteractions component
         ↓
Updates StateManager with activeIds
         ↓
useStateManagerEvents hook (in Timeline)
         ↓
Updates Zustand store with activeIds
         ↓
RightDrawer (reads from Zustand store)
         ↓
Opens with item properties
```

## Next Steps

1. **Run the app** and enter single frame focus mode
2. **Open browser console** and check for the debugging logs
3. **Try clicking** timeline items and canvas items
4. **Share the console logs** with me so I can see what's happening
5. **Check if trackItemsMap** is populated in the Zustand store

## Key Files to Review

- `FrameEditorWrapper.tsx` - Main wrapper component
- `stateManagerConverter.ts` - Converts Frame data to StateManager format
- `Timeline.tsx` - Timeline component that calls useStateManagerEvents
- `RightDrawer.tsx` - Properties panel component
- `useStateManagerEvents.ts` - Hook that syncs StateManager with Zustand store
- `useTimelineEvents.ts` - Hook that listens to timeline events

## Expected Console Output

When everything is working correctly, you should see:

```
FrameEditorWrapper: Creating StateManager with initialState: {
  trackItemsMap: { item1: {...}, item2: {...} },
  trackItemIds: ['item1', 'item2'],
  activeIds: [],
  duration: 5000,
  fps: 30,
  ...
}
FrameEditorWrapper: StateManager created: StateManager {...}
FrameEditorWrapper: Initializing StateManager with state: {...}
FrameEditorWrapper: Syncing initial state to Zustand store
useStateManagerEvents StateManager {...}

// After clicking an item:
RightDrawer: activeIds changed: ['item1'] trackItemsMap: {...}
RightDrawer: Selected item: { type: 'video', ... }
RightDrawer: Opening drawer for item: video
```

If you see different output or errors, please share them so I can help diagnose the issue.
