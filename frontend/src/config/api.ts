// Get the base URL from environment variable or use a default
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

// Helper function to build API URLs
export const buildApiUrl = (path: string): string => {
  // Ensure path starts with /api/
  const apiPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  return `${API_BASE_URL}${apiPath}`;
};

// Helper function to build file URLs (for PDFs, etc.)
export const buildFileUrl = (path: string, token?: string): string => {
  // Don't add /api/ prefix for file URLs
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return token ? `${url}?token=${token}` : url;
}; 