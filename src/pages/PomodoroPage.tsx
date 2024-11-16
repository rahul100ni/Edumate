import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RefreshCw, Settings, Music, VolumeX, Volume1, Volume2 } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useStudyStats } from '../context/StudyStatsContext'
import { TimerSettings } from './timerSettings'
import { SettingsModal } from './SettingsModal'
import { formatTime, handleNotification } from './utils'

interface PomodoroSession {
  date: string
  duration: number
  type: 'work' | 'break'
  completed: boolean
}

const motivationalQuotes = [
  "Stay focused, you're doing great!",
  "Every small step counts. Keep going!",
  "You're making progress, even if you can't see it yet.",
  "Believe in yourself. You've got this!",
  "Success is the sum of small efforts repeated day in and day out.",
]

const PomodoroPage: React.FC = () => {
  const { settings, requestNotificationPermission, updateSettings } = useSettings()
  const { addSession } = useStudyStats()
  const [timeLeft, setTimeLeft] = useState(settings.workDuration)
  const [isActive, setIsActive] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [cycleCount, setCycleCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [quote, setQuote] = useState('')
  const [tempSettings, setTempSettings] = useState<TimerSettings>(settings)
  const [showQuote, setShowQuote] = useState(settings.showMotivationalQuotes)
  const [isPlayingMusic, setIsPlayingMusic] = useState(settings.backgroundMusic)
  const [volume, setVolume] = useState(settings.soundVolume)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [totalElapsedTime, setTotalElapsedTime] = useState(0)
  const [lastDuration, setLastDuration] = useState(settings.workDuration)

  const timerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
  }, [isWork])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isActive, timeLeft])

  useEffect(() => {
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
        backgroundMusicRef.current.currentTime = 0
      }
    }
  }, [])

  useEffect(() => {
    updateDocumentTitle()
  }, [timeLeft, settings.showTimeInTab])

  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = settings.backgroundMusicVolume
    }
  }, [settings.backgroundMusicVolume])

  useEffect(() => {
    // Request notification permission when component mounts
    if (settings.desktopNotifications) {
      requestNotificationPermission()
    }
  }, [])

  useEffect(() => {
    if (currentSession && sessionStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((settings.workDuration - timeLeft) / 60)
        const totalTime = elapsed + totalElapsedTime
        setCurrentSession(prev => prev ? { ...prev, duration: totalTime } : null)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [timeLeft, totalElapsedTime, sessionStartTime])

  useEffect(() => {
    const newDuration = isWork ? settings.workDuration : 
      (cycleCount === settings.sessionsBeforeLongBreak - 1 ? 
        settings.longBreakDuration : settings.shortBreakDuration)

    if (isActive) {
      // If timer is running, adjust timeLeft proportionally
      const remainingPercentage = timeLeft / lastDuration
      const newTimeLeft = Math.round(newDuration * remainingPercentage)
      setTimeLeft(newTimeLeft)
    } else {
      // If timer is not running, simply update to new duration
      setTimeLeft(newDuration)
    }
    
    setLastDuration(newDuration)
  }, [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration])

  useEffect(() => {
    // Check if stats were reset
    const checkReset = () => {
      const studySessions = localStorage.getItem('studySessions')
      if (!studySessions) {
        setTimeLeft(settings.workDuration)
        setCycleCount(0)
        setIsWork(true)
        setIsActive(false)
        setCurrentSession(null)
      }
    }

    window.addEventListener('storage', checkReset)
    return () => window.removeEventListener('storage', checkReset)
  }, [settings.workDuration])

  const handleBackgroundMusic = () => {
    if (!backgroundMusicRef.current) {
      backgroundMusicRef.current = new Audio('/sounds/Study_Music.mp3')
      backgroundMusicRef.current.loop = true
    }
    
    backgroundMusicRef.current.volume = volume

    if (isPlayingMusic) {
      backgroundMusicRef.current.play().catch(error => console.error("Error playing music:", error))
    } else {
      backgroundMusicRef.current.pause()
    }
  }

  const toggleBackgroundMusic = () => {
    setIsPlayingMusic(prev => !prev)
  }

  useEffect(() => {
    handleBackgroundMusic()
  }, [isPlayingMusic, volume])

  const updateDocumentTitle = () => {
    document.title = settings.showTimeInTab
      ? `${formatTime(timeLeft)} - Pomodoro Timer`
      : 'Pomodoro Timer'
  }

  const startNewSession = () => {
    const session: PomodoroSession = {
      date: new Date().toISOString().split('T')[0],
      duration: 0,
      type: isWork ? 'work' : 'break',
      completed: false
    }
    setCurrentSession(session)
    setSessionStartTime(Date.now())
    setTotalElapsedTime(0)
  }

  const completeSession = (completed: boolean = true) => {
    if (currentSession) {
      const finalDuration = totalElapsedTime + Math.floor((settings.workDuration - timeLeft) / 60)
      const finalSession = {
        ...currentSession,
        duration: finalDuration,
        completed
      }
      
      addSession({
        date: finalSession.date,
        duration: finalDuration,
        type: finalSession.type,
        completed: finalSession.completed
      })
      
      setCurrentSession(null)
      setSessionStartTime(null)
      setTotalElapsedTime(0)
    }
  }

  const handleTimerComplete = () => {
    if (currentSession) {
      completeSession()
    }
    if (settings.soundEnabled) {
      playNotificationSound()
    }
    if (settings.desktopNotifications) {
      handleNotification(isWork)
    }
    updateTimerState()
  }

  const playNotificationSound = () => {
    if (settings.soundEnabled) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      audioRef.current = new Audio(`/sounds/${settings.selectedSound}.mp3`)
      audioRef.current.volume = settings.soundVolume
      audioRef.current.play().catch(error => console.error("Error playing notification:", error))
    }
  }

  const updateTimerState = () => {
    if (isWork) {
      handleWorkComplete()
    } else {
      handleBreakComplete()
    }

    setIsActive((isWork && settings.autoStartBreaks) || (!isWork && settings.autoStartPomodoros))
  }

  const handleWorkComplete = () => {
    setCycleCount(cycleCount + 1)
    if (cycleCount === settings.sessionsBeforeLongBreak - 1) {
      setTimeLeft(settings.longBreakDuration)
      setCycleCount(0)
    } else {
      setTimeLeft(settings.shortBreakDuration)
    }
    setIsWork(false)
  }

  const handleBreakComplete = () => {
    setTimeLeft(settings.workDuration)
    setIsWork(true)
  }

  const toggleTimer = async () => {
    if (!isActive) {
      if (settings.desktopNotifications) {
        await requestNotificationPermission()
      }
      if (!currentSession || currentSession.completed) {
        startNewSession()
      }
      setSessionStartTime(Date.now())
    } else {
      // When pausing, update total elapsed time
      if (sessionStartTime) {
        const additionalTime = Math.floor((settings.workDuration - timeLeft) / 60)
        setTotalElapsedTime(prev => prev + additionalTime)
      }
    }
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    if (currentSession && !currentSession.completed) {
      completeSession(false)
    }
    setIsActive(false)
    setIsWork(true)
    setCycleCount(0)
    setTimeLeft(settings.workDuration)
    setCurrentSession(null)
    setSessionStartTime(null)
    setTotalElapsedTime(0)
  }

  const updateTempSetting = <K extends keyof TimerSettings>(key: K, value: TimerSettings[K]) => {
    setTempSettings({ ...tempSettings, [key]: value })
  }

  const saveSettings = () => {
    const newSettings = {
      ...tempSettings,
      workDuration: tempSettings.workDuration || 25 * 60,
      shortBreakDuration: tempSettings.shortBreakDuration || 5 * 60,
      longBreakDuration: tempSettings.longBreakDuration || 15 * 60,
    }
    setSettings(newSettings)
    setShowSettings(false)
    if (isWork && newSettings.workDuration !== settings.workDuration) {
      setTimeLeft(newSettings.workDuration)
    } else if (!isWork && cycleCount === settings.sessionsBeforeLongBreak - 1 && newSettings.longBreakDuration !== settings.longBreakDuration) {
      setTimeLeft(newSettings.longBreakDuration)
    } else if (!isWork && newSettings.shortBreakDuration !== settings.shortBreakDuration) {
      setTimeLeft(newSettings.shortBreakDuration)
    }
  }

  const updateTimeLeftBasedOnCurrentState = (newSettings: TimerSettings) => {
    if (isWork) {
      setTimeLeft(newSettings.workDuration)
    } else if (cycleCount === settings.sessionsBeforeLongBreak - 1) {
      setTimeLeft(newSettings.longBreakDuration)
    } else {
      setTimeLeft(newSettings.shortBreakDuration)
    }
  }

  const toggleQuoteDisplay = () => {
    setShowQuote(!showQuote)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 dark:from-gray-900 dark:to-indigo-900 transition-colors duration-300 p-4"
    >
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Pomodoro Timer</h2>
            <div className="flex space-x-3">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <button
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  {volume === 0 ? (
                    <VolumeX className="text-gray-600 dark:text-gray-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Volume2 className="text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                {showVolumeControl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg"
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-32"
                    />
                  </motion.div>
                )}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleBackgroundMusic}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <Music className={isPlayingMusic ? "text-green-500" : "text-gray-400"} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleQuoteDisplay}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className={`w-6 h-6 ${showQuote ? "text-blue-500" : "text-gray-400"}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </motion.button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <Settings className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="relative mb-8">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-72 h-72">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="130"
                    cx="144"
                    cy="144"
                  />
                  <motion.circle
                    className="text-indigo-500 dark:text-indigo-400"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 130}
                    strokeDashoffset={2 * Math.PI * 130 * (1 - timeLeft / (isWork ? settings.workDuration : (cycleCount === settings.sessionsBeforeLongBreak - 1 ? settings.longBreakDuration : settings.shortBreakDuration)))}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="130"
                    cx="144"
                    cy="144"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
              </motion.div>
              <div className="relative z-10 flex flex-col items-center justify-center w-72 h-72 mx-auto">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <motion.p
                  key={isWork}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl mt-4 text-gray-600 dark:text-gray-300 transition-colors duration-300"
                >
                  {isWork ? "Work Session" : (cycleCount === settings.sessionsBeforeLongBreak - 1 ? "Long Break" : "Short Break")}
                </motion.p>
              </div>
            </div>
            <AnimatePresence>
              {showQuote && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg mb-8 text-gray-600 dark:text-gray-300 italic transition-colors duration-300"
                >
                  "{quote}"
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex justify-center space-x-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={`px-10 py-4 rounded-full text-white text-xl font-semibold flex items-center transition-colors duration-300 ${
                  isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isActive ? <Pause size={28} className="mr-3" /> : <Play size={28} className="mr-3" />}
                {isActive ? 'Pause' : 'Start'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className="px-10 py-4 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-xl font-semibold flex items-center transition-colors duration-300"
              >
                <RefreshCw size={28} className="mr-3" />
                <span className="dark:text-white">Reset</span>
              </motion.button>
            </div>
          </div>

          {showSettings && (
            <SettingsModal
              tempSettings={tempSettings}
              updateTempSetting={updateTempSetting}
              saveSettings={saveSettings}
              closeSettings={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PomodoroPage