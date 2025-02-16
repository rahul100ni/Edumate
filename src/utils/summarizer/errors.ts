export class ModelError extends Error {
    constructor(
      message: string,
      public code: string,
      public detail?: string
    ) {
      super(message);
      this.name = 'ModelError';
    }
  }
  
  export const ErrorCodes = {
    WASM_NOT_SUPPORTED: 'WASM_NOT_SUPPORTED',
    MODEL_LOAD_FAILED: 'MODEL_LOAD_FAILED',
    INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
    MEMORY_ERROR: 'MEMORY_ERROR',
    INFERENCE_ERROR: 'INFERENCE_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    CHUNK_PROCESSING_ERROR: 'CHUNK_PROCESSING_ERROR'
  } as const;
  
  export function getErrorMessage(code: string, detail?: string): string {
    const messages: Record<string, string> = {
      [ErrorCodes.WASM_NOT_SUPPORTED]: 
        'WebAssembly is not supported in your browser. Please try a modern browser like Chrome, Firefox, or Edge.',
      
      [ErrorCodes.MODEL_LOAD_FAILED]:
        'Failed to load the model. This could be due to network issues or insufficient memory.',
      
      [ErrorCodes.INITIALIZATION_FAILED]:
        'Failed to initialize the model. Please try refreshing the page.',
      
      [ErrorCodes.MEMORY_ERROR]:
        'Insufficient memory to process the request. The text will be processed in smaller chunks.',
      
      [ErrorCodes.INFERENCE_ERROR]:
        'An error occurred while processing the text. Please try again with a smaller input.',
      
      [ErrorCodes.INVALID_INPUT]:
        'The input text is invalid or too long to process.',
      
      [ErrorCodes.CHUNK_PROCESSING_ERROR]:
        'Error processing text chunk. Attempting to continue with remaining text.'
    };
  
    const baseMessage = messages[code] || 'An unexpected error occurred';
    return detail ? `${baseMessage} (${detail})` : baseMessage;
  }