import React from 'react'
import { X } from 'lucide-react'
import { TimerSettings } from './timerSettings'

interface SettingsModalProps {
  tempSettings: TimerSettings;
  updateTempSetting: <K extends keyof TimerSettings>(key: K, value: TimerSettings[K]) => void;
  saveSettings: () => void;
  closeSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  tempSettings,
  updateTempSetting,
  saveSettings,
  closeSettings,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Settings</h3>
          <button
            onClick={closeSettings}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-6">
          <TimerDurationSettings tempSettings={tempSettings} updateTempSetting={updateTempSetting} />
          <SoundSettings tempSettings={tempSettings} updateTempSetting={updateTempSetting} />
          <BehaviorSettings tempSettings={tempSettings} updateTempSetting={updateTempSetting} />
          <button
            onClick={saveSettings}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-300"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

const TimerDurationSettings: React.FC<{ tempSettings: TimerSettings; updateTempSetting: SettingsModalProps['updateTempSetting'] }> = ({ tempSettings, updateTempSetting }) => (
  <div>
    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Timer Durations</h4>
    <div className="space-y-2">
      <DurationInput label="Work Duration" value={tempSettings.workDuration} onChange={(value) => updateTempSetting('workDuration', value)} />
      <DurationInput label="Short Break Duration" value={tempSettings.shortBreakDuration} onChange={(value) => updateTempSetting('shortBreakDuration', value)} />
      <DurationInput label="Long Break Duration" value={tempSettings.longBreakDuration} onChange={(value) => updateTempSetting('longBreakDuration', value)} />
      <DurationInput label="Sessions Before Long Break" value={tempSettings.sessionsBeforeLongBreak} onChange={(value) => updateTempSetting('sessionsBeforeLongBreak', value)} isMinutes={false} />
    </div>
  </div>
)

const DurationInput: React.FC<{ label: string; value: number; onChange: (value: number) => void; isMinutes?: boolean }> = ({ label, value, onChange, isMinutes = true }) => {
  const [inputValue, setInputValue] = React.useState(isMinutes ? Math.floor(value / 60).toString() : value.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue === '') {
      onChange(getDefaultValue());
    } else {
      const numValue = parseInt(newValue, 10);
      if (!isNaN(numValue) && numValue > 0) {
        onChange(isMinutes ? numValue * 60 : numValue);
      }
    }
  };

  const getDefaultValue = () => {
    if (isMinutes) {
      switch (label) {
        case "Work Duration": return 25 * 60;
        case "Short Break Duration": return 5 * 60;
        case "Long Break Duration": return 15 * 60;
        default: return 25 * 60;
      }
    }
    return 4;
  };

  const getPlaceholder = () => {
    if (isMinutes) {
      switch (label) {
        case "Work Duration": return "25";
        case "Short Break Duration": return "5";
        case "Long Break Duration": return "15";
        default: return "25";
      }
    }
    return "4";
  };

  return (
    <label className="block">
      <span className="text-gray-700 dark:text-gray-300">{label} {isMinutes ? "(minutes)" : ""}</span>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={getPlaceholder()}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </label>
  )
}

const SoundSettings: React.FC<{ tempSettings: TimerSettings; updateTempSetting: SettingsModalProps['updateTempSetting'] }> = ({ tempSettings, updateTempSetting }) => (
  <div>
    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Sound Settings</h4>
    <div className="space-y-2">
      <Checkbox label="Enable Sounds" checked={tempSettings.soundEnabled} onChange={(value) => updateTempSetting('soundEnabled', value)} />
      <SoundSelector value={tempSettings.selectedSound} onChange={(value) => updateTempSetting('selectedSound', value)} />
    </div>
  </div>
)

const BehaviorSettings: React.FC<{ tempSettings: TimerSettings; updateTempSetting: SettingsModalProps['updateTempSetting'] }> = ({ tempSettings, updateTempSetting }) => (
  <div>
    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Behavior Settings</h4>
    <div className="space-y-2">
      <Checkbox label="Auto-start Breaks" checked={tempSettings.autoStartBreaks} onChange={(value) => updateTempSetting('autoStartBreaks', value)} />
      <Checkbox label="Auto-start Pomodoros" checked={tempSettings.autoStartPomodoros} onChange={(value) => updateTempSetting('autoStartPomodoros', value)} />
      <Checkbox label="Show Time in Browser Tab" checked={tempSettings.showTimeInTab} onChange={(value) => updateTempSetting('showTimeInTab', value)} />
      <Checkbox label="Enable Desktop Notifications" checked={tempSettings.desktopNotifications} onChange={(value) => updateTempSetting('desktopNotifications', value)} />
    </div>
  </div>
)

const Checkbox: React.FC<{ label: string; checked: boolean; onChange: (value: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
    />
    <span className="ml-2 text-gray-700 dark:text-gray-300">{label}</span>
  </label>
)

const VolumeSlider: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => (
  <label className="block">
    <span className="text-gray-700 dark:text-gray-300">Volume</span>
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-1 block w-full"
    />
  </label>
)

const SoundSelector: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => (
  <label className="block">
    <span className="text-gray-700 dark:text-gray-300">Notification Sound</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      <option value="bell">Bell</option>
      <option value="chime">Chime</option>
      <option value="gong">Gong</option>
    </select>
  </label>
)