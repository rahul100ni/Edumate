import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

interface SettingsModalProps {
  closeSettings: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ closeSettings }) => {
  const { settings, updateSettings } = useSettings()
  const [tempSettings, setTempSettings] = useState({
    workDuration: '',
    shortBreakDuration: '',
    longBreakDuration: '',
    sessionsBeforeLongBreak: ''
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize temp settings with current values
    setTempSettings({
      workDuration: Math.floor(settings.workDuration / 60).toString(),
      shortBreakDuration: Math.floor(settings.shortBreakDuration / 60).toString(),
      longBreakDuration: Math.floor(settings.longBreakDuration / 60).toString(),
      sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak.toString()
    })
  }, [settings])

  const handleSave = () => {
    // Apply default values if fields are empty
    const workDuration = tempSettings.workDuration === '' ? 25 : parseInt(tempSettings.workDuration)
    const shortBreak = tempSettings.shortBreakDuration === '' ? 5 : parseInt(tempSettings.shortBreakDuration)
    const longBreak = tempSettings.longBreakDuration === '' ? 15 : parseInt(tempSettings.longBreakDuration)
    const sessions = tempSettings.sessionsBeforeLongBreak === '' ? 4 : parseInt(tempSettings.sessionsBeforeLongBreak)

    updateSettings({
      workDuration: workDuration * 60,
      shortBreakDuration: shortBreak * 60,
      longBreakDuration: longBreak * 60,
      sessionsBeforeLongBreak: sessions
    })
    closeSettings()
  }

  const handleInputChange = (field: string, value: string) => {
    // Allow empty values and only positive numbers
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setTempSettings(prev => ({ ...prev, [field]: value }))
    }
  }

  const previewSound = (sound: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    audioRef.current = new Audio(`/sounds/${sound}.mp3`)
    audioRef.current.volume = settings.soundVolume
    audioRef.current.play().catch(error => console.error("Error playing sound:", error))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Timer Settings</h3>
          <button
            onClick={closeSettings}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Timer Durations */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Timer Durations</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="text"
                  value={tempSettings.workDuration}
                  onChange={(e) => handleInputChange('workDuration', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="text"
                  value={tempSettings.shortBreakDuration}
                  onChange={(e) => handleInputChange('shortBreakDuration', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="text"
                  value={tempSettings.longBreakDuration}
                  onChange={(e) => handleInputChange('longBreakDuration', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sessions Before Long Break
                </label>
                <input
                  type="text"
                  value={tempSettings.sessionsBeforeLongBreak}
                  onChange={(e) => handleInputChange('sessionsBeforeLongBreak', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="4"
                />
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Sound Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Enable Sounds</span>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <label
                    htmlFor="soundEnabled"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      settings.soundEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Sound
                </label>
                <select
                  value={settings.selectedSound}
                  onChange={(e) => {
                    const newSound = e.target.value as 'bell' | 'chime' | 'gong'
                    updateSettings({ selectedSound: newSound })
                    previewSound(newSound)
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="bell">Bell</option>
                  <option value="chime">Chime</option>
                  <option value="gong">Gong</option>
                </select>
              </div>
            </div>
          </div>

          {/* Behavior Settings */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Behavior Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Auto-start Breaks</span>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    id="autoStartBreaks"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <label
                    htmlFor="autoStartBreaks"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      settings.autoStartBreaks ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        settings.autoStartBreaks ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Auto-start Work Sessions</span>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    id="autoStartPomodoros"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => updateSettings({ autoStartPomodoros: e.target.checked })}
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <label
                    htmlFor="autoStartPomodoros"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      settings.autoStartPomodoros ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        settings.autoStartPomodoros ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Show Time in Browser Tab</span>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    id="showTimeInTab"
                    checked={settings.showTimeInTab}
                    onChange={(e) => updateSettings({ showTimeInTab: e.target.checked })}
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <label
                    htmlFor="showTimeInTab"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      settings.showTimeInTab ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        settings.showTimeInTab ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-300"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal