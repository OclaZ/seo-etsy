import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useAppState, useAppDispatch } from './context/AppContext';
import {
  uploadImages,
  uploadKeywordFile,
  uploadKeywordsText,
  getRenamePreview,
  renameImages,
  injectKeywords,
} from './api/endpoints';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StepIndicator from './components/layout/StepIndicator';
import Toast from './components/ui/Toast';
import ImageDropzone from './components/upload/ImageDropzone';
import ImagePreviewGrid from './components/upload/ImagePreviewGrid';
import KeywordUploader from './components/upload/KeywordUploader';
import BaseNameInput from './components/configure/BaseNameInput';
import RenamePreview from './components/configure/RenamePreview';
import SeoMetadataSettings from './components/configure/SeoMetadataSettings';
import ImageSelector from './components/configure/ImageSelector';
import ProcessButton from './components/process/ProcessButton';
import ProcessingOverlay from './components/process/ProcessingOverlay';
import ResultsSummary from './components/results/ResultsSummary';
import DownloadButton from './components/results/DownloadButton';
import HowToUsePage from './components/howtouse/HowToUsePage';
import MetadataCheckerPage from './components/metadata/MetadataCheckerPage';
import ImageScraperPage from './components/scraper/ImageScraperPage';
import ImageConverterPage from './components/converter/ImageConverterPage';

