import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, FileText, AlertCircle, Loader, Info } from 'lucide-react'
import { summarizeVideo, VideoSummaryProgress } from '../utils/videoSummarizer'

const VideoSummarizerPage: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<VideoSummaryProgress | null>(null)
  const [result, setResult] = useState<{ transcription: string; summary: string } | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!videoUrl) return

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const result = await summarizeVideo(videoUrl, {
        onProgress: (progress) => {
          setProgress(progress)
        }
      })
      setResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video')
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-indigo-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Video Summarizer
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg flex items-start"
          >
            <Info className="text-blue-500 mr-2 flex-shrink-0 mt-1" />
            <div className="text-blue-800 dark:text-blue-200 text-sm">
              <p className="mb-2">
                This tool uses AI to transcribe and summarize YouTube videos.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Works with YouTube video links</li>
                <li>Transcribes audio to text</li>
                <li>Generates concise summaries</li>
                <li>Preserves key information</li>
              </ul>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video URL
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="video-url"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isProcessing || !videoUrl}
              className={`w-full px-4 py-2 rounded-lg flex items-center justify-center ${
                isProcessing || !videoUrl
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white transition-colors duration-300`}
            >
              {isProcessing ? 'Processing Video...' : 'Process Video'}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900 rounded-lg flex items-center"
              >
                <AlertCircle className="text-red-500 mr-2" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isProcessing && progress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Loader className="animate-spin text-indigo-600 dark:text-indigo-400 mr-2" />
                    <span className="text-indigo-700 dark:text-indigo-300">
                      {progress.status}
                    </span>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {Math.round(progress.progress)}%
                  </span>
                </div>
                <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{result.summary}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Transcription</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{result.transcription}</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default VideoSummarizerPage