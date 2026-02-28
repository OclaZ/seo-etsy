const steps = [
  { num: 1, label: 'Upload' },
  { num: 2, label: 'Configure' },
  { num: 3, label: 'Process' },
  { num: 4, label: 'Download' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-6">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                s.num < currentStep
                  ? 'bg-green-500 text-white'
                  : s.num === currentStep
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {s.num < currentStep ? '✓' : s.num}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                s.num === currentStep
                  ? 'text-orange-500'
                  : s.num < currentStep
                  ? 'text-green-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 mb-5 transition-colors duration-300 ${
                s.num < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