export default function App() {
  const { dark, toggle } = useTheme();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const previewTimeout = useRef(null);
  const [currentPage, setCurrentPage] = useState('app');
  const [processingStatus, setProcessingStatus] = useState(null);

  const showToast = useCallback(
    (message, type = 'success') => {
      dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    },
    [dispatch]
  );

  // --- Step 1: Upload Handlers ---
  const handleImageDrop = useCallback(
    async (files) => {
      try {
        const data = await uploadImages(files, state.sessionId);
        dispatch({ type: 'SET_SESSION', payload: data.session_id });
        dispatch({ type: 'ADD_IMAGES', payload: files });
        showToast(`${data.file_count} image(s) uploaded`);
      } catch (err) {
        showToast(err.response?.data?.detail || 'Upload failed', 'error');
      }
    },
    [state.sessionId, dispatch, showToast]
  );

  const handleRemoveImage = useCallback(
    (fileToRemove) => {
      dispatch({
        type: 'SET_IMAGES',
        payload: state.images.filter((f) => f !== fileToRemove),
      });
    },
    [state.images, dispatch]
  );

  const handleKeywordFile = useCallback(
    async (file) => {
      if (!state.sessionId) {
        showToast('Please upload images first', 'error');
        return;
      }
      try {
        const data = await uploadKeywordFile(file, state.sessionId);
        dispatch({ type: 'SET_KEYWORDS', payload: data.keywords });
        showToast(`${data.keyword_count} keywords loaded`);
      } catch (err) {
        showToast(err.response?.data?.detail || 'Keyword upload failed', 'error');
      }
    },
    [state.sessionId, dispatch, showToast]
  );

  const handleKeywordText = useCallback(
    async (text) => {
      if (!state.sessionId) {
        showToast('Please upload images first', 'error');
        return;
      }
      try {
        const data = await uploadKeywordsText(state.sessionId, text);
        dispatch({ type: 'SET_KEYWORDS', payload: data.keywords });
        showToast(`${data.keyword_count} keywords saved`);
      } catch (err) {
        showToast(err.response?.data?.detail || 'Failed to save keywords', 'error');
      }
    },
    [state.sessionId, dispatch, showToast]
  );

  // --- Step 2: Configure Handlers ---
  const handleBaseNameChange = useCallback(
    (value) => {
      dispatch({ type: 'SET_BASE_NAME', payload: value });
    },
    [dispatch]
  );

  const handleSeoFieldChange = useCallback(
    (field, value) => {
      dispatch({ type: 'SET_SEO_FIELD', payload: { field, value } });
    },
    [dispatch]
  );

  const handleSetAllSeoFields = useCallback(
    (value) => {
      dispatch({ type: 'SET_ALL_SEO_FIELDS', payload: value });
    },
    [dispatch]
  );

  const handleToggleImage = useCallback(
    (index) => {
      dispatch({ type: 'TOGGLE_IMAGE_SELECTION', payload: index });
    },
    [dispatch]
  );

  const handleSelectAllImages = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_IMAGES', payload: state.images.map((_, i) => i) });
  }, [state.images, dispatch]);

  const handleDeselectAllImages = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_IMAGES', payload: [] });
  }, [dispatch]);

  // Debounced rename preview
  useEffect(() => {
    if (state.step !== 2 || !state.baseName || !state.sessionId) {
      dispatch({ type: 'SET_RENAME_PREVIEW', payload: [] });
      return;
    }
    clearTimeout(previewTimeout.current);
    previewTimeout.current = setTimeout(async () => {
      try {
        const data = await getRenamePreview(state.sessionId, state.baseName);
        dispatch({ type: 'SET_RENAME_PREVIEW', payload: data.preview });
      } catch {
        dispatch({ type: 'SET_RENAME_PREVIEW', payload: [] });
      }
    }, 400);
    return () => clearTimeout(previewTimeout.current);
  }, [state.step, state.baseName, state.sessionId, dispatch]);

  // --- Step 3: Process Handler ---
  const handleProcess = useCallback(async () => {
    const totalImages = state.images.length;
    dispatch({ type: 'SET_PROCESSING', payload: true });
    setProcessingStatus({
      phase: 'renaming', totalImages, renamedCount: 0, injectedCount: 0, errors: [], errorMessage: null,
    });

    try {
      // Phase 1: Rename
      const renameData = await renameImages(state.sessionId, state.baseName);
      const selectedOriginals = new Set(
        state.selectedImages.map((i) => state.images[i]?.name).filter(Boolean)
      );
      const selectedFiles = renameData.results
        .filter((r) => selectedOriginals.has(r.original))
        .map((r) => r.renamed);
      const unselectedFiles = renameData.results
        .filter((r) => !selectedOriginals.has(r.original))
        .map((r) => r.renamed);

      const allErrors = [...renameData.errors];

      setProcessingStatus((prev) => ({
        ...prev,
        phase: 'injecting-selected',
        renamedCount: renameData.results.length,
      }));

      // Phase 2a: Inject selected images (custom SEO)
      const injectData = await injectKeywords(state.sessionId, state.keywords, state.seoSettings, selectedFiles);
      allErrors.push(...injectData.errors);
      let totalInjected = injectData.results.length;

      // Phase 2b: Inject unselected images (default keywords)
      let defaultInjectData = { results: [], errors: [] };
      if (unselectedFiles.length > 0) {
        setProcessingStatus((prev) => ({
          ...prev,
          phase: 'injecting-unselected',
          injectedCount: totalInjected,
        }));
        defaultInjectData = await injectKeywords(state.sessionId, state.keywords, null, unselectedFiles);
        allErrors.push(...defaultInjectData.errors);
        totalInjected += defaultInjectData.results.length;
      }

      // Phase 3: Done — store results
      dispatch({
        type: 'SET_RESULTS',
        payload: {
          renamed: renameData.results,
          injected: [...injectData.results, ...defaultInjectData.results],
          errors: allErrors,
        },
      });

      setProcessingStatus((prev) => ({
        ...prev,
        phase: 'done',
        injectedCount: totalInjected,
        errors: allErrors,
      }));
      dispatch({ type: 'SET_PROCESSING', payload: false });
    } catch (err) {
      setProcessingStatus((prev) => ({
        ...prev,
        phase: 'error',
        errorMessage: err.response?.data?.detail || 'Processing failed',
      }));
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.sessionId, state.baseName, state.keywords, state.seoSettings, state.selectedImages, state.images, dispatch]);

  const handleProcessingComplete = useCallback(() => {
    const hadError = processingStatus?.phase === 'error';
    setProcessingStatus(null);
    if (!hadError) {
      dispatch({ type: 'SET_STEP', payload: 4 });
      showToast('Optimization complete!');
    }
  }, [processingStatus, dispatch, showToast]);

  // --- Navigation ---
  const canGoToStep2 = state.images.length > 0 && state.keywords.length > 0;
  const canGoToStep3 = state.baseName.trim().length > 0;

  const handleNext = () => {
    if (state.step === 1 && canGoToStep2) dispatch({ type: 'SET_STEP', payload: 2 });
    if (state.step === 2 && canGoToStep3) dispatch({ type: 'SET_STEP', payload: 3 });
  };

  const handleBack = () => {
    if (state.step > 1) dispatch({ type: 'SET_STEP', payload: state.step - 1 });
  };

  const handleReset = () => dispatch({ type: 'RESET' });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header dark={dark} onToggleTheme={toggle} currentPage={currentPage} onNavigate={setCurrentPage} />

      {currentPage === 'app' && (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <StepIndicator currentStep={state.step} />

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
            {/* Step 1: Upload */}
            {state.step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Upload Your Images & Keywords
                </h2>
                <ImageDropzone onDrop={handleImageDrop} />
                <ImagePreviewGrid
                  files={state.images}
                  onRemove={handleRemoveImage}
                />
                <KeywordUploader
                  keywords={state.keywords}
                  onFileUpload={handleKeywordFile}
                  onTextSubmit={handleKeywordText}
                />
              </div>
            )}

            {/* Step 2: Configure */}
            {state.step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Configure SEO Settings
                </h2>
                <ImageSelector
                  images={state.images}
                  selectedImages={state.selectedImages}
                  onToggle={handleToggleImage}
                  onSelectAll={handleSelectAllImages}
                  onDeselectAll={handleDeselectAllImages}
                />
                <BaseNameInput
                  value={state.baseName}
                  onChange={handleBaseNameChange}
                />
                <RenamePreview preview={state.renamePreview} />
                <SeoMetadataSettings
                  settings={state.seoSettings}
                  onFieldChange={handleSeoFieldChange}
                  onSetAll={handleSetAllSeoFields}
                />
              </div>
            )}

            {/* Step 3: Process */}
            {state.step === 3 && (
              <div className="animate-fade-in">
                {processingStatus ? (
                  <ProcessingOverlay status={processingStatus} onComplete={handleProcessingComplete} />
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Ready to Optimize
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-orange-500">
                          {state.selectedImages.length} / {state.images.length}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Images Selected</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-orange-500">
                          {state.keywords.length}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Keywords</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-orange-500 truncate">
                          {state.baseName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Base Name
                        </p>
                      </div>
                    </div>
                    <ProcessButton
                      onClick={handleProcess}
                      processing={state.processing}
                    />
                  </>
                )}
              </div>
            )}

            {/* Step 4: Results */}
            {state.step === 4 && (
              <div>
                <ResultsSummary results={state.results} />
                <DownloadButton
                  sessionId={state.sessionId}
                  onReset={handleReset}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            {state.step < 4 && !processingStatus && (
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleBack}
                  disabled={state.step === 1}
                  className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Back
                </button>
                {state.step < 3 && (
                  <button
                    onClick={handleNext}
                    disabled={
                      (state.step === 1 && !canGoToStep2) ||
                      (state.step === 2 && !canGoToStep3)
                    }
                    className="px-6 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {currentPage === 'howto' && (
        <HowToUsePage onBackToApp={() => setCurrentPage('app')} />
      )}

      {currentPage === 'metadata' && (
        <MetadataCheckerPage />
      )}

      {currentPage === 'scraper' && (
        <ImageScraperPage />
      )}

      {currentPage === 'converter' && (
        <ImageConverterPage />
      )}

      <Footer />

      {state.toast && (
        <Toast
          message={state.toast.message}
          type={state.toast.type}
          onClose={() => dispatch({ type: 'HIDE_TOAST' })}
        />
      )}
    </div>
  );
}
