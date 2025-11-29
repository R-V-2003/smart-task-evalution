'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import Link from 'next/link';
import { Sparkles, Code, Zap, Lock, CheckCircle, Star, TrendingUp, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Animated Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 sm:p-2 rounded-lg">
              <Code className="text-white" size={20} />
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Smart Task Evaluator
            </h1>
          </div>
          <div className="flex gap-2 sm:gap-4 items-center">
            <Link href="/auth/login" className="text-sm sm:text-base text-gray-700 hover:text-indigo-600 font-medium transition px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:shadow-lg transition transform hover:scale-105"
            >
              <span className="hidden sm:inline">Get Started Free</span>
              <span className="sm:hidden">Start</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-10 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16">
          <div className="inline-block mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
            <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
              <Sparkles size={14} className="sm:w-4 sm:h-4" />
              AI-Powered Code Intelligence
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Elevate Your Code with
            <br className="hidden sm:block" />
            <span className="sm:inline"> </span>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered Reviews
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed px-4">
            Get instant, intelligent feedback on your coding tasks. Powered by advanced AI to help you write better code, faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Link
              href="/auth/signup"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Code size={20} className="sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Start Free Trial</span>
              <span className="sm:hidden">Start Free</span>
              <ArrowRight className="group-hover:translate-x-1 transition" size={18} />
            </Link>
            <Link
              href="/auth/login"
              className="border-2 border-indigo-600 text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-indigo-50 transition"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto mt-8 sm:mt-12 md:mt-16 px-4">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">10k+</div>
              <div className="text-gray-600 text-xs sm:text-sm font-medium mt-1">Code Reviews</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">98%</div>
              <div className="text-gray-600 text-xs sm:text-sm font-medium mt-1">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">&lt;5s</div>
              <div className="text-gray-600 text-xs sm:text-sm font-medium mt-1">Response Time</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 my-12 sm:my-16 md:my-24 px-4">
          <div className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition transform hover:-translate-y-2 border border-indigo-100">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition">
              <Code className="text-white" size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Upload</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Upload code in any language. JavaScript, Python, Java, C++, and more. Our AI understands them all.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition transform hover:-translate-y-2 border border-purple-100">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Lightning Fast</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Get comprehensive analysis in seconds. Score, strengths, improvements, and actionable feedback instantly.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition transform hover:-translate-y-2 border border-pink-100">
            <div className="bg-gradient-to-br from-pink-500 to-indigo-500 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Continuous Growth</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Track your progress over time. See how your code quality improves with every submission.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 my-12 sm:my-16 md:my-24 border border-indigo-100 mx-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 md:mb-16 text-sm sm:text-base md:text-lg">Get started in 4 simple steps</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { num: 1, title: 'Sign Up', desc: 'Create your free account in seconds' },
              { num: 2, title: 'Upload Code', desc: 'Submit your coding task for review' },
              { num: 3, title: 'Get Evaluated', desc: 'Receive instant AI-powered feedback' },
              { num: 4, title: 'Improve & Grow', desc: 'Apply insights and level up' }
            ].map((step) => (
              <div key={step.num} className="text-center group">
                <div className="relative inline-block mb-4 sm:mb-6">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg group-hover:scale-110 transition">
                    {step.num}
                  </div>
                  {step.num < 4 && (
                    <ArrowRight className="hidden md:block absolute top-6 -right-12 text-indigo-300" size={24} />
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">{step.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 my-12 sm:my-16 md:my-24 border border-purple-100 mx-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 md:mb-16 text-sm sm:text-base md:text-lg">Pay only for what you need</p>

          <div className="max-w-md mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-indigo-200">
            <div className="text-center mb-6">
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                $4.99
              </div>
              <div className="text-sm sm:text-base text-gray-600">per detailed report</div>
            </div>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {[
                'Comprehensive code analysis',
                'Detailed improvement suggestions',
                'Performance optimization tips',
                'Best practices recommendations',
                'Refactoring guidance'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                  <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 text-center text-white my-12 sm:my-16 md:my-24 overflow-hidden mx-4">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">Ready to Write Better Code?</h2>
            <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of developers improving their skills with AI-powered code reviews
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-xl"
            >
              Get Started Free
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-gray-300 py-8 sm:py-10 md:py-12 mt-12 sm:mt-16 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 sm:p-2 rounded-lg">
                <Code className="text-white" size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Smart Task Evaluator</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 px-4">Empowering developers with AI-powered code intelligence</p>
            <p className="text-xs sm:text-sm text-gray-500">&copy; 2025 Smart Task Evaluator. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
