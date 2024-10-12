import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface ToolCardProps {
  title: string
  description: string
  icon: React.ReactNode
  link: string
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, link }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Link to={link} className="block h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center h-full transition-all duration-300 hover:shadow-lg">
        <div className="text-indigo-600 dark:text-indigo-400 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white text-center">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-center flex-grow">{description}</p>
      </div>
    </Link>
  </motion.div>
)

export default ToolCard