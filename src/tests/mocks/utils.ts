// Helper to construct full URLs for relative endpoints
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export const fullUrl = (endpoint: string) => {
  // Handle cases where endpoint might already be a full URL (like OAuth redirects)
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  // Ensure no double slashes
  return `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
};
