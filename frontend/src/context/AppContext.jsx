import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

const defaultSeoField = { enabled: true, mode: 'keywords', customValue: '' };

const initialState = {
  sessionId: null,
  step: 1,
  images: [],
  keywords: [],
  baseName: '',
  renamePreview: [],
  processing: false,
  results: {
    renamed: [],
    injected: [],
    errors: [],
  },
  toast: null,
  selectedImages: [],
  seoSettings: {
    title: { ...defaultSeoField },
    subject: { ...defaultSeoField },
    tags: { ...defaultSeoField },
    comments: { ...defaultSeoField },
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, sessionId: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_IMAGES':
      return {
        ...state,
        images: action.payload,
        selectedImages: action.payload.map((_, i) => i),
      };
    case 'ADD_IMAGES': {
      const newImages = [...state.images, ...action.payload];
      return {
        ...state,
        images: newImages,
        selectedImages: newImages.map((_, i) => i),
      };
    }
    case 'SET_KEYWORDS':
      return { ...state, keywords: action.payload };
    case 'SET_BASE_NAME':
      return { ...state, baseName: action.payload };
    case 'SET_RENAME_PREVIEW':
      return { ...state, renamePreview: action.payload };
    case 'SET_PROCESSING':
      return { ...state, processing: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'TOGGLE_IMAGE_SELECTION': {
      const idx = action.payload;
      const sel = state.selectedImages.includes(idx)
        ? state.selectedImages.filter((i) => i !== idx)
        : [...state.selectedImages, idx];
      return { ...state, selectedImages: sel };
    }
    case 'SET_SELECTED_IMAGES':
      return { ...state, selectedImages: action.payload };
    case 'SET_SEO_FIELD':
      return {
        ...state,
        seoSettings: {
          ...state.seoSettings,
          [action.payload.field]: {
            ...state.seoSettings[action.payload.field],
            ...action.payload.value,
          },
        },
      };
    case 'SET_ALL_SEO_FIELDS': {
      const updated = {};
      for (const key of Object.keys(state.seoSettings)) {
        updated[key] = { ...state.seoSettings[key], ...action.payload };
      }
      return { ...state, seoSettings: updated };
    }
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (!context) throw new Error('useAppDispatch must be used within AppProvider');
  return context;
}
