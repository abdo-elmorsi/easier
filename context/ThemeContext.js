import { colorThemes } from 'assets';
import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

// Action types
const SET_THEME = 'SET_THEME';
const SET_THEME_COLOR = 'SET_THEME_COLOR';

const ThemeContext = createContext();

// Function to get initial theme settings (handles server-side rendering)
const getInitialTheme = () => {
	if (typeof window === 'undefined') return { theme: 'light', themeColor: 'blue' };
	return {
		theme: localStorage.getItem('theme') || 'light',
		themeColor: localStorage.getItem('theme_color') || 'blue',
	};
};

// Reducer function to manage theme state
const themeReducer = (state, action) => {
	switch (action.type) {
		case SET_THEME:
			return { ...state, theme: action.payload };
		case SET_THEME_COLOR:
			return { ...state, themeColor: action.payload };
		default:
			return state;
	}
};

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
	const [state, dispatch] = useReducer(themeReducer, getInitialTheme());

	// Apply theme changes to HTML class and localStorage
	useEffect(() => {
		document.documentElement.classList.toggle('dark', state.theme === 'dark');
		localStorage.setItem('theme', state.theme);
	}, [state.theme]);

	// Apply theme color changes to CSS variables
	useEffect(() => {
		localStorage.setItem('theme_color', state.themeColor);
		const theme = colorThemes[state.themeColor];
		if (theme) {
			document.documentElement.style.setProperty('--primary', theme.primary);
			document.documentElement.style.setProperty('--hoverPrimary', theme.hoverPrimary);
			document.documentElement.style.setProperty('--secondary', theme.secondary);
		}
	}, [state.themeColor]);

	// Toggle between 'light' and 'dark' themes
	const toggleTheme = () => {
		dispatch({ type: SET_THEME, payload: state.theme === 'light' ? 'dark' : 'light' });
	};

	// Set a specific theme color
	const setThemeColor = (color) => {
		dispatch({ type: SET_THEME_COLOR, payload: color });
	};

	// Memoized context value
	const contextValue = useMemo(
		() => ({
			theme: state.theme,
			toggleTheme,
			themeColor: state.themeColor,
			setThemeColor,
		}),
		[state.theme, state.themeColor]
	);

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);
