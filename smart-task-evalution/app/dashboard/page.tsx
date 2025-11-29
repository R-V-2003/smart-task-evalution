'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { LogOut, Plus, Clock, CheckCircle, Lock } from 'lucide-react';

type TaskWithEvaluation = {
  id: string;
  title: string;
  created_at: string;
  evaluation?: {
    score: number;
    is_paid: boolean;
  } | null;
};

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithEvaluation[]>([]);
  const [stats, setStats] = useState({ total: 0, evaluated: 0, paid: 0 });
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch evaluations
      const { data: evaluationsData } = await supabase
        .from('evaluations')
        .select('task_id, score, is_paid')
        .in('task_id', tasksData?.map((t: any) => t.id) || []);

      const tasksWithEval = tasksData?.map((task: any) => ({
        ...task,
        evaluation: evaluationsData?.find((e: any) => e.task_id === task.id) || null,
      })) || [];

      setTasks(tasksWithEval);
      setStats({
        total: tasksWithEval.length,
        evaluated: tasksWithEval.filter((t: any) => t.evaluation).length,
        paid: tasksWithEval.filter((t: any) => t.evaluation?.is_paid).length,
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Smart Task Evaluator</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.email}!</h2>
          <p className="text-gray-600">Manage and evaluate your coding tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Clock className="text-indigo-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Evaluated</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.evaluated}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Full Reports Unlocked</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.paid}</p>
              </div>
              <Lock className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition mb-8"
        >
          <Plus size={20} />
          Upload New Task
        </Link>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Tasks</h3>
          </div>

          {tasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 mb-4">No tasks yet. Upload your first task to get started!</p>
              <Link
                href="/dashboard/upload"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Upload Task →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/evaluate/${task.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {task.evaluation ? (
                        <>
                          <span className="text-sm font-medium text-gray-700">
                            Score: {task.evaluation.score}/100
                          </span>
                          {!task.evaluation.is_paid && (
                            <Lock size={18} className="text-gray-400" />
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Pending evaluation</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
