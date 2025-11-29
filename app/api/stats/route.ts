import { NextRequest, NextResponse } from 'next/server';

/**
 * INTENTIONAL BUG API ROUTE: Task Statistics
 * 
 * Issues this endpoint has:
 * - No authentication checks
 * - SQL Injection vulnerability (though using Supabase, principle still applies)
 * - Inefficient database queries
 * - No input validation
 * - Missing error handling
 * - Returns sensitive data
 * - No rate limiting
 * - Memory leak in response handling
 */

const cachedStats: Map<string, any> = new Map();
const requestCounts: Map<string, number> = new Map();

export async function GET(request: NextRequest) {
  try {
    // BUG: No authentication - anyone can call this
    // Should check for valid user session
    
    const userId = request.nextUrl.searchParams.get('userId');
    
    // BUG: Insufficient input validation
    // What if userId contains special characters?
    // No regex check, no sanitization
    
    if (!userId) {
      // BUG: Returns sensitive error information
      return NextResponse.json(
        { 
          error: 'User ID is required',
          timestamp: new Date(),
          request: request.nextUrl.pathname, // BUG: Leaking request details
        },
        { status: 400 }
      );
    }
    
    // BUG: No rate limiting - same user can spam requests
    const count = (requestCounts.get(userId) || 0) + 1;
    requestCounts.set(userId, count); // Memory leak: never cleaned up!
    
    if (count > 1000) {
      console.error(`User ${userId} exceeded request limit`);
      // BUG: Still processes request even though limit exceeded
    }
    
    // BUG: Check cache without validating expiration
    if (cachedStats.has(userId)) {
      // BUG: Cache never expires - stale data will be served
      return NextResponse.json({
        data: cachedStats.get(userId),
        cached: true,
        // BUG: Leaking cache timestamp
        cacheTime: new Date().toISOString(),
      });
    }
    
    // BUG: Hardcoded values instead of computing
    const stats = {
      totalTasks: 42, // Should query database
      completedTasks: 15,
      averageScore: 85.5,
      totalEvaluations: 100,
      paidReports: 8,
    };
    
    // BUG: No response sanitization
    // Returns all data without checking permissions
    
    // BUG: Cache without TTL - memory leak
    cachedStats.set(userId, stats);
    
    // BUG: No pagination for large responses
    // BUG: No compression specified
    // BUG: Missing security headers
    
    return NextResponse.json({
      status: 'success',
      data: stats,
      userId: userId, // BUG: Echo back user input unsafely
      timestamp: new Date().toISOString(),
      processingTime: Math.random() * 1000, // BUG: Fake processing time, not actual
    });
    
  } catch (error: any) {
    // BUG: Exposing full error stack in response
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack, // BUG: SECURITY ISSUE - leaking stack trace
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // BUG: No content-type validation
    const body = await request.json();
    
    const { userId, taskId, score } = body;
    
    // BUG: Very weak input validation
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    // BUG: No validation of score range (should be 0-100)
    // No check if taskId exists
    // No check if user owns this task
    
    // BUG: Directly modifying cache without locking/sync
    const stats = cachedStats.get(userId) || {};
    stats.totalTasks = (stats.totalTasks || 0) + 1;
    cachedStats.set(userId, stats);
    
    // BUG: Not returning proper response format
    // BUG: No transaction handling
    
    // BUG: This is inefficient - should batch updates
    return NextResponse.json({
      updated: true,
      // BUG: Returning sensitive internal state
      cacheSize: cachedStats.size,
      requestCountSize: requestCounts.size,
    });
    
  } catch (error: any) {
    // BUG: Same stack trace leak
    return NextResponse.json(
      { error: error.stack },
      { status: 500 }
    );
  }
}
