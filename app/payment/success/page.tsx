'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const evaluationId = searchParams.get('evaluation_id');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Verify payment after a short delay
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="text-center">
        <CheckCircle className="mx-auto text-green-600 mb-6" size={64} />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">Your full report has been unlocked.</p>

        {isVerifying ? (
          <div className="mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Verifying payment...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Link
              href={`/dashboard/evaluate/${evaluationId}`}
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              View Your Report
            </Link>
            <p className="text-sm text-gray-600">
              or{' '}
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
                return to dashboard
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
