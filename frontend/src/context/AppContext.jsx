import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

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
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, sessionId: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_IMAGES':
      return { ...state, images: action.payload };
    case 'ADD_IMAGES':
      return { ...state, images: [...state.images, ...action.payload] };
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
