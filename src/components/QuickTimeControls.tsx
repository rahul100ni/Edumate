import React, { FC } from 'react'
import { motion } from 'framer-motion'
import { MinusCircle, PlusCircle, X } from 'lucide-react'

interface QuickTimeControlsProps {
  currentDuration: number
  onAdjustTime: (adjustment: number) => void
  isActive: boolean
  onClose: () => void
}

const QuickTimeControls: FC<QuickTimeControlsProps> = ({
  currentDuration,
  onAdjustTime,
  isActive,
  onClose
}) => {
  const timeAdjustments = [1, 5, 10] // Minutes

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.2 }}
      className="fixed left-[calc(50%+220px)] top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 w-72 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Adjust Time</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </motion.button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Add or remove minutes</p>
        </div>
        {timeAdjustments.map((minutes) => (
          <div key={minutes} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{minutes} minutes</span>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => onAdjustTime(-minutes * 60)}
                disabled={!isActive || currentDuration <= minutes * 60 + 30}
                className={`p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  (!isActive || currentDuration <= minutes * 60 + 30) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                <MinusCircle size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => onAdjustTime(minutes * 60)}
                disabled={!isActive || currentDuration >= 3600}
                className={`p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  (!isActive || currentDuration >= 3600) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                <PlusCircle size={16} />
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export { QuickTimeControls }
export type { QuickTimeControlsProps }