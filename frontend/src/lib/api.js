const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiFetch(path, options = {}) {
  let parsedRole = "customer";
  try {
    const role = localStorage.getItem("auth-role-storage");
    parsedRole = role ? JSON.parse(role)?.state?.role || "customer" : "customer";
  } catch {
    parsedRole = "customer";
  }
  const isFormDataBody = options.body instanceof FormData;
  const baseHeaders = {
    "x-user-role": parsedRole || "customer",
    ...(options.headers || {}),
  };
  if (!isFormDataBody && !baseHeaders["Content-Type"]) {
    baseHeaders["Content-Type"] = "application/json";
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: baseHeaders,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}
