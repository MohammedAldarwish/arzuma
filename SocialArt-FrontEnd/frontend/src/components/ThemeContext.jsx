import React, { createContext, useContext, useReducer, useEffect } from "react";

// Theme modes
const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

// Theme actions
const THEME_ACTIONS = {
  SET_THEME: "SET_THEME",
  TOGGLE_THEME: "TOGGLE_THEME",
  SET_SYSTEM_THEME: "SET_SYSTEM_THEME",
};

// Initial state
const initialState = {
  mode: THEME_MODES.DARK, // Current theme mode (light, dark, auto)
  theme: THEME_MODES.DARK, // Actual theme being applied (light or dark)
  systemTheme: THEME_MODES.LIGHT, // System preference
};

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      const newMode = action.payload;
      let newTheme;

      if (newMode === THEME_MODES.AUTO) {
        newTheme = state.systemTheme;
      } else {
        newTheme = newMode;
      }

      return {
        ...state,
        mode: newMode,
        theme: newTheme,
      };

    case THEME_ACTIONS.SET_SYSTEM_THEME:
      const systemTheme = action.payload;
      let appliedTheme = state.theme;

      // If in auto mode, update the applied theme to match system
      if (state.mode === THEME_MODES.AUTO) {
        appliedTheme = systemTheme;
      }

      return {
        ...state,
        systemTheme,
        theme: appliedTheme,
      };

    case THEME_ACTIONS.TOGGLE_THEME:
      const toggledMode =
        state.mode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
      return {
        ...state,
        mode: toggledMode,
        theme: toggledMode,
      };

    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Get saved theme from localStorage or default to dark
  const getSavedTheme = () => {
    try {
      const saved = localStorage.getItem("artconnect-theme");
      return saved && Object.values(THEME_MODES).includes(saved)
        ? saved
        : THEME_MODES.DARK;
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
      return THEME_MODES.DARK;
    }
  };

  // Save theme to localStorage
  const saveTheme = (mode) => {
    try {
      localStorage.setItem("artconnect-theme", mode);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  };

  // Detect system theme preference
  const getSystemTheme = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? THEME_MODES.DARK
        : THEME_MODES.LIGHT;
    }
    return THEME_MODES.DARK;
  };

  // Apply theme to document
  const applyTheme = (theme) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (theme === THEME_MODES.DARK) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedMode = getSavedTheme();
    const systemTheme = getSystemTheme();

    // Set system theme first
    dispatch({ type: THEME_ACTIONS.SET_SYSTEM_THEME, payload: systemTheme });

    // Then set the saved mode
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: savedMode });
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(state.theme);
  }, [state.theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e) => {
        const newSystemTheme = e.matches ? THEME_MODES.DARK : THEME_MODES.LIGHT;
        dispatch({
          type: THEME_ACTIONS.SET_SYSTEM_THEME,
          payload: newSystemTheme,
        });
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Theme functions
  const setTheme = (mode) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: mode });
    saveTheme(mode);
  };

  const toggleTheme = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME });
    // Save the new mode
    const newMode =
      state.mode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    saveTheme(newMode);
  };

  // Context value
  const value = {
    // State
    mode: state.mode,
    theme: state.theme,
    systemTheme: state.systemTheme,
    isDark: state.theme === THEME_MODES.DARK,
    isLight: state.theme === THEME_MODES.LIGHT,
    isAuto: state.mode === THEME_MODES.AUTO,

    // Actions
    setTheme,
    toggleTheme,

    // Constants
    THEME_MODES,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
