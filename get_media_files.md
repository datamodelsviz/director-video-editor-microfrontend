# CURL Testing Scenarios for User Media Endpoint

## 🎯 **Endpoint Overview**
- **URL**: `GET /workspaces/users/{user_id}/media`
- **Base URL**: `http://localhost:8000`
- **User ID**: `4ea92106-4bde-498f-9599-33cd3617b525`
- **JWT Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI`

---

## 🔐 **Authentication Test**

### **Test JWT Token Validity**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/auth/me" | python3 -m json.tool
```

**Expected Result**: User profile information returned

---

## 📁 **Media Type Filtering Tests**

### **1. All Media Types**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=1&page_size=5" | python3 -m json.tool
```

**Expected Result**: 5 mixed media files (mp3, mp4, png) from 47 total

### **2. Audio Files Only**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=audio&page=1&page_size=10" | python3 -m json.tool
```

**Expected Result**: 9 audio files (mp3, wav) from "My Generations" and "temp" workspaces

### **3. Video Files Only**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=video&page=1&page_size=10" | python3 -m json.tool
```

**Expected Result**: 10 video files (mp4) from "My Generations" and "test2" workspaces

### **4. Image Files Only**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=image&page=1&page_size=10" | python3 -m json.tool
```

**Expected Result**: 10 image files (png) from "My Generations" workspace

---

## 📄 **Pagination Tests**

### **5. Page 1 with 5 Items**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=1&page_size=5" | python3 -m json.tool
```

**Expected Result**: 5 items, page 1, total 47

### **6. Page 2 with 5 Items**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=2&page_size=5" | python3 -m json.tool
```

**Expected Result**: 5 items, page 2, total 47

### **7. Page 1 with 20 Items**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=1&page_size=20" | python3 -m json.tool
```

**Expected Result**: 20 items, page 1, total 47

### **8. Custom Page Size (3 Items)**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=video&page=1&page_size=3" | python3 -m json.tool
```

**Expected Result**: 3 video items, page 1, total 25

---

## ❌ **Error Handling Tests**

### **9. Invalid Media Type**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=invalid&page=1&page_size=5" | python3 -m json.tool
```

**Expected Result**: 400 error with message "Invalid media type. Must be one of: image, video, audio, all"

### **10. Missing Media Type Parameter**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?page=1&page_size=5" | python3 -m json.tool
```

**Expected Result**: 422 error with missing media_type parameter

### **11. Invalid Page Number (0)**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=0&page_size=5" | python3 -m json.tool
```

**Expected Result**: 422 error with page validation error

### **12. Invalid Page Size (101)**
```bash
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=1&page_size=101" | python3 -m json.tool
```

**Expected Result**: 422 error with page_size validation error

---

## 🔒 **Security Tests**

### **13. Missing Authorization Header**
```bash
curl -s "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=1&page_size=5" | python3 -m json.tool
```

**Expected Result**: 401 error with "Not authenticated" message

### **14. Invalid JWT Token**
```bash
curl -s -H "Authorization: Bearer invalid_token" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=1&page_size=5" | python3 -m json.tool
```

**Expected Result**: 401 error with "Could not validate credentials" message

---

## 📊 **Data Analysis Tests**

### **15. Count Total Files by Type**
```bash
# Count all files
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=all&page=1&page_size=1" | python3 -c "import sys, json; data=json.load(sys.stdin); print('Total files:', data.get('total', 'N/A'))"

# Count audio files
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=audio&page=1&page_size=1" | python3 -c "import sys, json; data=json.load(sys.stdin); print('Total audio files:', data.get('total', 'N/A'))"

# Count video files
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=video&page=1&page_size=1" | python3 -c "import sys, json; data=json.load(sys.stdin); print('Total video files:', data.get('total', 'N/A'))"

# Count image files
curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI" \
  "http://localhost:8000/workspaces/users/4ea92106-4bde-498f-9599-33cd3617b525/media?media_type=image&page=1&page_size=1" | python3 -c "import sys, json; data=json.load(sys.stdin); print('Total image files:', data.get('total', 'N/A'))"
```

**Expected Result**: 
- Total files: 47
- Audio files: 9
- Video files: 25
- Image files: 13

---

## 🚀 **Quick Test Script**

### **Run All Basic Tests**
```bash
#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwiZW1haWwiOiJtYXl1cmNob3ViZXkxMjNAZ21haWwuY29tIiwibmFtZSI6Ik1heXVyIENob3ViZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmJOV29mbm05VFphZmtJMl9YRGVhM1VjZlJDWTF2RFRuX29RMDVTRGdyNkQyc0xuZXA9czk2LWMiLCJleHAiOjE3NTU1MDE0NzV9.fCUvfbrypjVoWcAYNQLR8Onb9K9-IUppVojlYCOjCjI"
USER_ID="4ea92106-4bde-498f-9599-33cd3617b525"
BASE_URL="http://localhost:8000"

echo "🧪 Testing User Media Endpoint..."
echo "=================================="

echo "1. Testing all media types..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/workspaces/users/$USER_ID/media?media_type=all&page=1&page_size=3" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ All media: {data.get(\"total\", 0)} total files')"

echo "2. Testing audio files..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/workspaces/users/$USER_ID/media?media_type=audio&page=1&page_size=3" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Audio: {data.get(\"total\", 0)} total files')"

echo "3. Testing video files..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/workspaces/users/$USER_ID/media?media_type=video&page=1&page_size=3" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Video: {data.get(\"total\", 0)} total files')"

echo "4. Testing image files..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/workspaces/users/$USER_ID/media?media_type=image&page=1&page_size=3" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Image: {data.get(\"total\", 0)} total files')"

echo "5. Testing pagination..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/workspaces/users/$USER_ID/media?media_type=all&page=2&page_size=5" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Pagination: Page {data.get(\"page\", 0)} with {len(data.get(\"items\", []))} items')"

echo "6. Testing error handling..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/workspaces/users/$USER_ID/media?media_type=invalid&page=1&page_size=5" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Error handling: {data.get(\"detail\", \"Unknown error\")}')"

echo "🎉 All tests completed!"
```

---

## 📝 **Notes**

- **JWT Token**: The provided token is valid and working
- **User ID**: `4ea92106-4bde-498f-9599-33cd3617b525`
- **Base URL**: `http://localhost:8000`
- **Response Format**: All responses are in JSON format
- **Error Codes**: 
  - 400: Bad Request (invalid parameters)
  - 401: Unauthorized (authentication issues)
  - 422: Validation Error (parameter validation)
  - 200: Success

## 🔧 **Troubleshooting**

If you encounter issues:
1. **Check server status**: Ensure backend is running on port 8000
2. **Verify JWT token**: Test with `/auth/me` endpoint first
3. **Check user ID**: Ensure the user ID exists in the database
4. **Review logs**: Check backend console for error messages
