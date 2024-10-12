import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Copy, X, AlertCircle } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { HfInference } from '@huggingface/inference'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const hf = new HfInference('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')

const PdfSummarizerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please upload a PDF file.')
        setFile(null)
      }
    }
  }

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
        setError('')
      } else {
        setError('Please upload a PDF file.')
      }
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const extractTextFromPdf = async (file: File) => {
    const reader = new FileReader()
    return new Promise<string>((resolve, reject) => {
      reader.onload = async (event) => {
        if (event.target) {
          try {
            const typedArray = new Uint8Array(event.target.result as ArrayBuffer)
            const pdf = await pdfjsLib.getDocument(typedArray).promise
            let fullText = ''
            for (let i = 1; i <= pdf.numPages; i++) {
              setStatusMessage(`Extracting text from page ${i} of ${pdf.numPages}`)
              const page = await pdf.getPage(i)
              const content = await page.getTextContent()
              const pageText = content.items.map((item: any) => item.str).join(' ')
              fullText += pageText + '\n'
              setProgress((i / pdf.numPages) * 50) // First 50% for extraction
            }
            console.log('Extracted Text Length:', fullText.length)  // Log extracted text length
            resolve(fullText)
          } catch (error) {
            console.error('Error extracting text from PDF:', error)
            reject(new Error('Failed to extract text from PDF. Please try again.'))
          }
        }
      }
      reader.onerror = () => reject(new Error('Failed to read the PDF file. Please try again.'))
      reader.readAsArrayBuffer(file)
    })
  }

  const summarizeText = async (text: string) => {
    try {
      setStatusMessage('Summarizing extracted text')
      console.log('Sending text to summarization API. Text length:', text.length)
      const result = await hf.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: text,
        parameters: {
          max_length: 150,
          min_length: 30,
        },
      })
      console.log('Summarization API response:', result)
      return result.summary_text
    } catch (error) {
      console.error('Error during summarization:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to summarize the text: ${error.message}`)
      } else {
        throw new Error('Failed to summarize the text. Please try again.')
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setSummary('')
    setError('')
    setStatusMessage('Starting PDF processing')

    try {
      const extractedText = await extractTextFromPdf(file)
      if (extractedText) {
        setProgress(50) // Extraction complete
        setStatusMessage('Text extraction complete. Starting summarization...')
        const summarizedText = await summarizeText(extractedText)
        setSummary(summarizedText)
        setProgress(100)
        setStatusMessage('Summarization complete!')
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    // Optionally, show a notification that the text was copied
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">PDF Summarizer</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <div 
          className="flex items-center justify-center w-full"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <label 
            htmlFor="dropzone-file" 
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 10MB)</p>
            </div>
            <input 
              id="dropzone-file" 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              accept=".pdf" 
              ref={fileInputRef}
            />
          </label>
        </div>
        {file && (
          <div className="mt-4 flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              <span className="text-sm text-gray-500 dark:text-gray-300">{file.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-300"
          disabled={!file || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Summarize PDF'}
        </button>
      </form>
      {isProcessing && (
        <div className="mb-6">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-indigo-600">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
              <motion.div 
                style={{ width: `${progress}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{statusMessage}</p>
        </div>
      )}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-6 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{summary}</p>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300 flex items-center"
            >
              <Copy size={20} className="mr-2" /> Copy to Clipboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PdfSummarizerPage