export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  selectedSound: string;
  focusMode: boolean;
  backgroundMusic: boolean;
  showTimeInTab: boolean;
  desktopNotifications: boolean;
}

export const defaultSettings: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: true,
  soundEnabled: true,
  soundVolume: 0.5,
  selectedSound: 'bell',
  focusMode: false,
  backgroundMusic: false,
  showTimeInTab: true,
  desktopNotifications: true,
}