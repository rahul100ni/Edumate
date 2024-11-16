import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart2, Settings, User, Edit2, Save, X, 
  Clock, TrendingUp, CheckSquare, PieChart
} from 'lucide-react'
import TaskAnalytics from '../components/TaskAnalytics'
import StudyStatistics from '../components/StudyStatistics'
import SettingsPanel from '../components/SettingsPanel'
import { useSettings } from '../context/SettingsContext'
import { useTaskAnalytics } from '../context/TaskAnalyticsContext'
import { useStudyStats } from '../context/StudyStatsContext'

const DashboardPage: React.FC = () => {
  const { settings } = useSettings()
  const { analytics, resetAnalytics } = useTaskAnalytics()
  const { resetStats, getTodayStats, getCurrentStreak } = useStudyStats()
  const [activeSection, setActiveSection] = useState('overview')
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('userName') || '')
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempUserName, setTempUserName] = useState('')

  const startEditingName = () => {
    setIsEditingName(true)
    setTempUserName(userName)
  }

  const cancelEditingName = () => {
    setIsEditingName(false)
    setTempUserName('')
  }

  const saveNewName = () => {
    if (tempUserName.trim()) {
      setUserName(tempUserName.trim())
      localStorage.setItem('userName', tempUserName.trim())
      setIsEditingName(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveNewName()
    } else if (e.key === 'Escape') {
      cancelEditingName()
    }
  }

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetAnalytics()
      resetStats()
      
      localStorage.removeItem('pomodoroSessions')
      localStorage.removeItem('studySessions')
      localStorage.removeItem('taskAnalytics')
      localStorage.removeItem('todos')
      
      window.location.reload()
    }
  }

  const renderUserProfile = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">
              {userName ? userName[0].toUpperCase() : '?'}
            </span>
          </div>
          {isEditingName ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full sm:w-auto min-w-[200px]"
                placeholder="Enter your name"
                autoFocus
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={saveNewName}
                  className="p-2 text-green-500 hover:text-green-600 transition-colors duration-300"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={cancelEditingName}
                  className="p-2 text-red-500 hover:text-red-600 transition-colors duration-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{userName}</h2>
              <button
                onClick={startEditingName}
                className="p-2 text-gray-500 hover:text-gray-600 transition-colors duration-300"
              >
                <Edit2 size={20} />
              </button>
            </div>
          )}
        </div>
        {(Object.values(analytics).some(value => 
          typeof value === 'number' && value > 0 || 
          typeof value === 'object' && Object.keys(value).length > 0
        )) && (
          <button
            onClick={resetProgress}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300 w-full sm:w-auto"
          >
            Reset Progress
          </button>
        )}
      </div>
    </motion.div>
  )
  

  const renderOverview = () => {
    const todayStats = getTodayStats()
    const streak = getCurrentStreak()
    const completionRate = analytics.totalTasks > 0
      ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
      : 0

    return (
      <>
        {renderUserProfile()}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Focus</h3>
              <Clock className="text-indigo-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-indigo-500">{todayStats.totalDuration}min</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Study time today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Current Streak</h3>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-green-500">{streak} days</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Keep it up!</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tasks</h3>
              <CheckSquare className="text-purple-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-purple-500">{completionRate}%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {analytics.completedTasks} of {analytics.totalTasks} completed
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sessions Today</h3>
              <PieChart className="text-blue-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-blue-500">
              {todayStats.sessionsCompleted}/{todayStats.totalSessions}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed sessions</p>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 mb-8 md:mb-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h2>
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveSection('overview')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeSection === 'overview' 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <User size={20} className="mr-3" />
                  Overview
                </button>
                <button 
                  onClick={() => setActiveSection('statistics')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeSection === 'statistics' 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <BarChart2 size={20} className="mr-3" />
                  Statistics
                </button>
                <button 
                  onClick={() => setActiveSection('settings')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeSection === 'settings' 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Settings size={20} className="mr-3" />
                  Settings
                </button>
              </nav>
            </div>
          </div>
          <div className="w-full md:w-3/4 md:pl-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'overview' && renderOverview()}
              {activeSection === 'statistics' && (
                <div className="space-y-8">
                  <StudyStatistics />
                  <TaskAnalytics />
                </div>
              )}
              {activeSection === 'settings' && <SettingsPanel />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage