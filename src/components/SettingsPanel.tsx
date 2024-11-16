import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, Bell, Monitor, Clock, Sun, Moon } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
)

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings()

  const handleSoundVolumeChange = (value: number) => {
    updateSettings({ soundVolume: value })
  }

  const handleBackgroundMusicVolumeChange = (value: number) => {
    updateSettings({ backgroundMusicVolume: value })
  }

  const handleTimerDurationChange = (key: 'workDuration' | 'shortBreakDuration' | 'longBreakDuration', minutes: number) => {
    if (minutes > 0) {
      const seconds = minutes * 60
      updateSettings({ [key]: seconds })
    }
  }

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      resetSettings()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
        <button
          onClick={handleResetSettings}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
        >
          Reset to Defaults
        </button>
      </div>

      <SettingsSection title="Theme">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            {settings.darkMode ? <Moon className="text-yellow-500" /> : <Sun className="text-yellow-500" />}
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Sound Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Enable Sounds</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Sound
            </label>
            <select
              value={settings.selectedSound}
              onChange={(e) => updateSettings({ selectedSound: e.target.value as 'bell' | 'chime' | 'gong' })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="bell">Bell</option>
              <option value="chime">Chime</option>
              <option value="gong">Gong</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sound Volume
            </label>
            <div className="flex items-center">
              <Volume2 className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume}
                onChange={(e) => handleSoundVolumeChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Background Music</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backgroundMusic}
                onChange={(e) => updateSettings({ backgroundMusic: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {settings.backgroundMusic && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Music Volume
              </label>
              <div className="flex items-center">
                <Volume2 className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.backgroundMusicVolume}
                  onChange={(e) => handleBackgroundMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Timer Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={Math.floor(settings.workDuration / 60)}
              onChange={(e) => handleTimerDurationChange('workDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Short Break (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={Math.floor(settings.shortBreakDuration / 60)}
              onChange={(e) => handleTimerDurationChange('shortBreakDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Long Break (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={Math.floor(settings.longBreakDuration / 60)}
              onChange={(e) => handleTimerDurationChange('longBreakDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sessions Before Long Break
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.sessionsBeforeLongBreak}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (value > 0) {
                  updateSettings({ sessionsBeforeLongBreak: value })
                }
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Auto-start Breaks</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Auto-start Work Sessions</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoStartPomodoros}
                onChange={(e) => updateSettings({ autoStartPomodoros: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Notification Settings">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Desktop Notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.desktopNotifications}
              onChange={(e) => updateSettings({ desktopNotifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </SettingsSection>

      <SettingsSection title="Display Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Show Time in Browser Tab</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showTimeInTab}
                onChange={(e) => updateSettings({ showTimeInTab: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Show Motivational Quotes</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showMotivationalQuotes}
                onChange={(e) => updateSettings({ showMotivationalQuotes: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}

export default SettingsPanel