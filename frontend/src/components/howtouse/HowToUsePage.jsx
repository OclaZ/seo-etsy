import { useEffect } from 'react';
import VideoSection from './VideoSection';
import StepGuide from './StepGuide';

export default function HowToUsePage({ onBackToApp }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4">
      {/* Page Header */}
      <div className="text-center py-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tutorial
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          How to Use
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Learn how to optimize your Etsy product images for SEO in just 4 simple steps
        </p>
      </div>

      {/* Video Tutorial */}
      <VideoSection />

      {/* Step-by-Step Guide */}
      <StepGuide />

      {/* Call to Action */}
      <div className="text-center py-10 animate-fade-in">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Ready to optimize your images?
        </p>
        <button
          onClick={onBackToApp}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] transition-all duration-300"
        >
          Start Optimizing Now
        </button>
      </div>
    </main>
  );
}
