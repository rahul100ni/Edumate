import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertCircle, Loader, X } from 'lucide-react';
import { getDocument } from 'pdfjs-dist';
import { setupPDFWorker } from '../utils/pdfWorker';

// Setup PDF.js worker
setupPDFWorker();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PAGES = 50;

interface ProcessingState {
  currentPage: number;
  totalPages: number;
}

interface PDFProcessorProps {
  onError?: (error: string) => void;
  onPDFContent?: (content: string, pageMap: Map<number, string>) => void;
  onMetadata?: (metadata: any) => void;
  mode?: 'summarize' | 'chat' | 'quiz';
}

const PDFProcessor: React.FC<PDFProcessorProps> = ({ onError, onPDFContent, onMetadata, mode = 'summarize' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageContentMap, setPageContentMap] = useState<Map<number, string>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [lastGeneratedSummary, setLastGeneratedSummary] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`;
    }
    if (!file.type.includes('pdf')) {
      return 'Only PDF files are supported';
    }
    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      if (onError) onError(validationError);
      setFile(null);
      return;
    }

    // Store PDF metadata in localStorage
    localStorage.setItem('pdfMetadata', JSON.stringify({
      filename: selectedFile.name
    }));

    setFile(selectedFile);
    setError(null);
    setExtractedText('');
    setShowUploadZone(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const validationError = validateFile(droppedFile);
    if (validationError) {
      setError(validationError);
      if (onError) onError(validationError);
      setFile(null);
      return;
    }

    // Store PDF metadata in localStorage
    localStorage.setItem('pdfMetadata', JSON.stringify({
      filename: droppedFile.name
    }));

    setFile(droppedFile);
    setError(null);
    setExtractedText('');
    setShowUploadZone(false);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setExtractedText('');
    setShowUploadZone(false);
    setLastGeneratedSummary(null);
    localStorage.removeItem('pdfMetadata');
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setError(null);

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: true,
        useSystemFonts: true
      }).promise;

      if (pdf.numPages > MAX_PAGES) {
        const errorMessage = `Maximum ${MAX_PAGES} pages allowed. Your PDF has ${pdf.numPages} pages.`;
        clearFile();
        setError(errorMessage);
        if (onError) onError(errorMessage);
        setIsProcessing(false);
        setProcessingState(null);
        return;
      }


      // Extract metadata
      try {
        if (onMetadata) {
          const metadata = await pdf.getMetadata();
          onMetadata({
            title: metadata?.info?.Title || null,
            author: metadata?.info?.Author || null,
            pages: pdf.numPages,
            keywords: metadata?.info?.Keywords ? 
              metadata.info.Keywords.split(',').map((k: string) => k.trim()) : []
          });
        }
      } catch (metaError) {
        console.warn('Failed to extract metadata:', metaError);
      }

      let fullText = '';
      const newPageMap = new Map<number, string>();

      for (let i = 1; i <= pdf.numPages; i++) {
        setProcessingState({
          currentPage: i,
          totalPages: pdf.numPages
        });

        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str.trim())
          .join(' ');
        
        // Store page content in the map
        newPageMap.set(i, pageText);
        fullText += pageText + '\n';
      }
      
      // Update page content map
      setPageContentMap(newPageMap);
      if (onPDFContent) onPDFContent(fullText.trim(), newPageMap);

      setExtractedText(fullText.trim());
    } catch (error) {
      console.error('Error processing PDF:', error);
      let errorMessage = 'Failed to process PDF';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingState(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (file) {
      extractTextFromPDF(file);
    }
  };

  return (
    <div className="w-full">
      {(!file || showUploadZone || error) && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <FileText className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop your PDF here
            </p>
            {mode === 'quiz' ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Upload a PDF to generate quiz questions
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                or click to browse
              </p>
            )}
            <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              Max {MAX_FILE_SIZE / 1024 / 1024}MB
            </p>
            <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 dark:text-gray-500">
              {isDragging ? (
                'Release to upload'
              ) : 'Supported format: PDF'}
            </p>
          </label>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-4 ${(!file || error) ? 'mt-4' : ''}`}>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900 rounded-lg flex items-center"
          >
            <AlertCircle className="text-red-500 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </motion.div>
        )}

        {file && !error && !showUploadZone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <FileText className="text-gray-500 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
            </div>
            <button
              onClick={clearFile}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
        {file && !extractedText && !error && !showUploadZone && (
          <button
            type="submit"
            disabled={!file || isProcessing}
            className={`w-full px-4 py-3 rounded-lg flex items-center justify-center ${
              !file || isProcessing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white transition-colors duration-300`}
          >
            {isProcessing ? 'Processing PDF...' : 'Process PDF'}
            {mode === 'quiz' && !isProcessing && ' for Quiz'}
          </button>
        )}
      </form>

      <AnimatePresence>
        {isProcessing && processingState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg space-y-2 border border-indigo-100 dark:border-indigo-800/30"
          >
            <div className="flex items-center justify-between text-sm text-indigo-700 dark:text-indigo-300">
              <span>Processing page {processingState.currentPage} of {processingState.totalPages}</span>
              <span>{Math.round((processingState.currentPage / processingState.totalPages) * 100)}%</span>
            </div>
            <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(processingState.currentPage / processingState.totalPages) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFProcessor;