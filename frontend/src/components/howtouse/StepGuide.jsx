const steps = [
  {
    num: 1,
    title: 'Upload Your Images & Keywords',
    description:
      'Drag and drop your Etsy product images (JPG, PNG) into the upload zone. Then upload a .txt keyword file or type your SEO keywords manually, one per line.',
    image: '/imgs/image1-uploadimgs.png',
    tips: [
      'Supports JPG, JPEG, and PNG formats up to 10MB each',
      'Keywords can be uploaded from a .txt file or typed directly',
      'Upload up to 50 images at once for bulk processing',
    ],
  },
  {
    num: 2,
    title: 'Configure SEO Settings',
    description:
      'Enter a keyword-rich base name for filenames. Select which images get custom metadata. Toggle individual SEO fields and set custom values per field.',
    image: '/imgs/configure-page.png',
    tips: [
      'The rename preview updates in real-time as you type',
      'Select specific images for custom metadata using thumbnails',
      'Toggle fields: Title, Subject, Tags, Description, Comments',
    ],
  },
  {
    num: 3,
    title: 'Process & Optimize',
    description:
      'Review the summary of your selected images, keywords, and base name. Click "Optimize Images" to rename files and inject SEO metadata into every image.',
    image: '/imgs/Process-page.png',
    tips: [
      'Double-check your image count and keyword count before processing',
      'Keywords are injected into EXIF metadata fields automatically',
      'Unselected images still get default keywords injected',
    ],
  },
  {
    num: 4,
    title: 'Download Results',
    description:
      'View the optimization results showing all renamed files and injected keywords. Download all optimized images as a single ZIP file ready for Etsy.',
    image: '/imgs/dowload-page.png',
    tips: [
      'Each download gets a unique ZIP filename',
      'Upload the optimized images directly to your Etsy listings',
      'Click "Start Over" to process another batch of images',
    ],
  },
  {
    num: 5,
    title: 'Verify the Result',
    description:
      'Right-click any optimized image and check Properties > Details. You will see your keywords injected into Title, Subject, Tags, and Comments fields.',
    image: '/imgs/resultat-final.png',
    tips: [
      'On Windows: right-click > Properties > Details tab',
      'Etsy reads these metadata fields for search ranking',
      'All 6 metadata fields are filled: Title, Subject, Tags, Description, Comments, UserComment',
    ],
  },
];

function StepCard({ step, isReversed }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in">
      <div
        className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-6 lg:gap-8`}
      >
        {/* Text Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shadow-orange-500/30 flex-shrink-0">
              {step.num}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {step.title}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {step.description}
          </p>
          <ul className="space-y-2">
            {step.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <svg
                  className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Screenshot */}
        <div className="flex-1">
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
            <img
              src={step.image}
              alt={`Step ${step.num}: ${step.title}`}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
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
      <div className="space-y-8">
        {steps.map((step, index) => (
          <StepCard key={step.num} step={step} isReversed={index % 2 !== 0} />
        ))}
      </div>
    </section>
  );
}
