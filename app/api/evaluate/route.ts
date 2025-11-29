import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const groqApiKey = process.env.GROQ_API_KEY || '';

// Only create client if URL is provided
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
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

    // Call Groq API for evaluation
    const evaluationPrompt = `
You are an expert code reviewer. Evaluate the following ${task.language} code and provide:
1. A score out of 100
2. A list of strengths (3-5 points)
3. A list of improvements (3-5 points)
4. A detailed report with suggestions

Code to review:
\`\`\`${task.language}
${task.code}
\`\`\`

${task.description ? `Context: ${task.description}` : ''}

Provide your response in the following JSON format:
{
  "score": <number>,
  "strengths": [<string>, <string>, ...],
  "improvements": [<string>, <string>, ...],
  "fullReport": "<detailed analysis>"
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
      const error = await groqResponse.json();
      return NextResponse.json(
        { error: 'Groq API error: ' + (error.error?.message || 'Unknown error') },
        { status: 500 }
      );
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response format from AI' }, { status: 500 });
    }

    const evaluation = JSON.parse(jsonMatch[0]);

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
