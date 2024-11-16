import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart2, Clock, Calendar, CheckSquare, 
  AlertTriangle, TrendingUp, PieChart
} from 'lucide-react'
import { useTaskAnalytics } from '../context/TaskAnalyticsContext'

const TaskAnalytics: React.FC = () => {
  const { analytics } = useTaskAnalytics()

  const completionRate = analytics.totalTasks > 0
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
    : 0

  const deadlineRate = (analytics.deadlinesMet + analytics.deadlinesMissed) > 0
    ? Math.round((analytics.deadlinesMet / (analytics.deadlinesMet + analytics.deadlinesMissed)) * 100)
    : 0

  const getMostProductiveHour = () => {
    const hours = Object.entries(analytics.productiveHours)
    if (hours.length === 0) return null
    
    const mostProductiveHour = hours.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
    
    return {
      hour: parseInt(mostProductiveHour[0]),
      count: mostProductiveHour[1]
    }
  }

  const getMostProductiveDay = () => {
    const days = Object.entries(analytics.productiveDays)
    if (days.length === 0) return null
    
    return days.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
  }

  const mostProductiveHour = getMostProductiveHour()
  const mostProductiveDay = getMostProductiveDay()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Completion Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Task Completion
            </h3>
            <CheckSquare className="text-green-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-green-500 mb-2">
            {completionRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {analytics.completedTasks} of {analytics.totalTasks} tasks completed
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-500">High Priority</span>
              <span>{analytics.highPriorityCompleted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-500">Medium Priority</span>
              <span>{analytics.mediumPriorityCompleted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-500">Low Priority</span>
              <span>{analytics.lowPriorityCompleted}</span>
            </div>
          </div>
        </motion.div>

        {/* Deadline Performance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Deadline Performance
            </h3>
            <Calendar className="text-indigo-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-indigo-500 mb-2">
            {deadlineRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Deadlines met successfully
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-500">Met</span>
              <span>{analytics.deadlinesMet}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-500">Missed</span>
              <span>{analytics.deadlinesMissed}</span>
            </div>
          </div>
        </motion.div>

        {/* Productivity Patterns Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Peak Productivity
            </h3>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
          <div className="space-y-4">
            {mostProductiveHour && (
              <div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="mr-2" size={16} />
                  Most Productive Hour
                </div>
                <div className="text-lg font-semibold text-purple-500">
                  {mostProductiveHour.hour}:00 - {mostProductiveHour.hour + 1}:00
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {mostProductiveHour.count} tasks completed
                </div>
              </div>
            )}
            {mostProductiveDay && (
              <div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="mr-2" size={16} />
                  Most Productive Day
                </div>
                <div className="text-lg font-semibold text-purple-500">
                  {mostProductiveDay[0]}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {mostProductiveDay[1]} tasks completed
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Productivity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Daily Activity Timeline
          </h3>
          <BarChart2 className="text-blue-500" size={24} />
        </div>
        <div className="h-48 flex items-end space-x-2">
          {Array.from({ length: 24 }).map((_, hour) => {
            const completions = analytics.productiveHours[hour] || 0
            const maxCompletions = Math.max(...Object.values(analytics.productiveHours))
            const height = maxCompletions > 0 ? (completions / maxCompletions) * 100 : 0
            
            return (
              <div
                key={hour}
                className="flex-1 flex flex-col items-center"
              >
                <div 
                  className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {hour}:00
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default TaskAnalytics