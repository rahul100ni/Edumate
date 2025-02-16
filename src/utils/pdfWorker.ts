import { GlobalWorkerOptions } from 'pdfjs-dist';

// Configure the worker
export function setupPDFWorker() {
  if (typeof window !== 'undefined') {
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
}