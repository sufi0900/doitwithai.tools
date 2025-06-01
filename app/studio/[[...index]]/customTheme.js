import { createTheme } from 'sanity';

export const customTheme = createTheme({
  name: 'custom-theme',
  color: {
    primary: { default: '#2d3748', dark: '#1a202c', light: '#e2e8f0' },
  },
  workspace: {
    padding: 0,
    maxWidth: '100%', // Make editor full-width
  },
});
