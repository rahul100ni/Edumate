import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckSquare, FileText, FileSearch, Video, GitBranch, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import EntranceAnimation from '../components/EntranceAnimation'

const trendingFeatures = [
  { title: 'PDF Summarizer', description: 'Get quick summaries of PDF documents', icon: <FileSearch size={48} />, link: '/pdf-summarizer', image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { title: 'Video Summarizer', description: 'Extract key points from educational videos', icon: <Video size={48} />, link: '/video-summarizer', image: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { title: 'Pomodoro Timer', description: 'Boost productivity with timed work sessions', icon: <Clock size={48} />, link: '/pomodoro', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
]

const allTools = [
  { title: 'Pomodoro Timer', description: 'Boost productivity with timed work sessions', icon: <Clock size={32} />, link: '/pomodoro' },
  { title: 'To-Do List', description: 'Organize and prioritize your tasks', icon: <CheckSquare size={32} />, link: '/todo-list' },
  { title: 'Note Taking', description: 'Capture and organize your thoughts', icon: <FileText size={32} />, link: '/note-taking' },
  { title: 'PDF Summarizer', description: 'Get quick summaries of PDF documents', icon: <FileSearch size={32} />, link: '/pdf-summarizer' },
  { title: 'Video Summarizer', description: 'Extract key points from educational videos', icon: <Video size={32} />, link: '/video-summarizer' },
  { title: 'Mind Map Maker', description: 'Visualize concepts and ideas', icon: <GitBranch size={32} />, link: '/mind-map-maker' },
]

const ToolCard = lazy(() => import('./ToolCard'))
const TrendingFeature = lazy(() => import('./TrendingFeature'))

interface HomePageProps {
  userName: string | null
}

const HomePage: React.FC<HomePageProps> = ({ userName }) => {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showEntranceAnimation, setShowEntranceAnimation] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const hasSeenAnimation = localStorage.getItem('hasSeenEntranceAnimation')
    if (!hasSeenAnimation) {
      setShowEntranceAnimation(true)
      localStorage.setItem('hasSeenEntranceAnimation', 'true')
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setActiveFeature((prev) => (prev + 1) % trendingFeatures.length)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused])

  const handlePrevious = () => {
    setActiveFeature((prev) => (prev - 1 + trendingFeatures.length) % trendingFeatures.length)
  }

  const handleNext = () => {
    setActiveFeature((prev) => (prev + 1) % trendingFeatures.length)
  }

  const handleFeatureClick = (link: string) => {
    navigate(link)
  }

  return (
    <>
      <AnimatePresence>
        {showEntranceAnimation && (
          <EntranceAnimation onComplete={() => setShowEntranceAnimation(false)} />
        )}
      </AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8"
      >
        <section className="text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-4xl sm:text-5xl font-bold mb-2 text-gray-800 dark:text-white"
          >
            Welcome to EduMate{userName ? `, ${userName}` : ''}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300"
          >
            Your ultimate study companion
          </motion.p>
        </section>

        <section 
          className="relative h-[350px] sm:h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-2xl"
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            {trendingFeatures.map((feature, index) => (
              <Suspense key={feature.title} fallback={<div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>}>
                <TrendingFeature 
                  feature={feature} 
                  isActive={index === activeFeature}
                  onClick={() => handleFeatureClick(feature.link)}
                />
              </Suspense>
            ))}
          </AnimatePresence>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 p-2 rounded-full transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Previous feature"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 p-2 rounded-full transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Next feature"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {trendingFeatures.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeFeature ? 'bg-white scale-125' : 'bg-gray-400 hover:bg-gray-300'
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-800 dark:text-white">All Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Suspense fallback={<div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>}>
                  <ToolCard {...tool} />
                </Suspense>
              </motion.div>
            ))}
          </div>
        </section>

        {allTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-8"
          >
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">No tools available yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back soon for exciting new features!</p>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}

export default HomePage