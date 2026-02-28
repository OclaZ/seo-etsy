import { useState } from 'react';

const SEO_FIELDS = [
  {
    key: 'title',
    label: 'Title',
    hint: 'Shows as "Title" in image properties',
  },
  {
    key: 'subject',
    label: 'Subject',
    hint: 'Shows as "Subject" in image properties',
  },
  {
    key: 'tags',
    label: 'Tags / Keywords',
    hint: 'Shows as "Tags" in image properties',
  },
  {
    key: 'comments',
    label: 'Comments',
    hint: 'Shows as "Comments" in image properties',
  },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${checked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md
          transform transition duration-200 ease-in-out mt-0.5
          ${checked ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
}

function SeoFieldRow({ field, config, onChange }) {
  const isDisabled = !config.enabled;

  return (
    <div
      className={`
        rounded-xl border p-4 transition-all duration-200
        ${isDisabled
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
          : 'border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20'
        }
      `}
    >
      {/* Header: label + toggle */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {field.label}
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {field.hint}
          </p>
        </div>
        <Toggle
          checked={config.enabled}
          onChange={(val) => onChange({ enabled: val })}
        />
      </div>

      {/* Mode selector + custom input */}
      {config.enabled && (
        <div className="mt-3 space-y-2 animate-fade-in">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`seo-mode-${field.key}`}
                checked={config.mode === 'keywords'}
                onChange={() => onChange({ mode: 'keywords' })}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-400 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Use keywords
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`seo-mode-${field.key}`}
                checked={config.mode === 'custom'}
                onChange={() => onChange({ mode: 'custom' })}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-400 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Custom value
              </span>
            </label>
          </div>

          {config.mode === 'custom' && (
            <input
              type="text"
              value={config.customValue}
              onChange={(e) => onChange({ customValue: e.target.value })}
              placeholder={`Enter custom ${field.label.toLowerCase()}...`}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                transition-all duration-200"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function SeoMetadataSettings({ settings, onFieldChange, onSetAll }) {
  const [expanded, setExpanded] = useState(true);

  const allEnabled = Object.values(settings).every((f) => f.enabled);
  const allDisabled = Object.values(settings).every((f) => !f.enabled);

  return (
    <div className="mt-6">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            SEO Metadata Settings
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal normal-case">
            Control what gets injected
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible content */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${expanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
        `}
      >
        {/* Quick actions */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => onSetAll({ enabled: true })}
            disabled={allEnabled}
            className="px-3 py-1 text-xs font-medium rounded-md
              bg-orange-100 text-orange-700 hover:bg-orange-200
              dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={() => onSetAll({ enabled: false })}
            disabled={allDisabled}
            className="px-3 py-1 text-xs font-medium rounded-md
              bg-gray-100 text-gray-600 hover:bg-gray-200
              dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Disable All
          </button>
        </div>

        {/* Field rows */}
        <div className="space-y-3">
          {SEO_FIELDS.map((field) => (
            <SeoFieldRow
              key={field.key}
              field={field}
              config={settings[field.key]}
              onChange={(value) => onFieldChange(field.key, value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
