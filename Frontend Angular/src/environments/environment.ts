declare global {
  interface Window {
    API_BASE_URL?: string;
  }
}

export const environment = {
  apiBaseUrl: window.API_BASE_URL || 'https://localhost:7201'
};
