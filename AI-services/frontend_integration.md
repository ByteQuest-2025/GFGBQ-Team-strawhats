# Frontend Integration Guide: AI Services

This guide helps frontend developers integrate the AI capabilities into the Grievance Reporting UI.

## Overview
We have two AI services available:
1.  **Similarity Detection**: Finds duplicate complaints to prevent redundancy.
2.  **Auto-Classification**: Automatically selects the complaint category (e.g., "Water", "Electricity").

---

## 🛠️ Feature 1: Similarity Detection (Duplicate Check)

**Goal**: As the user types, check if a similar complaint already exists.

### 1. API Contract
**Endpoint**: `POST /api/complaints/check-similarity`
**Request**:
```json
{ "text": "Water leaking near the school" }
```
**Response**:
```json
{
  "similar_found": true,
  "matches": [
    { "complaint_id": 101, "text": "Pipe burst near voltage transformer", "similarity_score": 0.82 }
  ]
}
```

### 2. React Example (Debounced Check)
```javascript
import { useDebounce } from 'use-debounce';

// ... inside component
const [debouncedText] = useDebounce(description, 500);

useEffect(() => {
  if (debouncedText.length > 10) {
    checkSimilarity(debouncedText);
  }
}, [debouncedText]);
```

---

## 🏷️ Feature 2: Auto-Categorization

**Goal**: Automatically select the defined category in the dropdown based on the description.

### 1. API Contract
**Endpoint**: `POST /api/complaints/classify`
**Request**:
```json
{ "text": "Wire sparking near poll" }
```
**Response**:
```json
{
  "category": "Electricity",
  "confidence": 0.98,
  "source": "ML" // or "Rule-Based"
}
```

### 2. Integration Logic (UX Recommendation)

**Scenario A: Auto-Fill (Recommended)**
1.  User types description.
2.  On `blur` (focus out) or `debounce` (pause), call API.
3.  If `confidence > 0.8`, **automatically set** the Category Dropdown value.
4.  If `confidence` is medium, show a "Suggested Category: Electricity" badge.

```javascript
const predictCategory = async (text) => {
  const res = await fetch('/api/complaints/classify', {
    method: 'POST',
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  
  if (data.confidence > 0.8) {
    // Auto-select dropdown
    setCategory(data.category);
  } else {
    // Show suggestion
    setSuggestion(data.category);
  }
};
```

---

## 🧩 Complete Hook Example (Copy-Paste)

```javascript
// hooks/useAIServices.js

export function useAIServices() {
  const checkSimilarity = async (text) => {
    // ... implementation
  };

  const classifyComplaint = async (text) => {
    try {
      const res = await fetch('/api/complaints/classify', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }) 
      });
      return await res.json();
    } catch (e) {
      console.error("Classification failed", e);
      return null;
    }
  };

  return { checkSimilarity, classifyComplaint };
}
```
