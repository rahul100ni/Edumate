import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, AlertCircle, Loader, Info, Upload, BookOpen, FileQuestion, X } from 'lucide-react'
import { generateQuiz, QuizQuestion } from '../utils/quizGenerator'
import PDFProcessor from '../components/PDFProcessor'
import { Settings2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

const QuizGeneratorPage: React.FC = () => {
  const [content, setContent] = useState('')
  const [pdfContent, setPDFContent] = useState<string>('')
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ status: '', progress: 0 })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const textToProcess = inputMode === 'pdf' ? pdfContent : content
    if (!textToProcess.trim()) return

    setIsGenerating(true)
    setError(null)
    setQuestions([])
    setSelectedAnswers([])
    setShowResults(false)

    try {
      const generatedQuestions = await generateQuiz(textToProcess, {
        onProgress: (progress) => setGenerationProgress(progress),
        numberOfQuestions: 10,
        difficulty: 'medium',
        questionTypes: ['mcq']
      })
      setQuestions(generatedQuestions)
      setCurrentQuestion(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleReset = () => {
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowResults(false)
  }

  const handlePDFContent = (content: string) => {
    setPDFContent(content)
  }

  const handlePDFError = (error: string) => {
    setError(error)
  }

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0)
    }, 0)
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
              Quiz Generator
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
                Generate interactive quizzes from any text content. Perfect for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Study materials</li>
                <li>Course content</li>
                <li>Reading comprehension</li>
                <li>Knowledge testing</li>
              </ul>
            </div>
          </motion.div>

          {!questions.length && (
            <div className="mb-6">
              {/* Input Mode Selector */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => setInputMode('text')}
                    className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200 ${
                      inputMode === 'text'
                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <FileText size={18} />
                    <span>Text Input</span>
                  </button>
                  <button
                    onClick={() => setInputMode('pdf')}
                    className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200 ${
                      inputMode === 'pdf'
                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <BookOpen size={18} />
                    <span>PDF Input</span>
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {inputMode === 'text' ? (
                  <motion.form
                    key="text-input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content for Quiz
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-40 px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Paste your content here..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isGenerating || !content.trim()}
                      className={`w-full px-4 py-3 rounded-lg flex items-center justify-center space-x-2 ${
                        isGenerating || !content.trim()
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } text-white transition-colors duration-300`}
                    >
                      <FileQuestion size={20} />
                      <span>{isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}</span>
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="pdf-input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <PDFProcessor
                      onError={handlePDFError}
                      onPDFContent={handlePDFContent}
                      mode="quiz"
                    />
                    {pdfContent && (
                      <button
                        onClick={handleSubmit}
                        disabled={isGenerating}
                        className={`w-full px-4 py-3 rounded-lg flex items-center justify-center space-x-2 ${
                          isGenerating
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white transition-colors duration-300`}
                      >
                        <FileQuestion size={20} />
                        <span>{isGenerating ? 'Generating Quiz...' : 'Generate Quiz from PDF'}</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

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
            {isGenerating && (
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
                      {inputMode === 'pdf' ? 'Analyzing PDF content...' : generationProgress.status}
                    </span>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {Math.round(generationProgress.progress)}%
                  </span>
                </div>
                <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${inputMode === 'pdf' ? 50 : generationProgress.progress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(content.trim() || pdfContent.trim()) && !questions.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quiz Settings</h3>
                <Settings2 className="text-gray-500" size={20} />
              </div>
              {/* Add quiz settings controls here */}
            </motion.div>
          )}

          {questions.length > 0 && !showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <button
                  onClick={handleReset}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  {questions[currentQuestion].question}
                </h3>
                {questions[currentQuestion].options && (
                  <div className="space-y-3">
                    {(Array.isArray(questions[currentQuestion].options) 
                      ? questions[currentQuestion].options 
                      : typeof questions[currentQuestion].options === 'string'
                        ? [questions[currentQuestion].options, 'True', 'False']
                        : []
                    ).map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full p-3 text-left rounded-lg transition-colors duration-200 ${
                          selectedAnswers[currentQuestion] === option
                            ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500'
                            : 'bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'
                        }`}
                      >
                        {String(option)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`px-4 py-2 rounded-lg ${
                    currentQuestion === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white transition-colors duration-300`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestion]}
                  className={`px-4 py-2 rounded-lg ${
                    !selectedAnswers[currentQuestion]
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white transition-colors duration-300`}
                >
                  {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </motion.div>
          )}

          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                  Quiz Results
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  You scored {calculateScore()} out of {questions.length}
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {index + 1}. {question.question}
                      </h4>
                      {selectedAnswers[index] === question.correctAnswer ? (
                        <CheckCircle className="text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Your answer: {selectedAnswers[index]}
                    </p>
                    <p className="text-green-600 dark:text-green-400 mb-2">
                      Correct answer: {question.correctAnswer}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {question.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default QuizGeneratorPage