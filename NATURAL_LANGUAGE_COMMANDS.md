# Natural Language Commands - Director Video Editor

## Overview
The Director Video Editor now includes a Natural Language interface that understands plain English commands. Just tell it what you want to do, and it will execute the appropriate actions!

## Accessing the AI Assistant

1. Open the **Command Console** (click the Terminal icon 🖥️ in the navbar)
2. The **AI Assistant** mode is enabled by default (purple interface)
3. Toggle between **Natural** (AI) and **CLI** modes using the buttons at the top

## 🎯 Sample Statements You Can Use

### 1. **Adding Media**

#### Videos:
```
✅ "Add a video"
✅ "Add a video called cat.mp4"
✅ "Add a video for 10 seconds"
✅ "Add a video named sunset.mp4 for 15 seconds"
✅ "Add a video of my-clip.mp4 lasting 8000 ms"
```

**What it does:**
- Adds a video to the timeline
- You can specify the filename
- You can specify duration in seconds or milliseconds

---

#### Images:
```
✅ "Add an image"
✅ "Add an image called photo.jpg"
✅ "Add an image of sunset.png"
✅ "Add image named background.jpg"
```

**What it does:**
- Adds an image to the timeline
- You can specify the filename

---

### 2. **Volume Control**

```
✅ "Set volume to 75"
✅ "Change the volume to 50"
✅ "Make the volume 100"
✅ "Adjust volume to 80"
✅ "Increase volume to 90"
✅ "Turn up volume to 100"
✅ "Decrease volume to 25"
✅ "Lower the volume to 10"
✅ "Turn down volume to 20"
✅ "Mute"
✅ "Mute it"
```

**What it does:**
- Adjusts the volume of the last added item
- Volume range: 0-100 (0 = muted, 100 = full volume)
- Works on videos and audio items

---

### 3. **Opacity / Transparency**

```
✅ "Set opacity to 50"
✅ "Change opacity to 75"
✅ "Make it 50% transparent"
✅ "Make it 80% transparent"
✅ "Set it 30 transparent"
✅ "Make it fully transparent"
✅ "Make it fully opaque"
✅ "Set it opaque"
✅ "Fade it out"
✅ "Fade"
```

**What it does:**
- Changes the opacity of the last added item
- "50% transparent" = 50% opacity
- "Fully transparent" = 0% opacity (invisible)
- "Fully opaque" = 100% opacity (fully visible)
- "Fade" sets to 50% opacity

---

### 4. **Positioning / Movement**

```
✅ "Move to 100 200"
✅ "Move to position 150 300"
✅ "Move it to 200, 400"
✅ "Move to (250, 350)"
✅ "Move to center"
✅ "Move to the center"
✅ "Move it to center"
```

**What it does:**
- Moves the last added item to a specific position
- Format: "Move to X Y" where X and Y are pixel coordinates
- "Move to center" centers the item on the canvas (540, 960)

---

### 5. **Compound Commands (Multiple Actions)**

You can combine multiple commands using "and":

```
✅ "Add a video and make it 50% transparent"
✅ "Add a video and set volume to 75"
✅ "Add an image and move to center"
✅ "Add a video for 10 seconds and make it fully transparent"
✅ "Add an image called bg.jpg and fade it out"
```

**What it does:**
- Executes the first command (e.g., add video)
- Then executes the second command on that item
- Both actions happen automatically

---

### 6. **Utility Commands**

```
✅ "Help"
✅ "Show help"
✅ "What can I do"
✅ "What can you do"
✅ "Commands"
✅ "Clear"
✅ "Clear console"
✅ "Clear logs"
✅ "Clear history"
```

**What it does:**
- "Help" shows available commands
- "Clear" clears the command console logs

---

## 📝 Complete Usage Examples

### Example 1: Create a Simple Video
```
You: "Add a video called intro.mp4 for 10 seconds"
AI:  ✅ Done! I executed: add-video intro.mp4 10000
```

### Example 2: Add Image with Effects
```
You: "Add an image called background.jpg and make it 30% transparent"
AI:  ✅ Done! I executed 2 commands for you.
     - add-image background.jpg
     - set-opacity <item-id> 70
```

### Example 3: Volume Adjustment
```
You: "Set volume to 50"
AI:  ✅ Done! I executed: set-volume <last-item> 50
```

### Example 4: Position Item
```
You: "Move to center"
AI:  ✅ Done! I executed: move <last-item> 540 960
```

