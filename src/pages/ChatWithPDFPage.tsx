import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, MessageSquare, Settings2, Search, 
  BookOpen, List, AlignLeft, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, SplitSquareHorizontal, X
} from 'lucide-react'
import PDFProcessor from '../components/PDFProcessor'
import PDFChat from '../components/PDFChat'

interface ChatSettings {
  responseLength: 'concise' | 'balanced' | 'detailed'
  tone: 'technical' | 'simple'
  format: 'structured' | 'conversational'
  includePageRefs: boolean
  autoSuggestQuestions: boolean
  highlightRelevantText: boolean
}

const ChatWithPDFPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pdfContent, setPdfContent] = useState<string>('')
  const [pageMap, setPageMap] = useState<Map<number, string>>(new Map())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPDFPanel, setShowPDFPanel] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [tableOfContents, setTableOfContents] = useState<Array<{ title: string; page: number }>>([])
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    responseLength: 'balanced',
    tone: 'simple',
    format: 'conversational',
    includePageRefs: true,
    autoSuggestQuestions: true,
    highlightRelevantText: true
  })

  const pdfContainerRef = useRef<HTMLDivElement>(null)

  const handleError = (error: string) => {
    setError(error)
  }

  const handlePDFContent = (content: string, pages: Map<number, string>) => {
    setPdfContent(content)
    setPageMap(pages)
  }

  const handleSearch = () => {
    // Implement PDF search functionality
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const togglePDFPanel = () => {
    setShowPDFPanel(!showPDFPanel)
  }

  const renderSettingsPanel = () => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl p-6 z-50"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Chat Settings</h3>
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
            Response Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['concise', 'balanced', 'detailed'].map((length) => (
              <button
                key={length}
                onClick={() => setChatSettings(prev => ({ ...prev, responseLength: length as any }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  chatSettings.responseLength === length
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
            Response Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setChatSettings(prev => ({ ...prev, tone: 'technical' }))}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                chatSettings.tone === 'technical'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Technical
            </button>
            <button
              onClick={() => setChatSettings(prev => ({ ...prev, tone: 'simple' }))}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                chatSettings.tone === 'simple'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Simple
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Include Page References
            </span>
            <button
              onClick={() => setChatSettings(prev => ({ 
                ...prev, 
                includePageRefs: !prev.includePageRefs 
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                chatSettings.includePageRefs
                  ? 'bg-indigo-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  chatSettings.includePageRefs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-suggest Questions
            </span>
            <button
              onClick={() => setChatSettings(prev => ({ 
                ...prev, 
                autoSuggestQuestions: !prev.autoSuggestQuestions 
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                chatSettings.autoSuggestQuestions
                  ? 'bg-indigo-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  chatSettings.autoSuggestQuestions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Highlight Relevant Text
            </span>
            <button
              onClick={() => setChatSettings(prev => ({ 
                ...prev, 
                highlightRelevantText: !prev.highlightRelevantText 
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                chatSettings.highlightRelevantText
                  ? 'bg-indigo-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  chatSettings.highlightRelevantText ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
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
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${
            isFullscreen ? 'fixed inset-0 z-50 m-4' : 'max-w-[1600px] mx-auto'
          }`}
        >
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg mr-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Chat with PDF
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Have interactive conversations with your documents
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePDFPanel}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Toggle PDF panel"
                >
                  <SplitSquareHorizontal size={20} />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Settings"
                >
                  <Settings2 size={20} />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-200px)]">
              {/* PDF Panel */}
              {showPDFPanel && (
                <div className="w-1/2 pr-4 border-r border-gray-200 dark:border-gray-700">
                  <div className="h-full flex flex-col">
                    {/* PDF Controls */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search in PDF..."
                          className="pl-8 pr-4 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                    </div>

                    {/* PDF Viewer */}
                    <div ref={pdfContainerRef} className="flex-grow overflow-auto">
                      <PDFProcessor
                        mode="chat"
                        onError={handleError}
                        onPDFContent={handlePDFContent}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Panel */}
              <div className={showPDFPanel ? 'w-1/2 pl-4' : 'w-full'}>
                {pdfContent ? (
                  <PDFChat
                    pdfContent={pdfContent}
                    pageMap={pageMap}
                    onError={handleError}
                    settings={chatSettings}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium">Upload a PDF to start chatting</p>
                    <p className="text-sm">Ask questions and get instant answers</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSettings && renderSettingsPanel()}
      </AnimatePresence>
    </div>
  )
}

export default ChatWithPDFPage