/**
 * API Error Handler Utility
 * Extracts human-friendly error messages from API responses
 */

/**
 * Extract error message from API error response
 * @param {Error|Response|Object} error - Error object from API call
 * @returns {string} Human-friendly error message
 */
export function extractErrorMessage(error) {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's a Response object (fetch error)
  if (error instanceof Response) {
    return 'Network error. Please check your connection.';
  }

  // If it's an Error object with message
  if (error instanceof Error) {
    // Check if error has response property (Axios-style)
    if (error.response) {
      return extractFromResponse(error.response);
    }
    return error.message || 'An unexpected error occurred.';
  }

  // If it's an object with message
  if (error && typeof error === 'object') {
    // Check for nested error objects (common in API responses)
    if (error.message) {
      return error.message;
    }
    if (error.error) {
      return typeof error.error === 'string' ? error.error : error.error.message || 'An error occurred.';
    }
    if (error.data) {
      if (typeof error.data === 'string') {
        return error.data;
      }
      if (error.data.message) {
        return error.data.message;
      }
      if (error.data.error) {
        return typeof error.data.error === 'string' ? error.data.error : error.data.error.message || 'An error occurred.';
      }
    }
    // Check for validation errors
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.map((e) => e.message || e).join(', ');
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extract error message from Response object
 * @param {Response} response - Fetch Response object
 * @returns {Promise<string>} Error message
 */
async function extractFromResponse(response) {
  try {
    const data = await response.json();
    if (data.message) {
      return data.message;
    }
    if (data.error) {
      return typeof data.error === 'string' ? data.error : data.error.message || 'An error occurred.';
    }
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map((e) => e.message || e).join(', ');
    }
  } catch (e) {
    // If JSON parsing fails, use status text
  }

  // Fallback to status text or default message
  if (response.status === 401) {
    return 'Unauthorized. Please login again.';
  }
  if (response.status === 403) {
    return 'Access denied. You do not have permission.';
  }
  if (response.status === 404) {
    return 'Resource not found.';
  }
  if (response.status === 422) {
    return 'Validation error. Please check your input.';
  }
  if (response.status >= 500) {
    return 'Server error. Please try again later.';
  }

  return response.statusText || 'An error occurred.';
}

/**
 * Handle API error and return formatted message
 * @param {Error|Response|Object} error - Error from API call
 * @param {Object} options - Options for error handling
 * @returns {string} Formatted error message
 */
export function handleApiError(error, options = {}) {
  const { defaultMessage = 'Something went wrong' } = options;
  const message = extractErrorMessage(error);
  return message || defaultMessage;
}


