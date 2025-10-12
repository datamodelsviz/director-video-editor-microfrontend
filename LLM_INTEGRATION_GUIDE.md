# LLM Integration Guide - Director Video Editor

## 🎯 Overview

The Director Video Editor now supports **optional LLM (Large Language Model) integration** as a fallback when pattern matching fails. This provides enhanced understanding of complex or creative natural language commands.

---

## 🚀 How It Works

### **Hybrid Approach:**

```
User Input: "Add a video and make it semi-transparent with low audio"
    ↓
1. Pattern Matching (Fast, Local)
   - Tries to match predefined patterns
   - If successful → Execute immediately ✅
    ↓
2. LLM Fallback (Optional, API-based)
   - Only activates if pattern matching fails
   - Sends to configured LLM (OpenAI/Claude/Local)
   - Parses response → Execute commands ✅
```

### **Key Features:**
- ✅ **Fast by default** - Pattern matching handles 90% of commands
- ✅ **Smart fallback** - LLM only for complex queries
- ✅ **Optional** - Works perfectly without LLM
- ✅ **Multiple providers** - OpenAI, Claude, or Local LLM
- ✅ **Secure** - API keys stored in memory only

---

## 🔧 Setup Instructions

### **Step 1: Open LLM Settings**

1. Open Command Console (Terminal icon 🖥️ in navbar)
2. Ensure **Natural Language mode** is active (purple interface)
3. Click the **Brain icon** (🧠) next to mode toggle buttons
4. Settings panel will appear

### **Step 2: Configure Your Provider**

#### **Option A: OpenAI** (Recommended)

