/**
 * Error handling utilities for the app
 */

// Error codes enum for different failure types
export const ErrorCode = {
  AUTH_ERROR: 0,
  FIRESTORE_ERROR: 1,
  VALIDATION_ERROR: 2,
  NETWORK_ERROR: 3,
  PERMISSION_ERROR: 4,
  UNKNOWN_ERROR: 5
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

// User-friendly error message mapping
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_ERROR]: 'Authentication failed. Please try again.',
  [ErrorCode.FIRESTORE_ERROR]: 'Failed to save data. Please check your connection and try again.',
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ErrorCode.PERMISSION_ERROR]: 'You don\'t have permission to perform this action.',
  [ErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again.'
};

// Firebase error code mapping
const FIREBASE_ERROR_MAP: Record<string, ErrorCode> = {
  'auth/user-not-found': ErrorCode.AUTH_ERROR,
  'auth/wrong-password': ErrorCode.AUTH_ERROR,
  'auth/email-already-in-use': ErrorCode.AUTH_ERROR,
  'auth/weak-password': ErrorCode.AUTH_ERROR,
  'auth/invalid-email': ErrorCode.AUTH_ERROR,
  'auth/user-disabled': ErrorCode.AUTH_ERROR,
  'auth/too-many-requests': ErrorCode.AUTH_ERROR,
  'auth/network-request-failed': ErrorCode.NETWORK_ERROR,
  'firestore/permission-denied': ErrorCode.PERMISSION_ERROR,
  'firestore/not-found': ErrorCode.FIRESTORE_ERROR,
  'firestore/already-exists': ErrorCode.FIRESTORE_ERROR,
  'firestore/resource-exhausted': ErrorCode.FIRESTORE_ERROR,
  'firestore/failed-precondition': ErrorCode.VALIDATION_ERROR,
  'firestore/aborted': ErrorCode.NETWORK_ERROR,
  'firestore/out-of-range': ErrorCode.VALIDATION_ERROR,
  'firestore/unimplemented': ErrorCode.UNKNOWN_ERROR,
  'firestore/internal': ErrorCode.UNKNOWN_ERROR,
  'firestore/unavailable': ErrorCode.NETWORK_ERROR,
  'firestore/data-loss': ErrorCode.UNKNOWN_ERROR,
  'firestore/unauthenticated': ErrorCode.AUTH_ERROR
};

// Determine error code from error object
export const getErrorCode = (error: any): ErrorCode => {
  if (!error) return ErrorCode.UNKNOWN_ERROR;
  
  // Check for Firebase error code
  if (error.code && FIREBASE_ERROR_MAP[error.code]) {
    return FIREBASE_ERROR_MAP[error.code];
  }
  
  // Check for network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return ErrorCode.NETWORK_ERROR;
  }
  
  // Check for auth errors
  if (error.name?.includes('Auth') || error.message?.includes('auth')) {
    return ErrorCode.AUTH_ERROR;
  }
  
  // Default to unknown error
  return ErrorCode.UNKNOWN_ERROR;
};

// Get user-friendly error message
export const getErrorMessage = (error: any): string => {
  const errorCode = getErrorCode(error);
  return ERROR_MESSAGES[errorCode];
};

// Error logger function for debugging
export const logError = (error: any, context?: string): void => {
  const timestamp = new Date().toISOString();
  const contextInfo = context ? `[${context}] ` : '';
  
  console.group(`${contextInfo}🚨 Error at ${timestamp}`);
  console.error('Error object:', error);
  console.error('Error code:', getErrorCode(error));
  console.error('Error message:', getErrorMessage(error));
  
  // Log stack trace for debugging
  if (error?.stack) {
    console.error('Stack trace:', error.stack);
  }
  
  console.groupEnd();
  
  // Here you could also send to external error tracking service
  // e.g., Sentry.captureException(error);
};

// Retry utility with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logError(error, `Retry attempt ${attempt}/${maxRetries}`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: baseDelay * 2^(attempt - 1)
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Check if error is retriable
export const isRetriableError = (error: any): boolean => {
  const errorCode = getErrorCode(error);
  const retriableCodes: ErrorCode[] = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.FIRESTORE_ERROR, // Some Firestore errors are retriable
    ErrorCode.UNKNOWN_ERROR   // Retry unknown errors
  ];
  return retriableCodes.includes(errorCode);
};