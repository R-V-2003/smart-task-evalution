import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const groqApiKey = process.env.GROQ_API_KEY || '';

// Only create client if URL is provided
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    if (!groqApiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { taskId } = body;

    // Validate task ID
    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json({ error: 'Valid Task ID is required' }, { status: 400 });
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      return NextResponse.json({ error: 'Invalid Task ID format' }, { status: 400 });
    }

    // Fetch task from database
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if task already has an evaluation
    const { data: existingEval } = await supabase
      .from('evaluations')
      .select('id')
      .eq('task_id', taskId)
      .single();

    if (existingEval) {
      return NextResponse.json({ error: 'Task has already been evaluated' }, { status: 409 });
    }

    // Validate task has required fields
    if (!task.code || !task.language) {
      return NextResponse.json({ error: 'Task is missing required code or language' }, { status: 400 });
    }

    // Call Groq API for evaluation
    const evaluationPrompt = `
You are an expert code reviewer and software engineer. Your task is to comprehensively evaluate the following ${task.language} code.

Your evaluation MUST focus on three main areas:
1. **Bug Fixes** - Identify any bugs, errors, edge cases, or potential runtime issues
2. **Refactoring** - Suggest improvements to code structure, readability, maintainability, and design patterns
3. **Performance Improvements** - Identify performance bottlenecks, inefficiencies, and optimization opportunities

Code to review:
\`\`\`${task.language}
${task.code}
\`\`\`

${task.description ? `Context: ${task.description}` : ''}

Analyze the code for:
- **Bugs**: Logic errors, null pointer issues, off-by-one errors, race conditions, memory leaks, incorrect algorithms
- **Refactoring**: Code duplication, poor naming, complex functions, violation of SOLID principles, missing abstractions, hard-coded values
- **Performance**: Time complexity (O(n²) vs O(n)), space complexity, unnecessary loops, inefficient data structures, database N+1 queries, missing caching

**IMPORTANT**: You must also provide a complete rewritten version of the code with ALL improvements applied.

Provide your response in the following JSON format:
{
  "score": <number 0-100>,
  "strengths": [<string>, <string>, ...],
  "improvements": [<string>, <string>, ...],
  "fullReport": "<detailed analysis covering: 1. Bug Fixes section with specific bugs found and how to fix them, 2. Refactoring section with code quality improvements, 3. Performance section with optimization opportunities and complexity analysis>",
  "fixedCode": "<complete rewritten code with ALL bugs fixed, refactoring applied, and performance optimizations implemented. Include comments explaining key changes.>"
}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: evaluationPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);

      let errorMessage = 'AI evaluation service error';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        // Use default message
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: groqResponse.status === 429 ? 429 : 500 }
      );
    }

    const groqData = await groqResponse.json();

    // Validate response structure
    if (!groqData.choices || !groqData.choices[0] || !groqData.choices[0].message) {
      return NextResponse.json({ error: 'Invalid AI response structure' }, { status: 500 });
    }

    const content = groqData.choices[0].message.content;

    // Parse JSON response with better error handling
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI response does not contain valid JSON:', content);
      return NextResponse.json({ error: 'Invalid response format from AI' }, { status: 500 });
    }

    let evaluation;
    try {
      evaluation = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({ error: 'Failed to parse AI evaluation' }, { status: 500 });
    }

    // Validate evaluation structure
    if (typeof evaluation.score !== 'number' ||
        !Array.isArray(evaluation.strengths) ||
        !Array.isArray(evaluation.improvements) ||
        typeof evaluation.fullReport !== 'string' ||
        typeof evaluation.fixedCode !== 'string') {
      return NextResponse.json({ error: 'Invalid evaluation format from AI' }, { status: 500 });
    }

    // Ensure score is within bounds
    evaluation.score = Math.max(0, Math.min(100, Math.round(evaluation.score)));

    // Save evaluation to database
    const { data: savedEvaluation, error: saveError } = await supabase
      .from('evaluations')
      .insert([
        {
          task_id: taskId,
          user_id: task.user_id,
          score: evaluation.score,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          full_report: evaluation.fullReport,
          fixed_code: evaluation.fixedCode,
          is_paid: false,
        },
      ])
      .select()
      .single();

    if (saveError) {
      return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 });
    }

    return NextResponse.json(savedEvaluation);
  } catch (error: any) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'An error occurred during evaluation' },
      { status: 500 }
    );
  }
}
