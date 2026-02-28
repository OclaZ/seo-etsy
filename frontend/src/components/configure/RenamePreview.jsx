export default function RenamePreview({ preview }) {
  if (preview.length === 0) return null;

  return (
    <div className="mt-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Rename Preview
      </h3>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">
                #
              </th>
              <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">
                Current Name
              </th>
              <th className="px-4 py-2 text-center text-gray-400">→</th>
              <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">
                New Name (SEO)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {preview.map((item, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
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
  );
}
