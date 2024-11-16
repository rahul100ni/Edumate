import React, { createContext, useContext, useState, useEffect } from 'react'

interface Settings {
  // Theme settings
  darkMode: boolean
  
  // Sound settings
  soundEnabled: boolean
  soundVolume: number
  selectedSound: 'bell' | 'chime' | 'gong'
  backgroundMusic: boolean
  backgroundMusicVolume: number
  
  // Timer settings
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  
  // Notification settings
  desktopNotifications: boolean
  
  // Display settings
  showTimeInTab: boolean
  showMotivationalQuotes: boolean
  compactMode: boolean
}

const defaultSettings: Settings = {
  darkMode: true,
  soundEnabled: true,
  soundVolume: 0.5,
  selectedSound: 'bell',
  backgroundMusic: false,
  backgroundMusicVolume: 0.3,
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  desktopNotifications: true,
  showTimeInTab: true,
  showMotivationalQuotes: false,
  compactMode: false,
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  resetSettings: () => void
  requestNotificationPermission: () => Promise<boolean>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('appSettings')
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings
  })

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    
    // Apply theme
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Apply other global settings as needed
    document.title = settings.showTimeInTab ? 'EduMate' : 'Study Session'
  }, [settings])

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings,
      requestNotificationPermission 
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export { defaultSettings }
export type { Settings }