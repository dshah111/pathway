const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

const getDefaultBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
};

export const API_BASE_URL = envBaseUrl || getDefaultBaseUrl();

export const apiUrl = (path: string) => {
  if (!path) {
    return API_BASE_URL;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
};