1. Check "Enable LLM Fallback"
2. Select "OpenAI" from provider dropdown
3. Enter your API key (get from https://platform.openai.com/api-keys)
4. Model: `gpt-4o-mini` (default, fast & cheap)
5. Green indicator appears when active ✅

**Cost:** ~$0.00015 per command (very cheap!)

#### **Option B: Claude (Anthropic)**

1. Check "Enable LLM Fallback"
2. Select "Claude (Anthropic)" from provider dropdown
3. Enter your API key (get from https://console.anthropic.com/)
4. Model: `claude-3-haiku-20240307` (default)
5. Green indicator appears when active ✅

**Cost:** ~$0.00025 per command

#### **Option C: Local LLM**

1. Check "Enable LLM Fallback"
2. Select "Local LLM" from provider dropdown
3. Enter your local endpoint URL
   - Example: `http://localhost:8000/api/generate`
   - Works with Ollama, LM Studio, etc.
4. Green indicator appears when active ✅

**Cost:** Free!

---

## 📝 Supported Providers

### **1. OpenAI**

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Recommended Models:**
- `gpt-4o-mini` - Fast, cheap, good quality (default)
- `gpt-4o` - Best quality, more expensive
- `gpt-3.5-turbo` - Legacy, cheaper

**API Key Format:** `sk-...`

**Get API Key:** https://platform.openai.com/api-keys

**Pricing:**
- gpt-4o-mini: $0.15 / 1M tokens (~$0.00015 per command)
- gpt-4o: $2.50 / 1M tokens

---

### **2. Claude (Anthropic)**

**Endpoint:** `https://api.anthropic.com/v1/messages`

**Recommended Models:**
- `claude-3-haiku-20240307` - Fast & efficient (default)
- `claude-3-sonnet-20240229` - Balanced
- `claude-3-opus-20240229` - Most capable

**API Key:** Get from Anthropic Console

**Get API Key:** https://console.anthropic.com/

**Pricing:**
- Haiku: $0.25 / 1M tokens
- Sonnet: $3 / 1M tokens
- Opus: $15 / 1M tokens

---

### **3. Local LLM**

**Compatible With:**
- Ollama (https://ollama.ai/)
- LM Studio (https://lmstudio.ai/)
- Text Generation WebUI
- Any OpenAI-compatible endpoint

**Example Setup (Ollama):**

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2:3b

# Run with API
ollama serve

# Use endpoint: http://localhost:11434/api/generate
```

**Advantages:**
- ✅ 100% Private
- ✅ No API costs
- ✅ Works offline
- ✅ Full control

**Disadvantages:**
- ❌ Slower than cloud APIs
- ❌ Requires local resources
- ❌ May need response format adjustments

---

## 💡 Usage Examples

### **Without LLM (Pattern Matching):**

```
✅ "Add a video" → Instant, pattern matched
✅ "Set volume to 75" → Instant, pattern matched
✅ "Make it 50% transparent" → Instant, pattern matched
```

### **With LLM Fallback:**

```
❓ "Add a semi-transparent video with quiet audio"
   → Pattern matching fails
   → LLM interprets: "semi-transparent" = 50% opacity, "quiet" = 30% volume
   → Executes: add-video + set-opacity 50 + set-volume 30 ✅

❓ "Make this barely visible"
   → Pattern matching fails
   → LLM interprets: "barely visible" = 10% opacity
   → Executes: set-opacity 10 ✅

❓ "Put it in the top left corner"
   → Pattern matching fails
   → LLM interprets: "top left" = x:100, y:100
   → Executes: move 100 100 ✅
```

### **Complex Creative Queries:**

```
✅ "Add a video with cinematic fade-in effect"
✅ "Make it whisper quiet but still audible"
✅ "Position it slightly off-center to the right"
✅ "Add background music at ambient levels"
```

---

## 🔒 Security & Privacy

### **API Key Storage:**
- ⚠️ **API keys stored in memory only** (browser session)
- ❌ **NOT saved to localStorage** for security
- ✅ **Need to re-enter after refresh**
- ✅ **Never sent to our servers**

### **Data Privacy:**
- Only command text sent to LLM provider
- No video content, user data, or project details
- Example: "Add a video and fade it" → Sent to API
- Your video files → **Never sent**

### **Best Practices:**
1. Use separate API keys for development
2. Set spending limits on provider dashboards
3. Monitor usage on provider websites
4. Use local LLM for sensitive projects

---

## 📊 Performance & Costs

### **Pattern Matching (Default):**
- **Speed:** Instant (~1ms)
- **Cost:** Free
- **Coverage:** ~90% of commands
- **Offline:** ✅ Works

### **LLM Fallback:**
- **Speed:** ~500-2000ms (depends on provider)
- **Cost:** ~$0.0002 per command (OpenAI gpt-4o-mini)
- **Coverage:** ~99% of commands
- **Offline:** ❌ Requires internet (unless local LLM)

### **Monthly Cost Estimates:**

| Usage | Pattern Only | With LLM (10% fallback) | With LLM (50% fallback) |
|-------|--------------|------------------------|------------------------|
| 100 commands | Free | ~$0.002 | ~$0.01 |
| 1,000 commands | Free | ~$0.02 | ~$0.10 |
| 10,000 commands | Free | ~$0.20 | ~$1.00 |

**Conclusion:** Very affordable even with heavy use!

---

## 🎯 When to Use LLM

### **✅ Enable LLM If:**
- You want to use creative/natural phrasing
- Working with complex multi-step commands
- Team members unfamiliar with command syntax
- Building demos/presentations
- Want maximum flexibility

### **❌ Skip LLM If:**
- Cost-sensitive project
- Privacy concerns (unless local LLM)
- Latency critical
- Simple, repetitive commands
- Pattern matching covers your needs

---

## 🔍 Troubleshooting

### **"LLM fallback is not enabled"**
- ✅ Check "Enable LLM Fallback" is checked
- ✅ Provider selected (not "None")
- ✅ API key entered correctly
- ✅ Green indicator appears

### **"LLM error: Unauthorized"**
- ❌ Invalid API key
- ✅ Get fresh key from provider dashboard
- ✅ Copy entire key including `sk-` prefix (OpenAI)

### **"LLM error: Rate limit exceeded"**
- ⏸️ Too many requests
- ✅ Wait a minute and try again
- ✅ Check provider dashboard for limits
- ✅ Upgrade plan if needed

### **"LLM error: Timeout"**
- 🐌 Network issue or slow response
- ✅ Check internet connection
- ✅ Try again
- ✅ Switch to faster model (gpt-4o-mini)

### **"Failed to parse LLM response"**
- 🤖 LLM returned invalid format
- ✅ Report to us (rare issue)
- ✅ Try rephrasing command
- ✅ Pattern matching still works!

---

## 📈 Monitoring Usage

### **OpenAI:**
1. Go to https://platform.openai.com/usage
2. See real-time usage and costs
3. Set monthly spending limits

### **Claude:**
1. Go to https://console.anthropic.com/
2. Check usage dashboard
3. Monitor API calls

### **Local LLM:**
- Check terminal/logs for request count
- No external costs to track

---

## 🔮 Advanced Configuration

### **Custom Temperature:**
Currently set to `0.3` (deterministic, consistent)

Want more creative responses? Edit `LLMIntegration.ts`:
```typescript
temperature: 0.7  // More creative but less predictable
```

### **Max Tokens:**
Currently set to `150` tokens (sufficient for commands)

Need longer responses? Adjust in `LLMIntegration.ts`:
```typescript
maxTokens: 300  // Allows longer, complex command sequences
```

### **Custom Prompt:**
Modify `buildPrompt()` in `LLMIntegration.ts` to:
- Add domain-specific vocabulary
- Provide additional context
- Customize command format

---

## 📚 Example Workflows

### **Workflow 1: Basic Setup**
```
1. Click Brain icon 🧠
2. Enable LLM Fallback ✅
3. Select OpenAI
4. Paste API key
5. Close settings
6. Try: "Add a video with moderate volume and slight transparency"
```

### **Workflow 2: Local LLM**
```
1. Install Ollama
2. Run: ollama pull llama3.2
3. Run: ollama serve
4. In settings: Select "Local LLM"
5. Enter: http://localhost:11434/api/generate
6. Try creative commands!
```

### **Workflow 3: Cost Optimization**
```
1. Use pattern matching for common tasks
2. Enable LLM only for demos/complex work
3. Monitor usage dashboard weekly
4. Set spending limit: $5/month
5. Disable when not needed
```

---

## 🎓 Learning Resources

### **Understanding LLMs:**
- OpenAI Docs: https://platform.openai.com/docs
- Claude Docs: https://docs.anthropic.com/
- Ollama Guide: https://github.com/ollama/ollama

### **Cost Management:**
- Set up billing alerts
- Use cheaper models for testing
- Pattern matching handles 90% free

### **Privacy Best Practices:**
- Use local LLM for sensitive work
- Don't include personal data in commands
- Review provider privacy policies

---

## ✨ Summary

| Feature | Status |
|---------|--------|
| **Pattern Matching** | ✅ Active by default |
| **LLM Fallback** | ✅ Optional, configurable |
| **OpenAI Support** | ✅ Yes |
| **Claude Support** | ✅ Yes |
| **Local LLM Support** | ✅ Yes |
| **Cost** | 💰 ~$0.0002 per LLM command |
| **Privacy** | 🔒 API keys in memory only |
| **Speed** | ⚡ Pattern: instant, LLM: ~1-2s |

---

## 🚀 Get Started

1. **Try without LLM first** - Pattern matching is powerful!
2. **Enable LLM for complex queries** - Enhances understanding
3. **Monitor costs** - Very affordable with OpenAI gpt-4o-mini
4. **Consider local LLM** - Free and private

**The choice is yours! Both approaches work great.** 🎉

---

*For questions or issues, check the troubleshooting section or disable LLM and use pattern-only mode.*