### Example 5: Multiple Actions
```
Step 1:
You: "Add a video called clip.mp4"
AI:  ✅ Done! I executed: add-video clip.mp4 5000

Step 2:
You: "Set volume to 75"
AI:  ✅ Done! I executed: set-volume video-1234567 75

Step 3:
You: "Move to center"
AI:  ✅ Done! I executed: move video-1234567 540 960
```

---

## 💡 Tips for Best Results

### ✅ DO:
- **Be conversational**: "Add a video" is better than "video add"
- **Use natural phrases**: "Make it transparent" instead of "transparency set"
- **Specify details when needed**: "Add a video for 10 seconds"
- **Combine actions**: "Add video and set volume to 50"
- **Use context**: After adding an item, just say "set volume to 75"

### ❌ DON'T:
- Don't worry about exact syntax - natural language is flexible!
- Don't include item IDs - the AI tracks the last item automatically
- Don't use complex technical jargon - keep it simple

---

## 🔍 Context Awareness

The AI Assistant remembers:
- **Last added item**: Commands like "set volume" automatically apply to the most recent item
- **Command history**: Use ↑/↓ arrows to navigate previous commands
- **Smart suggestions**: The interface shows relevant suggestions based on your recent actions

---

## 🎨 Visual Indicators

- **Purple theme**: You're in Natural Language mode
- **Blue theme**: You're in CLI command mode
- **Yellow suggestions**: The AI is giving you helpful hints
- **Loading spinner**: The AI is processing your request
- **Check mark**: Command executed successfully
- **Alert icon**: The AI needs clarification

---

## 🚀 Smart Suggestions

The AI Assistant provides context-aware suggestions:

### Before adding media:
- "Add a video"
- "Add an image"
- "Clear console"

### After adding media:
- "Set volume to 75"
- "Make it 50% transparent"
- "Move to center"

Just click a suggestion to use it instantly!

---

## 🔄 Switching Modes

You can toggle between **Natural Language** and **CLI** modes:

1. **Natural Mode** (Default):
   - Purple interface
   - Talk naturally: "Add a video and fade it out"
   - Best for: Quick, intuitive commands

2. **CLI Mode**:
   - Blue interface
   - Use exact commands: `add-video sample.mp4 5000`
   - Best for: Precise control, scripting

---

## ❓ Getting Help

If the AI doesn't understand:

1. **Check the suggestion**: The AI will show helpful hints in yellow
2. **Try rephrasing**: "Add video" instead of "Video add"
3. **Use simpler language**: Break complex requests into steps
4. **Type "help"**: See all available commands
5. **Switch to CLI mode**: Use exact command syntax

Example:
```
You: "Make the thing more see-through"
AI:  💡 Suggestion: Try: 'make it 50% transparent' or 'fade it out'

You: "Make it 50% transparent"
AI:  ✅ Done! I executed: set-opacity <item-id> 50
```

---

## 🎯 Advanced Examples

### Creating a Complex Scene
```
1. "Add a video called background.mp4 for 15 seconds"
2. "Add an image called overlay.png"
3. "Make it 50% transparent"
4. "Move to center"
5. "Add a video called logo.mp4 for 3 seconds"
6. "Set volume to 80"
```

### Quick Adjustments
```
"Set volume to 75"
"Make it 30% transparent"
"Move to 200 300"
"Mute"
```

---

## 📊 Supported Actions

| Action | Natural Language Examples | What It Does |
|--------|--------------------------|--------------|
| **Add Video** | "Add a video", "Add video for 10 seconds" | Adds video to timeline |
| **Add Image** | "Add an image", "Add image called photo.jpg" | Adds image to timeline |
| **Set Volume** | "Set volume to 75", "Mute" | Adjusts audio level |
| **Set Opacity** | "Make it 50% transparent", "Fade out" | Changes transparency |
| **Move Item** | "Move to center", "Move to 100 200" | Repositions on canvas |
| **Clear Logs** | "Clear", "Clear console" | Clears command history |
| **Help** | "Help", "What can you do" | Shows available commands |

---

## 🔮 Coming Soon

Future enhancements may include:
- Rotation commands: "Rotate it 45 degrees"
- Scale commands: "Make it twice as large"
- Duration changes: "Make it last 5 seconds"
- Layer management: "Move to top layer"
- Effects: "Add blur effect"
- Transitions: "Fade in from black"

---

## 💬 Feedback

The Natural Language interface learns from patterns. The more you use it, the better it gets at understanding your requests!

**Happy editing! 🎬✨**

