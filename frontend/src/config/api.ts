// Get the base URL from environment variable or use a default
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to build API URLs
export const buildApiUrl = (path: string): string => {
  // Remove any leading slashes from the path
  const cleanPath = path.replace(/^\/+/, '');
  // Ensure we have a single /api/ prefix
  const apiPath = cleanPath.startsWith('api/') ? cleanPath : `api/${cleanPath}`;
  return `/${apiPath}`;
};

// Helper function to build file URLs (for PDFs, etc.)
export const buildFileUrl = (path: string, token?: string): string => {
  // Remove any leading slashes from the path
  const cleanPath = path.replace(/^\/+/, '');
  const url = `/${cleanPath}`;
  return token ? `${url}?token=${token}` : url;
}; 