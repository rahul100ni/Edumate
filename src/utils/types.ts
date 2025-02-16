export interface SummarizerOptions {
    maxLength?: number;
    minLength?: number;
    numBeams?: number;
    temperature?: number;
    chunkSize?: number;
    maxRetries?: number;
    onProgress?: (progress: SummaryProgress) => void;
  }
  
  export interface SummaryProgress {
    status: string;
    progress: number;
    currentChunk: number;
    totalChunks: number;
  }
  
  export interface LoadingProgress {
    progress: number;
    status: string;
    detail?: string;
  }
  
  export interface SummarizerState {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    features: {
      simd: boolean;
      threads: boolean;
      gc: boolean;
    };
  }
  
  export interface ModelError extends Error {
    code: string;
    detail?: string;
  }
  
  export interface ChunkResult {
    success: boolean;
    summary?: string;
    error?: Error;
  }