import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, CheckSquare, Award, Target, Settings, 
  ChevronRight, ChevronLeft, BarChart2, Calendar, 
  Zap, Sun, Moon, Volume2, Volume1, VolumeX
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface StudySession {
  date: string
  duration: number
}

interface Task {
  id: number
  text: string
  completed: boolean
  date: string
}

interface Goal {
  id: number
  text: string
  progress: number
}

interface Achievement {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
}

const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [streak, setStreak] = useState(0)
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  })
  const [focusSettings, setFocusSettings] = useState({
    theme: 'light',
    sound: 'nature',
    volume: 50
  })

  useEffect(() => {
    // Simulating data fetching
    setStudySessions([
      { date: '2023-06-01', duration: 120 },
      { date: '2023-06-02', duration: 90 },
      { date: '2023-06-03', duration: 150 },
      { date: '2023-06-04', duration: 180 },
      { date: '2023-06-05', duration: 200 },
    ])

    setTasks([
      { id: 1, text: 'Complete Math Assignment', completed: true, date: '2023-06-01' },
      { id: 2, text: 'Read Chapter 5 of History Book', completed: false, date: '2023-06-02' },
      { id: 3, text: 'Prepare for Science Quiz', completed: true, date: '2023-06-03' },
      { id: 4, text: 'Write English Essay', completed: false, date: '2023-06-04' },
      { id: 5, text: 'Practice Piano for 1 hour', completed: true, date: '2023-06-05' },
    ])

    setGoals([
      { id: 1, text: 'Study for 20 hours this week', progress: 75 },
      { id: 2, text: 'Complete 10 practice tests', progress: 40 },
      { id: 3, text: 'Read 2 books this month', progress: 50 },
    ])

    setAchievements([
      { id: 1, title: 'Early Bird', description: 'Complete a study session before 8 AM', icon: <Sun size={24} />, unlocked: true },
      { id: 2, title: 'Night Owl', description: 'Complete a study session after 10 PM', icon: <Moon size={24} />, unlocked: false },
      { id: 3, title: 'Streak Master', description: 'Maintain a 7-day study streak', icon: <Zap size={24} />, unlocked: true },
      { id: 4, title: 'Task Terminator', description: 'Complete 50 tasks', icon: <CheckSquare size={24} />, unlocked: false },
    ])

    setStreak(5)
  }, [])

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Study Progress</h3>
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            {studySessions.reduce((acc, session) => acc + session.duration, 0)} min
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            This week
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold">75%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Activities</h3>
        <ul className="space-y-3">
          {tasks.slice(0, 3).map(task => (
            <li key={task.id} className="flex items-center">
              <span className={`flex-shrink-0 w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></span>
              <span className="text-gray-800 dark:text-gray-200">{task.text}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )

  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Study Time Visualization</h3>
        <div className="h-64 flex items-end justify-between">
          {studySessions.map((session, index) => (
            <div key={index} className="w-1/6">
              <div 
                className="bg-indigo-500 rounded-t-md transition-all duration-500 ease-in-out hover:bg-indigo-600"
                style={{ height: `${(session.duration / 200) * 100}%` }}
              ></div>
              <div className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400">{session.date.slice(-2)}</div>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Task Completion Rate</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeDasharray="75, 100"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">75%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderAchievements = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Achievements</h3>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`p-4 rounded-lg ${
                achievement.unlocked 
                  ? 'bg-indigo-100 dark:bg-indigo-900' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded-full ${
                  achievement.unlocked 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {achievement.icon}
                </div>
                <h4 className="ml-2 font-semibold text-gray-800 dark:text-white">{achievement.title}</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Study Streak</h3>
        <div className="flex items-center justify-center">
          <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">{streak}</div>
          <div className="ml-4 text-gray-600 dark:text-gray-400">
            <div className="text-2xl font-semibold">Days</div>
            <div className="text-sm">Keep it up!</div>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          {[...Array(7)].map((_, index) => (
            <div 
              key={index} 
              className={`w-8 h-8 rounded-full ${
                index < streak % 7 
                  ? 'bg-indigo-500' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            ></div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  const renderGoals = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Learning Goals</h3>
        {goals.map(goal => (
          <div key={goal.id} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 dark:text-gray-300">{goal.text}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{goal.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add New Goal</h3>
        <form className="space-y-4">
          <div>
            <label htmlFor="goalText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Description</label>
            <input 
              type="text" 
              id="goalText" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your goal"
            />
          </div>
          <div>
            <label htmlFor="goalDeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
            <input 
              type="date" 
              id="goalDeadline" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-300"
          >
            Add Goal
          </button>
        </form>
      </motion.div>
    </div>
  )

  const renderFocusSettings = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Pomodoro Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="workDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Work Duration (minutes)</label>
            <input 
              type="number" 
              id="workDuration" 
              value={pomodoroSettings.workDuration}
              onChange={(e) => setPomodoroSettings({...pomodoroSettings, workDuration: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="shortBreakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Break Duration (minutes)</label>
            <input 
              type="number" 
              id="shortBreakDuration" 
              value={pomodoroSettings.shortBreakDuration}
              onChange={(e) => setPomodoroSettings({...pomodoroSettings, shortBreakDuration: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="longBreakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Long Break Duration (minutes)</label>
            <input 
              type="number" 
              id="longBreakDuration" 
              value={pomodoroSettings.longBreakDuration}
              onChange={(e) => setPomodoroSettings({...pomodoroSettings, longBreakDuration: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="sessionsBeforeLongBreak" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sessions Before Long Break</label>
            <input 
              type="number" 
              id="sessionsBeforeLongBreak" 
              value={pomodoroSettings.sessionsBeforeLongBreak}
              onChange={(e) => setPomodoroSettings({...pomodoroSettings, sessionsBeforeLongBreak: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Focus Environment</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <div className="flex space-x-4">
              <button 
                onClick={() => setFocusSettings({...focusSettings, theme: 'light'})}
                className={`px-4 py-2 rounded-md ${focusSettings.theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
              >
                Light
              </button>
              <button 
                onClick={() => setFocusSettings({...focusSettings, theme: 'dark'})}
                className={`px-4 py-2 rounded-md ${focusSettings.theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
              >
                Dark
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Sound</label>
            <select 
              value={focusSettings.sound}
              onChange={(e) => setFocusSettings({...focusSettings, sound: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="none">None</option>
              <option value="nature">Nature Sounds</option>
              <option value="whitenoise">White Noise</option>
              <option value="lofi">Lo-Fi Music</option>
            </select>
          </div>
          <div>
            <label htmlFor="volume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Volume</label>
            <div className="flex items-center space-x-4">
              <VolumeX size={20} className="text-gray-500" />
              <input 
                type="range" 
                id="volume" 
                min="0" 
                max="100" 
                value={focusSettings.volume}
                onChange={(e) => setFocusSettings({...focusSettings, volume: parseInt(e.target.value)})}
                className="w-full"
              />
              <Volume2 size={20} className="text-gray-500" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'statistics':
        return renderStatistics()
      case 'achievements':
        return renderAchievements()
      case 'goals':
        return renderGoals()
      case 'focus':
        return renderFocusSettings()
      default:
        return renderOverview()
    }
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
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeSection === 'overview' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <BarChart2 size={20} className="mr-3" />
                  Overview
                </button>
                <button 
                  onClick={() => setActiveSection('statistics')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeSection === 'statistics' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <BarChart2 size={20} className="mr-3" />
                  Statistics
                </button>
                <button 
                  onClick={() => setActiveSection('achievements')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeSection === 'achievements' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <Award size={20} className="mr-3" />
                  Achievements
                </button>
                <button 
                  onClick={() => setActiveSection('goals')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeSection === 'goals' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <Target size={20} className="mr-3" />
                  Goals
                </button>
                <button 
                  onClick={() => setActiveSection('focus')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeSection === 'focus' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <Settings size={20} className="mr-3" />
                  Focus Settings
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
              transition={{ duration: 0.5 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage