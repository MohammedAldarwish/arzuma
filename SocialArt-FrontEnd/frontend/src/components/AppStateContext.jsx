import React, { createContext, useContext, useReducer, useEffect } from "react";

// App state actions
const APP_ACTIONS = {
  SET_SCROLL_POSITION: "SET_SCROLL_POSITION",
  SET_ACTIVE_TAB: "SET_ACTIVE_TAB",
  SET_UI_STATE: "SET_UI_STATE",
  SET_USER_PREFERENCES: "SET_USER_PREFERENCES",
  RESTORE_STATE: "RESTORE_STATE",
  CLEAR_STATE: "CLEAR_STATE",
};

// Initial state
const initialState = {
  scrollPositions: {}, // Store scroll positions for different routes
  activeTabs: {}, // Store active tabs for different components
  uiState: {
    sidebarOpen: false,
    searchOpen: false,
    notificationsOpen: false,
    lastVisitedRoute: "/",
  },
  userPreferences: {
    autoSave: true,
    showAnimations: true,
    compactMode: false,
    language: "en",
  },
};

// App state reducer
const appStateReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_SCROLL_POSITION:
      return {
        ...state,
        scrollPositions: {
          ...state.scrollPositions,
          [action.payload.route]: action.payload.position,
        },
      };

    case APP_ACTIONS.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTabs: {
          ...state.activeTabs,
          [action.payload.component]: action.payload.tab,
        },
      };

    case APP_ACTIONS.SET_UI_STATE:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          ...action.payload,
        },
      };

    case APP_ACTIONS.SET_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload,
        },
      };

    case APP_ACTIONS.RESTORE_STATE:
      return {
        ...state,
        ...action.payload,
      };

    case APP_ACTIONS.CLEAR_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create context
const AppStateContext = createContext();

// App state provider component
export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  // Save state to localStorage
  const saveState = (newState) => {
    try {
      localStorage.setItem("artconnect-app-state", JSON.stringify(newState));
    } catch (error) {
      console.warn("Failed to save app state to localStorage:", error);
    }
  };

  // Load state from localStorage
  const loadState = () => {
    try {
      const saved = localStorage.getItem("artconnect-app-state");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn("Failed to load app state from localStorage:", error);
      return null;
    }
  };

  // Initialize state on mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      dispatch({ type: APP_ACTIONS.RESTORE_STATE, payload: savedState });
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Save scroll position before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentRoute = window.location.pathname;
      const scrollPosition = window.scrollY;
      dispatch({
        type: APP_ACTIONS.SET_SCROLL_POSITION,
        payload: { route: currentRoute, position: scrollPosition },
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // App state functions
  const setScrollPosition = (route, position) => {
    dispatch({
      type: APP_ACTIONS.SET_SCROLL_POSITION,
      payload: { route, position },
    });
  };

  const getScrollPosition = (route) => {
    return state.scrollPositions[route] || 0;
  };

  const setActiveTab = (component, tab) => {
    dispatch({
      type: APP_ACTIONS.SET_ACTIVE_TAB,
      payload: { component, tab },
    });
  };

  const getActiveTab = (component) => {
    return state.activeTabs[component] || null;
  };

  const setUIState = (uiState) => {
    dispatch({
      type: APP_ACTIONS.SET_UI_STATE,
      payload: uiState,
    });
  };

  const setUserPreferences = (preferences) => {
    dispatch({
      type: APP_ACTIONS.SET_USER_PREFERENCES,
      payload: preferences,
    });
  };

  const clearState = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_STATE });
  };

  // Context value
  const value = {
    // State
    scrollPositions: state.scrollPositions,
    activeTabs: state.activeTabs,
    uiState: state.uiState,
    userPreferences: state.userPreferences,

    // Actions
    setScrollPosition,
    getScrollPosition,
    setActiveTab,
    getActiveTab,
    setUIState,
    setUserPreferences,
    clearState,

    // Constants
    APP_ACTIONS,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to use app state context
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

export default AppStateContext;
