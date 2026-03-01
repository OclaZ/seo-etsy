export default function VideoSection() {
  return (
    <section className="mb-12 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Video Tutorial
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Watch a complete walkthrough of the optimization process
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl overflow-hidden bg-black shadow-lg">
            <video
              controls
              preload="metadata"
              className="w-full aspect-video"
            >
              <source src="/video adz.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
