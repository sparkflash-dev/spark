/**
 * Theme constants and helpers for Spark UI.
 * Centralizes design tokens for consistent styling.
 */

export const colors = {
	primary: '#2297de',
	primaryHover: '#1a7ab8',
	primaryActive: '#15648f',
	success: '#1ac135',
	successHover: '#15a02c',
	warning: '#fca321',
	warningHover: '#e08c15',
	danger: '#ff4444',
	dangerHover: '#d63636',
	background: {
		dark: '#2f3033',
		medium: '#3a3c41',
		light: '#4a4c52',
		panel: '#383a3f',
	},
	text: {
		primary: '#ffffff',
		secondary: '#b3b3b3',
		muted: '#787878',
		disabled: '#555555',
	},
	border: {
		subtle: 'rgba(255, 255, 255, 0.1)',
		medium: 'rgba(255, 255, 255, 0.2)',
	},
};

export const spacing = {
	xs: '4px',
	sm: '8px',
	md: '16px',
	lg: '24px',
	xl: '32px',
	xxl: '48px',
};

export const borderRadius = {
	sm: '4px',
	md: '8px',
	lg: '12px',
	round: '50%',
};

export const typography = {
	fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	fontSize: {
		xs: '11px',
		sm: '12px',
		md: '14px',
		lg: '16px',
		xl: '20px',
		xxl: '28px',
	},
	fontWeight: {
		normal: 400,
		medium: 500,
		bold: 700,
	},
};

export const transitions = {
	fast: '150ms ease',
	normal: '250ms ease',
	slow: '400ms ease',
};

export const shadows = {
	sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
	md: '0 4px 12px rgba(0, 0, 0, 0.4)',
	lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
};
