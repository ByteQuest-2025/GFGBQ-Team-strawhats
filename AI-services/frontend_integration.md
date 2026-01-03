# Frontend Integration Guide: Similarity Detection

This guide helps frontend developers integrate the **AI Similarity Detection Service** which detects potential duplicate complaints (e.g., "Water leaking" ≈ "Burst pipe").

---

## 🚀 Integration Workflow

The similarity check should happen **in real-time** as the user types their complaint title or description, or just before they click "Submit".

### 1. API Endpoint Contract
*(Assumed Backend Implementation based on `ai_bridge.py`)*

There should be a backend endpoint (e.g., `POST /api/complaints/check-similarity`) that calls `ai_bridge.get_similar_complaints()`.

**Request:**
```json
POST /api/complaints/check-similarity
{
  "text": "Water leaking near the school"
}
```

**Response:**
```json
{
  "similar_found": true,   // true if any score > threshold
  "matches": [
    {
      "complaint_id": 101,
      "text": "Pipe burst near voltage transformer", 
      "similarity_score": 0.82
    }
  ]
}
```

---

## 🎨 frontend UI/UX Recommendations

### Option A: Real-time Suggestion (Best UX)
As the user types the description, show a "Similar complaints found" alert if matches exist.

- **Trigger:** Debounce input (wait 500ms after typing stops).
- **UI:** Show a non-blocking dismissal card:
  > ℹ️ *We found a similar complaint filed recently: "Pipe burst near school". Is this the same issue?*
  >
  > [Yes, Upvote it]   [No, Continue filing]

### Option B: Pre-Submission Shield
When the user clicks "Submit", run the check.

- **Blocking:** If high similarity (> 90%), show a modal.
  > ⚠️ *This looks like a duplicate!*
  > *Someone already reported "Water leak". To avoid duplicates, we've upvoted that issue for you instead.*

---

## ⚛️ React Example Implementation

```javascript
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce'; // standard hook

function ComplaintForm() {
  const [description, setDescription] = useState('');
  const [debouncedText] = useDebounce(description, 500);
  const [similarIssues, setSimilarIssues] = useState([]);

  // 1. Check for similarity when user pauses typing
  useEffect(() => {
    if (debouncedText.length > 10) {
      checkSimilarity(debouncedText);
    }
  }, [debouncedText]);

  const checkSimilarity = async (text) => {
    try {
      const res = await fetch('/api/complaints/check-similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setSimilarIssues(data.matches || []);
    } catch (err) {
      console.error("AI Service Unavailable", err);
    }
  };

  return (
    <div className="form-container">
      <textarea 
        placeholder="Describe the issue..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* 2. Show Suggestions */}
      {similarIssues.length > 0 && (
        <div className="similarity-alert">
          <h4>Wait! existing issues look similar:</h4>
          <ul>
            {similarIssues.map(issue => (
              <li key={issue.complaint_id}>
                <strong>#{issue.complaint_id}:</strong> {issue.text} 
                <span className="score">({(issue.similarity_score * 100).toFixed(0)}% match)</span>
                <button onClick={() => upvote(issue.complaint_id)}>That's it!</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Key Design Values

| UX Goal | Recommendation |
|:---|:---|
| **Speed** | Use **Debouncing** (500-800ms) to avoid spamming the backend API. |
| **Clarity** | Show the *matched text* so users can see WHY it matched. |
| **Action** | Provide an **"Upvote"** button on the matched result to close the loop immediately. |
