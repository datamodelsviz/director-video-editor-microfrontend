# Quick Test Guide - Frame Editor

## Start the App
```bash
cd /Users/s1/build/vx/vx-rc7/director-video-editor
npm run dev
```

Open: `http://localhost:5173/figma`

## 5-Minute Test Checklist

### ✅ Step 1: Enter Frame Focus
- [ ] Double-click any frame in board view
- [ ] See: Toolbar, Canvas, Timeline, Properties panel

### ✅ Step 2: Add Video
- [ ] Click "Video" button in toolbar
- [ ] Floating panel opens with video gallery
- [ ] Click "+" on any video
- [ ] **VERIFY**: Video appears in canvas AND timeline
- [ ] **VERIFY**: Can click video to select it
- [ ] **VERIFY**: Properties panel opens when selected

### ✅ Step 3: Add Image  
- [ ] Click "Image" button in toolbar
- [ ] Click "+" on any image
- [ ] **VERIFY**: Image appears in canvas AND timeline

### ✅ Step 4: Test Drag & Drop
- [ ] Click "Video" button
- [ ] **Drag** a video from gallery
- [ ] **Drop** onto canvas
- [ ] **VERIFY**: Video added successfully

### ✅ Step 5: Add Audio
- [ ] Click "Audio" button in toolbar
- [ ] If you see "(API Error)" - that's OK, fallback data loads
- [ ] Click "+" on any audio
- [ ] **VERIFY**: Audio appears in timeline (not canvas - expected)

### ✅ Step 6: Test Timeline Operations
- [ ] **Move**: Drag video left/right in timeline
- [ ] **Select**: Click video in timeline → highlights
- [ ] **Delete**: Select item → click trash icon → item removed
- [ ] **Properties**: Select item → properties panel updates

### ✅ Step 7: Test Text
- [ ] Click "Text" button in toolbar
- [ ] Choose any text preset
- [ ] Click to add
- [ ] **VERIFY**: Text appears in canvas and timeline

### ✅ Step 8: Multi-Frame Test
- [ ] Add 2 videos to current frame
- [ ] Click "Back to Board"
- [ ] Double-click a DIFFERENT frame
- [ ] Add 1 image to this new frame
- [ ] Click "Back to Board"
- [ ] Re-enter first frame
- [ ] **VERIFY**: Your 2 videos are still there!

## Expected Results

### ✅ What Should Work:
- Adding media via "+" button
- Drag and drop from galleries
- Video, Image, Audio, Text all add properly
- Timeline shows all items
- Canvas shows visual items (video, image, text)
- Properties panel updates on selection
- Move items in timeline
- Delete items
- Each frame keeps its own content

### ⚠️ Known Behavior:
- **Audio 401 Error**: Normal when running standalone. Falls back to static audio data automatically.
- **Audio in Timeline Only**: Audio doesn't appear in canvas, only in timeline (expected).
- **First Load Slow**: First time loading fonts and data may take a moment.

## If Something Doesn't Work

### Videos/Images Not Adding?
1. Open browser console (F12)
2. Look for errors
3. Check if `useStateManagerEvents` log appears
4. Verify StateManager is initialized

### Drag & Drop Not Working?
1. Make sure you're dragging FROM the gallery panel
2. Drop zone should highlight when hovering
3. Check console for errors

### Properties Not Showing?
1. Click item to SELECT it first
2. Item should highlight in timeline
3. Properties panel on right should update

### Timeline Empty?
1. Check if items are actually added (look in Zustand store)
2. Verify `trackItemsMap` has items
3. Check timeline scroll position

## Console Commands to Debug

Open browser console and run:

```javascript
// Check Zustand store state
window.useStore?.getState()

// Check if StateManager has items
// (requires exposing stateManager to window for debugging)
```

## Success Criteria

✅ All 8 steps above pass
✅ Can add videos, images, audio, text
✅ Timeline updates immediately
✅ Properties panel works
✅ Multi-frame workflow preserves content

## Report Issues

If you find something not working:
1. Note which step failed
2. Check browser console for errors
3. Note the error message
4. Check Network tab for failed API calls

---

**Ready to Test?** Run `npm run dev` and follow the steps above! 🚀

