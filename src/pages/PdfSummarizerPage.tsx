import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, AlertCircle, Info, Settings2, Sparkles, FileSearch, BookOpen, List, AlignLeft, Wand2, X } from 'lucide-react'
import PDFProcessor from '../components/PDFProcessor'
import Summarizer from '../components/Summarizer'

interface SummarySettings {
  length: 'short' | 'medium' | 'detailed'
  tone: 'academic' | 'simple' | 'creative'
  format: 'bullets' | 'paragraphs'
  highlightKeyPoints: boolean
  preserveStructure: boolean
  extractDefinitions: boolean
}

const PdfSummarizerPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [summarySettings, setSummarySettings] = useState<SummarySettings>({
    length: 'medium',
    tone: 'simple',
    format: 'paragraphs',
    highlightKeyPoints: true,
    preserveStructure: true,
    extractDefinitions: true
  })
  const [showSettings, setShowSettings] = useState(false)
  const [pdfContent, setPdfContent] = useState<string>('')
  const [viewMode, setViewMode] = useState<'split' | 'single'>('single')
  const [lastGeneratedSummary, setLastGeneratedSummary] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<{
    title?: string
    author?: string
    pages?: number
    keywords?: string[]
  } | null>(null)

  const handleError = (error: string) => {
    setError(error)
  }

  const handleMetadata = (meta: any) => {
    setMetadata(meta)
  }
  
  const handlePDFContent = (content: string) => {
    setPdfContent(content)
  }

  const renderSettingsPanel = () => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl p-6 z-50"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Summary Settings</h3>
        <button
          onClick={() => setShowSettings(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['short', 'medium', 'detailed'].map((length) => (
              <button
                key={length}
                onClick={() => setSummarySettings(prev => ({ ...prev, length: length as any }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  summarySettings.length === length
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {length.charAt(0).toUpperCase() + length.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tone
          </label>
          <div className="space-y-2">
            {[
              { value: 'academic', label: 'Academic', icon: BookOpen },
              { value: 'simple', label: 'Simple', icon: FileText },
              { value: 'creative', label: 'Creative', icon: Sparkles }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSummarySettings(prev => ({ ...prev, tone: value as any }))}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                  summarySettings.tone === value
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSummarySettings(prev => ({ ...prev, format: 'bullets' }))}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                summarySettings.format === 'bullets'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <List size={18} className="mr-2" />
              Bullets
            </button>
            <button
              onClick={() => setSummarySettings(prev => ({ ...prev, format: 'paragraphs' }))}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                summarySettings.format === 'paragraphs'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <AlignLeft size={18} className="mr-2" />
              Paragraphs
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preserve Document Structure
            </span>
            <button
              onClick={() => setSummarySettings(prev => ({ 
                ...prev, 
                preserveStructure: !prev.preserveStructure 
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                summarySettings.preserveStructure
                  ? 'bg-indigo-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  summarySettings.preserveStructure ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Extract Definitions
            </span>
            <button
              onClick={() => setSummarySettings(prev => ({ 
                ...prev, 
                extractDefinitions: !prev.extractDefinitions 
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                summarySettings.extractDefinitions
                  ? 'bg-indigo-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  summarySettings.extractDefinitions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Highlight Key Points
          </span>
          <button
            onClick={() => setSummarySettings(prev => ({ 
              ...prev, 
              highlightKeyPoints: !prev.highlightKeyPoints 
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              summarySettings.highlightKeyPoints
                ? 'bg-indigo-600'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                summarySettings.highlightKeyPoints ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-[1600px] mx-auto"
        >
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg mr-3">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  AI PDF Summarizer
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transform your documents into clear, concise summaries
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200 flex items-center gap-2"
            >
              <Settings2 size={24} />
              <span>Settings</span>
            </button>
          </div>

          {metadata && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metadata.title && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {metadata.title}
                    </p>
                  </div>
                )}
                {metadata.author && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {metadata.author}
                    </p>
                  </div>
                )}
                {metadata.pages && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pages</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {metadata.pages}
                    </p>
                  </div>
                )}
                {metadata.keywords && metadata.keywords.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {metadata.keywords.slice(0, 3).map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                        >
                          {keyword}
                        </span>
                      ))}
                      {metadata.keywords.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{metadata.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/30 backdrop-blur-sm"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FileSearch className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Advanced AI-Powered PDF Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Transform lengthy documents into clear, actionable insights with our advanced AI summarization technology.
              </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: FileText, text: "Up to 10MB PDFs" },
                    { icon: BookOpen, text: "50 Page Limit" },
                    { icon: Sparkles, text: "Smart Context" },
                    { icon: List, text: "Chunk Processing" }
                  ].map(({ icon: Icon, text }, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
                    >
                      <Icon size={16} className="text-indigo-500" />
                      <span className="text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* PDF Processor */}
          <PDFProcessor 
            onError={handleError}
            onPDFContent={handlePDFContent}
            onMetadata={handleMetadata}
            mode="summarize"
          />

          {pdfContent && (
            <div>
              <div className="flex justify-end mb-4 space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'split' ? 'single' : 'split')}
                  className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800"
                >
                  {viewMode === 'split' ? 'Single View' : 'Split View'}
                </button>
              </div>

              {viewMode === 'split' ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <h3 className="text-lg font-semibold mb-2">Original Text</h3>
                    <div className="prose dark:prose-invert max-w-none">
                      {pdfContent.split('\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {lastGeneratedSummary ? (
                      <Summarizer text={pdfContent} settings={summarySettings} initialSummary={lastGeneratedSummary} />
                    ) : (
                      <Summarizer text={pdfContent} settings={summarySettings} onSummaryComplete={setLastGeneratedSummary} />
                    )}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <Summarizer 
                    text={pdfContent} 
                    settings={summarySettings} 
                    onSummaryComplete={setLastGeneratedSummary} 
                    initialSummary={lastGeneratedSummary}
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* Usage Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Tips for Best Results
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Ensure your PDF is text-based and not scanned images
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                For large documents, the summary will be generated in chunks to maintain quality
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                The summary focuses on key points while maintaining context and coherence
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Complex technical documents may require multiple passes for best results
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
      </div>

      <AnimatePresence>
        {showSettings && renderSettingsPanel()}
      </AnimatePresence>
    </div>
  )
}

export default PdfSummarizerPage