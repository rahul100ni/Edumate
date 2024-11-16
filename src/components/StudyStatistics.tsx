import React from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, Calendar, TrendingUp, PieChart, 
  BarChart2, CheckSquare 
} from 'lucide-react'
import { useStudyStats } from '../context/StudyStatsContext'

const StudyStatistics: React.FC = () => {
  const { getDailyStats, getCategoryStats, getCurrentStreak } = useStudyStats()

  const dailyStats = getDailyStats(7) // Last 7 days
  const categoryStats = getCategoryStats()
  const currentStreak = getCurrentStreak()

  const totalStudyTime = dailyStats.reduce((acc, day) => acc + day.totalDuration, 0)
  const totalSessions = dailyStats.reduce((acc, day) => acc + day.totalSessions, 0)
  const completedSessions = dailyStats.reduce((acc, day) => acc + day.sessionsCompleted, 0)
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Total Study Time</h3>
            <Clock className="text-indigo-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-indigo-500">{totalStudyTime} min</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Current Streak</h3>
            <Calendar className="text-green-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-green-500">{currentStreak} days</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sessions</h3>
            <CheckSquare className="text-purple-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-purple-500">
            {completedSessions}/{totalSessions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {completionRate}% completion rate
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Categories</h3>
            <PieChart className="text-blue-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-blue-500">{categoryStats.length}</div>
        </motion.div>
      </div>

      {/* Daily Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Daily Progress</h3>
          <BarChart2 className="text-indigo-500" size={24} />
        </div>
        <div className="h-64 flex items-end space-x-2">
          {dailyStats.map((day, index) => {
            const maxDuration = Math.max(...dailyStats.map(d => d.totalDuration))
            const height = maxDuration > 0 ? (day.totalDuration / maxDuration) * 100 : 0
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {day.totalDuration}m
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Category Distribution</h3>
          <PieChart className="text-blue-500" size={24} />
        </div>
        <div className="space-y-4">
          {categoryStats.map(category => {
            const totalTime = categoryStats.reduce((acc, cat) => acc + cat.totalDuration, 0)
            const percentage = totalTime > 0 ? Math.round((category.totalDuration / totalTime) * 100) : 0
            
            return (
              <div key={category.category}>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{category.category}</span>
                  <span>{category.totalDuration}min ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default StudyStatistics