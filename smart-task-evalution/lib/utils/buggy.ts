// INTENTIONAL BUG: Poorly written utility functions
// These functions have multiple performance, logic, and code quality issues

/**
 * BUG: Inefficient code quality score calculation
 * Issues:
 * - N+1 query problem (loads all evaluations)
 * - Inefficient array operations
 * - No error handling
 * - Hardcoded values
 * - O(n²) complexity
 */
export function calculateAverageScore(evaluations: any[]): number {
  let sum = 0;
  
  // BUG: Iterating and searching instead of using reduce
  for (let i = 0; i < evaluations.length; i++) {
    for (let j = 0; j < evaluations.length; j++) {
      if (i === j) {
        sum += evaluations[i].score;
        break; // BUG: Confusing logic, should just add once
      }
    }
  }
  
  // BUG: Hardcoded divisor - doesn't account for actual array length
  return sum / 100; // Should be evaluations.length
}

/**
 * BUG: Memory leak due to improper state management
 * Issues:
 * - Global state that never gets cleaned up
 * - No bounds checking
 * - Unbounded growth
 */
const cachedResults: any[] = [];

export function cacheEvaluation(id: string, data: any): void {
  // BUG: No cache size limit - will grow indefinitely
  // BUG: No TTL or expiration strategy
  // BUG: Could lead to memory leaks in production
  cachedResults.push({ id, data, timestamp: Date.now() });
  
  // BUG: This array never gets pruned or cleared
}

export function getCachedEvaluation(id: string): any | null {
  // BUG: Linear search instead of hash map
  for (let i = 0; i < cachedResults.length; i++) {
    if (cachedResults[i].id === id) {
      return cachedResults[i].data;
    }
  }
  return null;
}

/**
 * BUG: String validation with multiple issues
 * Issues:
 * - Regex is incorrect/incomplete
 * - No input sanitization
 * - Case-sensitive when shouldn't be
 * - Inefficient concatenation
 */
export function validateEmail(email: string): boolean {
  // BUG: Incomplete regex - won't catch many valid emails
  const regex = /^[a-z]+@[a-z]+$/;
  
  // BUG: No trim or normalize before validation
  // BUG: These could be combined more efficiently
  let result = regex.test(email);
  
  if (result === true && result === true) {
    // BUG: Redundant condition
    return result;
  }
  
  return false;
}

/**
 * BUG: Inefficient task filtering with multiple issues
 * Issues:
 * - Multiple passes through data
 * - Expensive string operations
 * - No early returns
 * - Type safety issues
 */
export function filterTasksByLanguage(
  tasks: any[],
  language: string
): any[] {
  let filtered: any[] = [];
  
  // BUG: First pass - creating intermediate array
  for (let i = 0; i < tasks.length; i++) {
    filtered.push(tasks[i]);
  }
  
  // BUG: Second pass - actually filtering (should do in one pass)
  let result: any[] = [];
  for (let i = 0; i < filtered.length; i++) {
    // BUG: Using substring instead of proper string comparison
    if (filtered[i].language.substring(0, language.length) === language) {
      result.push(filtered[i]);
    }
  }
  
  // BUG: Third pass - why create a new array just to return?
  let finalResult: any[] = [];
  for (let item of result) {
    finalResult.push(item);
  }
  
  return finalResult;
}

/**
 * BUG: Race condition in async function
 * Issues:
 * - No proper error handling
 * - Race condition with multiple calls
 * - No timeout
 * - Global state mutation
 */
let processingCount = 0;

export async function processEvaluation(id: string): Promise<any> {
  // BUG: Race condition - multiple calls increment counter
  processingCount++;
  
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // BUG: No check if the request is still valid
    return { id, processed: true };
  } finally {
    // BUG: This doesn't run atomically with the increment above
    processingCount--;
  }
}

export function getProcessingCount(): number {
  // BUG: Race condition reading counter
  return processingCount;
}
