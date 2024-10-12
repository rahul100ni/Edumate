import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface TrendingFeatureProps {
  feature: {
    title: string
    description: string
    icon: React.ReactNode
    link: string
    image: string
  }
  isActive: boolean
  onClick: () => void
}

const TrendingFeature: React.FC<TrendingFeatureProps> = ({ feature, isActive, onClick }) => (
  <motion.div 
    className={`absolute inset-0 cursor-pointer ${isActive ? 'z-10' : 'z-0'}`}
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: isActive ? 1 : 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div 
      className="absolute inset-0 bg-cover bg-center"
      style={{backgroundImage: `url(${feature.image})`}}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.5 }}
    />
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
      <div className="text-center">
        <motion.div 
          className="text-indigo-400 mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {feature.icon}
        </motion.div>
        <motion.h3 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {feature.title}
        </motion.h3>
        <motion.p 
          className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {feature.description}
        </motion.p>
        <motion.button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Learn More <ArrowRight className="ml-2" />
        </motion.button>
      </div>
    </div>
  </motion.div>
)

export default TrendingFeature