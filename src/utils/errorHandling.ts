// utils/errorHandling.ts
import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

interface ErrorResponse {
  success: false;
  error?: string;
  code?: string;
  status?: number;
}

export function isErrorResponse(response: any): response is ErrorResponse {
  return response && response.success === false;
}

type ErrorHandler = {
  onError: (error: Error | ErrorResponse) => void;
  onFinally?: () => void;
};

export function createErrorHandler(operation: string): ErrorHandler {
  return {
    onError: (error: Error | ErrorResponse) => {
      console.error(`${operation} error:`, error);

      if (isErrorResponse(error)) {
        // Handle API error responses
        toast.error(`${operation} failed`, {
          description: error.error || 'An unexpected error occurred',
        });
      } else if (error instanceof AppError) {
        // Handle custom application errors
        toast.error(`${operation} failed`, {
          description: error.message,
        });
      } else if (error instanceof Error) {
        // Handle standard errors
        toast.error(`${operation} failed`, {
          description: error.message,
        });
      } else {
        // Handle unknown errors
        toast.error(`${operation} failed`, {
          description: 'An unknown error occurred',
        });
      }
    },
    onFinally: () => {
      // Default cleanup if needed
    }
  };
}

export async function handleApiRequest<T>(
  operation: string,
  apiCall: () => Promise<T>,
  {
    onSuccess,
    onSetLoading,
  }: {
    onSuccess: (data: T) => void;
    onSetLoading: (isLoading: boolean) => void;
  }
) {
  const errorHandler = createErrorHandler(operation);
  
  try {
    onSetLoading(true);
    const response = await apiCall();
    
    if (isErrorResponse(response)) {
      throw response;
    }
    
    onSuccess(response);
  } catch (error) {
    errorHandler.onError(error as Error | ErrorResponse);
    throw error; // Re-throw to allow caller to handle if needed
  } finally {
    onSetLoading(false);
  }
}