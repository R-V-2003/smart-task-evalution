'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Loader, CheckCircle } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  code: string;
  language: string;
  description: string;
};

type Evaluation = {
  id: string;
  score: number;
  strengths: string[];
  improvements: string[];
  full_report: string;
  fixed_code: string;
  is_paid: boolean;
};

export default function EvaluatePage() {
  const params = useParams();
  const taskId = params.id as string;
  const { user, loading } = useAuth();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && taskId) {
      fetchTask();
    }
  }, [user, taskId]);

  const fetchTask = async () => {
    try {
      const { data, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', user?.id)
        .single();

      if (taskError || !data) {
        setError('Task not found');
        setPageLoading(false);
        return;
      }

      setTask(data);

      // Check if evaluation already exists
      const { data: evalData } = await supabase
        .from('evaluations')
        .select('*')
        .eq('task_id', taskId)
        .single();

      if (evalData) {
        setEvaluation(evalData);
      }

      setPageLoading(false);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load task');
      setPageLoading(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setError('');

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Evaluation failed');
      }

      const result = await response.json();
      setEvaluation(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during evaluation');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error && !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{task?.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Code Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Code Preview</h2>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="font-mono text-sm">
                  <code>{task?.code}</code>
                </pre>
              </div>

              {task?.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{task.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Evaluation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">AI Evaluation</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {!evaluation ? (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Get AI-powered feedback on your code including score, strengths, and improvement areas.
                  </p>
                  <button
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition duration-200 flex items-center justify-center gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Evaluating...
                      </>
                    ) : (
                      'Run AI Evaluation'
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Score */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <h3 className="text-sm font-semibold text-gray-700">Overall Score</h3>
                    </div>
                    <div className="text-4xl font-bold text-indigo-600">{evaluation.score}/100</div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Strengths</h3>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-green-600 flex-shrink-0">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Areas to Improve</h3>
                    <ul className="space-y-2">
                      {evaluation.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-yellow-600 flex-shrink-0">→</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Full Report Button */}
                  {!evaluation.is_paid && (
                    <button
                      onClick={() => router.push(`/dashboard/payment/${evaluation.id}`)}
                      className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-600 transition duration-200"
                    >
                      Unlock Full Report ($4.99)
                    </button>
                  )}

                  {evaluation.is_paid && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Full Report</h4>
                        <p className="text-sm text-green-800 whitespace-pre-wrap">{evaluation.full_report}</p>
                      </div>

                      {evaluation.fixed_code && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Fixed Code</h4>
                          <p className="text-xs text-blue-700 mb-3">Code with all bugs fixed, refactoring applied, and performance optimizations:</p>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <pre className="font-mono text-sm">
                              <code>{evaluation.fixed_code}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
