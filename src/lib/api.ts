const defaultBaseUrl = "http://localhost:3001";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || defaultBaseUrl;

export const apiUrl = (path: string) => {
  if (!path) {
    return API_BASE_URL;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
