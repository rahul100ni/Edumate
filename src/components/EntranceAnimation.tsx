import React from 'react'
import { motion } from 'framer-motion'

const EntranceAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-600"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 3.5 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="text-white text-6xl font-bold flex flex-col items-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Welcome to
        </motion.span>
        <motion.span
          className="text-8xl mt-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          EduMate
        </motion.span>
        <motion.div
          className="mt-8 flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          {['Study', 'Learn', 'Grow'].map((word, index) => (
            <motion.span
              key={word}
              className="text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 + index * 0.2, duration: 0.3 }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default EntranceAnimation