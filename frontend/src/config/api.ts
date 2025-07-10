// Get the base URL from environment variable or use a default
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://tailorio.onrender.com'
  : 'http://localhost:5000';

// Helper function to build API URLs
export const buildApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}; 