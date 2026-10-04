const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'https://ecommerce.routemisr.com/api/v1').replace(/\/$/, '');

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('token', token);

  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not connect to the shop. Check your internet connection and try again.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok || result?.status === 'error') {
    const error = new Error(result?.message || result?.errors?.msg || `Shop request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return result;
}

export const jsonBody = (value) => JSON.stringify(value);
