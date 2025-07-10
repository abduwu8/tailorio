// Get the base URL from environment variable or use a default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://tailorio.onrender.com' : 'http://localhost:5000'); // Empty string means same-origin in production

// Helper function to build API URLs
export const buildApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

// Helper function to build file URLs (for PDFs, etc.)
export const buildFileUrl = (path: string, token?: string): string => {
  const url = buildApiUrl(path);
  return token ? `${url}?token=${token}` : url;
}; 