import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WelcomePageProps {
  onNameSubmit: (name: string) => void
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onNameSubmit(name.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `radial-gradient(circle at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(255,255,255,0.2) 0%, transparent 15%)`,
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
          className="text-6xl md:text-8xl font-bold text-white mb-8 text-center"
        >
          Welcome to
        </motion.h1>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
          className="relative"
        >
          <h2 className="text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
            EduMate
          </h2>
          <motion.span
            className="absolute -bottom-4 left-0 w-full h-1 bg-white"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          />
        </motion.div>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-xl md:text-2xl text-white mt-8 mb-12 text-center max-w-2xl"
        >
          Your ultimate study companion, designed to elevate your learning experience and boost your productivity.
        </motion.p>
        <AnimatePresence>
          {!showInput ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-indigo-600 rounded-full text-xl font-bold shadow-lg hover:bg-opacity-90 transition-all duration-300"
              onClick={() => setShowInput(true)}
            >
              Get Started
            </motion.button>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="flex flex-col items-center space-y-4 w-full max-w-md"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative w-full"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-6 py-4 text-xl bg-transparent border-b-2 border-white text-white placeholder-white placeholder-opacity-75 focus:outline-none focus:border-yellow-400 text-center"
                  autoFocus
                />
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: name.length > 0 ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-indigo-600 rounded-full text-xl font-bold shadow-lg hover:bg-opacity-90 transition-all duration-300"
              >
                Let's Begin!
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default WelcomePage