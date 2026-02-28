export default function ResultsSummary({ results }) {
  const { renamed, injected, errors } = results;

  return (
    <div className="animate-slide-up space-y-4">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Optimization Complete!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Your images are SEO-ready for Etsy
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {renamed.length}
          </p>
          <p className="text-sm text-blue-500 font-medium">Files Renamed</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {injected.length}
          </p>
          <p className="text-sm text-green-500 font-medium">Keywords Injected</p>
        </div>
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-200 dark:border-red-800">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {errors.length}
            </p>
            <p className="text-sm text-red-500 font-medium">Errors</p>
          </div>
        )}
      </div>

      {renamed.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Renamed Files
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">
                    Original
                  </th>
                  <th className="px-4 py-2 text-center text-gray-400">→</th>
                  <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">
                    SEO Name
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {renamed.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-gray-500 font-mono text-xs">
                      {item.original}
                    </td>
                    <td className="px-4 py-2 text-center text-orange-400">→</td>
                    <td className="px-4 py-2 text-green-600 dark:text-green-400 font-mono text-xs font-semibold">
                      {item.renamed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
            Errors
          </h3>
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-500">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
