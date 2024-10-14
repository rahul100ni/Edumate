import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PomodoroPage from './pages/PomodoroPage'
import TodoListPage from './pages/TodoListPage'
import NoteTakingPage from './pages/NoteTakingPage'
import PdfSummarizerPage from './pages/PdfSummarizerPage'
import VideoSummarizerPage from './pages/VideoSummarizerPage'
import MindMapMakerPage from './pages/MindMapMakerPage'
import DashboardPage from './pages/DashboardPage'
import WelcomePage from './components/WelcomePage'
import EntranceAnimation from './components/EntranceAnimation'
import { Moon, Sun } from 'lucide-react'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
}

const AnimatedRoutes = ({ userName }: { userName: string | null }) => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage userName={userName} />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/todo-list" element={<TodoListPage />} />
          <Route path="/note-taking" element={<NoteTakingPage />} />
          <Route path="/pdf-summarizer" element={<PdfSummarizerPage />} />
          <Route path="/video-summarizer" element={<VideoSummarizerPage />} />
          <Route path="/mind-map-maker" element={<MindMapMakerPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showEntranceAnimation, setShowEntranceAnimation] = useState(false)

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }

    const storedUserName = localStorage.getItem('userName')
    // if (storedUserName) {
    //   setUserName(storedUserName)
    //   setShowWelcome(false)
    // }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleNameSubmit = (name: string) => {
    setUserName(name)
    localStorage.setItem('userName', name)
    setShowWelcome(false)
    setShowEntranceAnimation(true)
  }

  const handleEntranceAnimationComplete = () => {
    setShowEntranceAnimation(false)
  }

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 dark:bg-gradient-animation min-h-screen flex flex-col transition-all duration-500">
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50"
              >
                <WelcomePage onNameSubmit={handleNameSubmit} />
              </motion.div>
            )}
            {showEntranceAnimation && (
              <EntranceAnimation onComplete={handleEntranceAnimationComplete} />
            )}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`flex-grow flex flex-col ${showWelcome || showEntranceAnimation ? 'invisible' : 'visible'}`}
          >
            <Header userName={userName} />
            <main className="flex-grow container fade-in min-w-full">
              <AnimatedRoutes userName={userName} />
            </main>
            <Footer />
          </motion.div>
          <motion.button
            onClick={toggleDarkMode}
            className="fixed bottom-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
          </motion.button>
        </div>
      </div>
    </Router>
  )
}

export default App