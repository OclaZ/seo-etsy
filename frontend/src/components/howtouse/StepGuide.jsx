const steps = [
  {
    num: 1,
    title: 'Upload Images & Keywords',
    description:
      'Select the images and the keywords you want to inject into the metadata.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: 2,
    title: 'Select Images for Custom Metadata',
    description:
      'The selected images can have custom metadata applied to them. The images that are not selected will take the keywords you set in the first step.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    num: 3,
    title: 'Set Base Name & Process',
    description:
      'Add the keywords to the image filename. Click optimize and all the images will have the keywords added to their metadata.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    num: 4,
    title: 'Download & Check Results',
    description:
      'The metadata for the photos that were not selected will have the default keywords. Custom metadata for the images that were selected will have the custom values you set.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    num: 5,
    title: 'Scrape Images from Any Website',
    description:
      'Use the Image Scraper to scrape images from any website. Enter a URL and download the images you need.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    num: 6,
    title: 'Convert Images to the Right Format',
    description:
      'Convert the images to PNG, JPEG, or JPG format because these are the formats where we can inject metadata.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    num: 7,
    title: 'Verify Metadata with Checker',
    description:
      'Go to the checker to verify the metadata. Upload your image and it will give you details about the metadata inside it.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function StepCard({ step }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 animate-fade-in hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Step number + icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/30">
            {step.icon}
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
              Step {step.num}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StepGuide() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
        Step-by-Step Guide
      </h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <StepCard key={step.num} step={step} />
        ))}
      </div>
    </section>
  );
}
