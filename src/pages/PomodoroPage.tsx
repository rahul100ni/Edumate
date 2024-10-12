import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RefreshCw, Settings, Music, Maximize2 } from 'lucide-react'
import { TimerSettings, defaultSettings } from './timerSettings'
import { SettingsModal } from './SettingsModal'
import { formatTime, handleNotification } from './utils'

const motivationalQuotes = [
  "Stay focused, you're doing great!",
  "Every small step counts. Keep going!",
  "You're making progress, even if you can't see it yet.",
  "Believe in yourself. You've got this!",
  "Success is the sum of small efforts repeated day in and day out.",
]

const PomodoroPage: React.FC = () => {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings)
  const [timeLeft, setTimeLeft] = useState(settings.workDuration)
  const [isActive, setIsActive] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [cycleCount, setCycleCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [quote, setQuote] = useState('')
  const [tempSettings, setTempSettings] = useState<TimerSettings>(settings)
  const [showQuote, setShowQuote] = useState(false)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)

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
    handleBackgroundMusic()
  }, [settings.backgroundMusic, settings.soundVolume])

  useEffect(() => {
    updateDocumentTitle()
  }, [timeLeft, settings.showTimeInTab])

  const handleBackgroundMusic = () => {
    if (settings.backgroundMusic) {
      backgroundMusicRef.current = new Audio('/path-to-background-music.mp3')
      backgroundMusicRef.current.loop = true
      backgroundMusicRef.current.volume = settings.soundVolume
      if (isPlayingMusic) {
        backgroundMusicRef.current.play()
      }
    } else {
      backgroundMusicRef.current?.pause()
    }
  }

  const toggleBackgroundMusic = () => {
    setIsPlayingMusic(!isPlayingMusic)
    if (isPlayingMusic) {
      backgroundMusicRef.current?.pause()
    } else {
      backgroundMusicRef.current?.play()
    }
  }

  const updateDocumentTitle = () => {
    document.title = settings.showTimeInTab
      ? `${formatTime(timeLeft)} - Pomodoro Timer`
      : 'Pomodoro Timer'
  }

  const handleTimerComplete = () => {
    playNotificationSound()
    handleNotification(isWork)
    updateTimerState()
  }

  const playNotificationSound = () => {
    if (settings.soundEnabled) {
      audioRef.current = new Audio(`/path-to-${settings.selectedSound}.mp3`)
      audioRef.current.volume = settings.soundVolume
      audioRef.current.play()
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

  const toggleTimer = () => {
    setIsActive(!isActive)
    if (isPlayingMusic) {
      if (isActive) {
        backgroundMusicRef.current?.play()
      } else {
        backgroundMusicRef.current?.pause()
      }
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsWork(true)
    setCycleCount(0)
    setTimeLeft(settings.workDuration)
    if (isPlayingMusic) {
      backgroundMusicRef.current?.pause()
    }
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
    updateTimeLeftBasedOnCurrentState(newSettings)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 dark:from-gray-900 dark:to-indigo-900 transition-colors duration-300"
    >
      <div className="w-[30rem] p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Pomodoro Timer</h2>
            <div className="flex space-x-3">
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
                <Maximize2 className={showQuote ? "text-blue-500" : "text-gray-400"} />
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
                <div className="w-72 h-72 rounded-full border-8 border-indigo-200 dark:border-indigo-800 transition-colors duration-300"></div>
              </motion.div>
              <div className="relative z-10 flex flex-col items-center justify-center w-72 h-72 mx-auto">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-8xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300"
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