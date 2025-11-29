# Intentional Bugs & Code Quality Issues - Documentation

This document outlines the intentional bugs and code quality issues created for demonstration of debugging and refactoring capabilities using AI tools.

## 1. Broken Modal Component (`app/components/BrokenModal.tsx`)

### Issues Created:

1. **Missing CSS Classes**: The backdrop div has no styling, making it invisible and non-functional
   ```tsx
   <div onClick={onClose}> // Missing className for backdrop styling
   ```

2. **Broken Button Styling**: Button text color matches background (both blue)
   ```tsx
   style={{ 
     background: 'blue', 
     color: 'blue',  // Text invisible!
   }}
   ```

3. **Excessive Padding**: Button padding set to 10000px, making it unusable
   ```tsx
   padding: '10000px' // Way too large
   ```

4. **State Update Race Condition**: State is negated twice
   ```tsx
   setIsOpen(!isOpen);
   setIsOpen(!isOpen);  // Negates the first one - modal never opens!
   ```

5. **Missing Accessibility**: No ARIA labels, improper focus management

6. **Ignored Open State**: Component always renders regardless of `isOpen` prop

### Fix Required:
- Add proper Tailwind classes for modal styling
- Fix button styling with proper contrast
- Remove redundant state updates
- Add accessibility attributes
- Conditionally render based on `isOpen`

---

## 2. Buggy Utility Functions (`lib/utils/buggy.ts`)

### Issue 1: Inefficient Score Calculation (`calculateAverageScore`)
**Problem**: O(n²) complexity, hardcoded divisor
```tsx
for (let i = 0; i < evaluations.length; i++) {
  for (let j = 0; j < evaluations.length; j++) {
    if (i === j) {
      sum += evaluations[i].score;
      break;
    }
  }
}
return sum / 100; // Should be evaluations.length
```
**Impact**: Slow for large datasets, returns incorrect results

### Issue 2: Memory Leak in Cache (`cacheEvaluation`, `getCachedEvaluation`)
**Problem**: 
- No size limit on cache array
- No TTL or expiration strategy
- Linear search O(n) instead of hash map O(1)
```tsx
cachedResults.push({ id, data, timestamp: Date.now() });
// Never gets cleaned up!
```
**Impact**: Memory grows indefinitely in production

### Issue 3: Weak Email Validation (`validateEmail`)
**Problems**:
- Incomplete regex pattern
- Case-sensitive when it shouldn't be
- No input trimming
```tsx
const regex = /^[a-z]+@[a-z]+$/; // Missing TLD, numbers, etc.
```
**Impact**: Rejects valid emails, accepts invalid ones

### Issue 4: Inefficient Filtering (`filterTasksByLanguage`)
**Problems**:
- Three separate passes through data
- Uses substring instead of proper comparison
- Creates unnecessary intermediate arrays
```tsx
// Pass 1: Copy array
for (let i = 0; i < tasks.length; i++) {
  filtered.push(tasks[i]);
}
// Pass 2: Filter
for (let i = 0; i < filtered.length; i++) { ... }
// Pass 3: Copy again
for (let item of result) {
  finalResult.push(item);
}
```
**Impact**: Poor performance, confusing logic

### Issue 5: Race Condition in Async Function (`processEvaluation`)
**Problem**:
```tsx
let processingCount = 0; // Global state

export async function processEvaluation(id: string) {
  processingCount++; // Race condition here
  try {
    await new Promise(...);
  } finally {
    processingCount--; // And here
  }
}
```
**Impact**: Multiple concurrent calls cause counter corruption

---

## 3. Buggy API Endpoint (`app/api/stats/route.ts`)

### Issue 1: No Authentication
**Problem**: Anyone can call this endpoint, no session verification
```tsx
// No auth check! Should verify user session
const userId = request.nextUrl.searchParams.get('userId');
```

### Issue 2: Weak Input Validation
**Problem**: No sanitization of userId parameter
```tsx
if (!userId) { ... }
// What about special characters, SQLi, etc?
```

### Issue 3: Security Information Leakage
**Problems**:
- Exposes error stack traces
- Leaks request details
- Returns cache metadata
```tsx
stack: error.stack, // SECURITY ISSUE!
timestamp: new Date().toISOString(),
cacheSize: cachedStats.size, // Why expose this?
```

### Issue 4: Memory Leak in Rate Limiting
**Problem**: Request counter never gets pruned
```tsx
const requestCounts: Map<string, number> = new Map();
requestCounts.set(userId, count); // Never cleaned up!
```

### Issue 5: Ineffective Cache Strategy
**Problem**:
- Cache never expires (no TTL)
- Stale data served indefinitely
- Cache not invalidated on updates

### Issue 6: Hardcoded Response Data
**Problem**: Returns dummy values instead of querying database
```tsx
const stats = {
  totalTasks: 42, // Should query database!
  completedTasks: 15,
  averageScore: 85.5,
};
```

### Issue 7: Missing Error Handling
**Problem**: Generic catch block, doesn't distinguish between error types
```tsx
try { ... } 
catch (error: any) {
  // Returns full stack trace to client!
}
```

---

## How to Fix These Issues

### Using AI Tools (Copilot/Cursor):
1. **Ask**: "Review this component and identify all bugs"
2. **Ask**: "Fix the memory leak in the cache implementation"
3. **Ask**: "Refactor this to improve performance from O(n²) to O(n)"
4. **Ask**: "Add proper error handling and input validation"

### Manual Fixes Needed:
- Add Supabase dependency to package.json if needed
- Update environment variables in .env.local
- Create proper TypeScript types
- Add unit tests for fixed functions

---

## Testing the Bugs

### Component Bug Testing:
```bash
# Try clicking the "Open Modal" button in the broken component
# Expected: Modal should open
# Actual: Modal remains closed (state bug)
```

### Function Bug Testing:
```typescript
// Test average score calculation
const evals = [{score: 80}, {score: 90}];
calculateAverageScore(evals);
// Expected: 85
// Actual: 1.7 (due to division by 100 hardcoding)
```

### API Bug Testing:
```bash
# Test rate limiting (doesn't work)
curl http://localhost:3000/api/stats?userId=test
# Request 1000+ times - all succeed (no rate limiting!)

# Test without auth
curl http://localhost:3000/api/stats?userId=any-user
# Returns sensitive data without authentication
```

---

## AI Tool Usage Evidence

These bugs were intentionally created to demonstrate:
1. ✅ Real debugging process with AI assistance
2. ✅ Refactoring complex code logic
3. ✅ Performance optimization
4. ✅ Security issue identification
5. ✅ Code quality improvements
6. ✅ Memory leak detection and fixing

Document any changes made to these files using AI tools in the submission as "What You Edited Manually" or "What AI Fixed".
