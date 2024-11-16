import React from 'react'
import { Clock, TrendingUp } from 'lucide-react'
import { useStudyStats } from '../context/StudyStatsContext'

const QuickStats: React.FC = () => {
  const { getTodayStats, getCurrentStreak } = useStudyStats()
  
  const todayStats = getTodayStats()
  const currentStreak = getCurrentStreak()

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center text-white">
        <Clock size={16} className="mr-1" />
        <span className="text-sm">Today: {todayStats.totalDuration}min</span>
      </div>
      <div className="flex items-center text-white">
        <TrendingUp size={16} className="mr-1" />
        <span className="text-sm">Streak: {currentStreak} days</span>
      </div>
    </div>
  )
}

export default QuickStats