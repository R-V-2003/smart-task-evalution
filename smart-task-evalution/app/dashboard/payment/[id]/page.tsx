'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Evaluation = {
  id: string;
  task_id: string;
  score: number;
  is_paid: boolean;
};

export default function PaymentPage() {
  const params = useParams();
  const evaluationId = params.id as string;
  const { user, loading } = useAuth();
  const router = useRouter();

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && evaluationId) {
      fetchEvaluation();
    }
  }, [user, evaluationId]);

  const fetchEvaluation = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('id', evaluationId)
        .eq('user_id', user?.id)
        .single();

      if (fetchError || !data) {
        setError('Evaluation not found');
        setPageLoading(false);
        return;
      }

      if (data.is_paid) {
        router.push(`/dashboard/evaluate/${data.task_id}`);
        return;
      }

      setEvaluation(data);
      setPageLoading(false);
    } catch (err) {
      console.error('Error fetching evaluation:', err);
      setError('Failed to load evaluation');
      setPageLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      console.log('Starting payment process...');

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationId }),
      });

      console.log('Checkout API response:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('Checkout error:', data);
        throw new Error(data.error || 'Payment failed');
      }

      const { url } = await response.json();
      console.log('Checkout URL received:', url);

      if (!url) {
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to Stripe checkout...');

      // Redirect to Stripe Checkout page
      window.location.href = url;
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred');
      setIsProcessing(false);
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

  if (error && !evaluation) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Unlock Full Report</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Price Card */}
          <div className="text-center mb-8">
            <Lock className="mx-auto text-yellow-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Full Evaluation Report</h2>
            <p className="text-gray-600 mb-6">
              Get comprehensive feedback including detailed analysis and actionable recommendations
            </p>

            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-8 mb-8">
              <div className="text-5xl font-bold text-indigo-600 mb-2">$4.99</div>
              <p className="text-gray-600">One-time payment</p>
            </div>

            {/* Features */}
            <div className="text-left bg-gray-50 rounded-lg p-6 mb-8 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-gray-700">Detailed code analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-gray-700">Performance optimization tips</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-gray-700">Best practices recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-gray-700">Refactoring suggestions</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-indigo-700 disabled:bg-gray-400 transition duration-200"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Secure payment powered by Stripe. Your information is encrypted.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
