/**
 * Centralized error handler and message formatter.
 * Translates HTTP status codes and API responses into actionable user-friendly messages.
 */

export function mapApiError(error) {
  // If not an Axios error or undefined
  if (!error) {
    return {
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
      fieldErrors: {},
      status: 0,
      isNetworkError: false,
    };
  }

  // Network / Connection Error (Backend unreachable)
  if (!error.response) {
    const isNetwork = error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
    return {
      title: 'Backend Unreachable',
      message: isNetwork
        ? 'Could not connect to the backend server at http://localhost:5000. Note: localhost does not work across different computers or devices. Please ensure the backend is running and CORS is configured with CLIENT_URL=http://localhost:5173.'
        : error.message || 'Unable to communicate with the server.',
      fieldErrors: {},
      status: 0,
      isNetworkError: true,
    };
  }

  const { status, data } = error.response;
  let title = 'Error';
  let message = data?.message || data?.error || 'An error occurred while processing your request.';
  const fieldErrors = {};

  switch (status) {
    case 400:
      title = 'Validation Error';
      // Extract field-level errors if provided by Express / Mongoose / Joi / Zod
      if (data?.errors && typeof data.errors === 'object') {
        if (Array.isArray(data.errors)) {
          // Format: [{ field: 'email', message: 'Invalid email' }]
          data.errors.forEach((err) => {
            const field = err.field || err.path || err.param;
            if (field) fieldErrors[field] = err.message || err.msg;
          });
          message = data.errors.map((e) => e.message || e.msg).join('. ') || message;
        } else {
          // Format: { email: 'Invalid email', password: 'Too short' }
          Object.assign(fieldErrors, data.errors);
        }
      }
      break;

    case 401:
      title = 'Session Expired';
      message = data?.message || 'Your session has expired or you are not authenticated. Please log in again.';
      break;

    case 403:
      title = 'Access Denied';
      message = data?.message || 'You do not have permission to perform this action or view this resource.';
      break;

    case 404:
      title = 'Not Found';
      message = data?.message || 'The requested resource was not found on the server.';
      break;

    case 413:
      title = 'File Too Large';
      message = data?.message || 'The uploaded file exceeds the maximum allowed size limit.';
      break;

    case 415:
      title = 'Unsupported File Type';
      message = data?.message || 'The uploaded file format is not supported. Please upload a PDF or DOCX file.';
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      title = 'Server Error';
      message = 'An unexpected server error occurred. Our team has been notified. Please try again shortly.';
      break;

    default:
      title = `Error (${status})`;
      break;
  }

  return {
    title,
    message,
    fieldErrors,
    status,
    isNetworkError: false,
    raw: data,
  };
}
