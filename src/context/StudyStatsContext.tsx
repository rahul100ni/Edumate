import React, { createContext, useContext, useState, useEffect } from 'react'

interface StudySession {
  id: string
  date: string
  duration: number
  type: 'work' | 'break'
  category?: string
  completed: boolean
}

interface DailyStats {
  date: string
  totalDuration: number
  sessionsCompleted: number
  totalSessions: number
}

interface CategoryStats {
  category: string
  totalDuration: number
  sessionsCompleted: number
}

interface StudyStatsContextType {
  sessions: StudySession[]
  addSession: (session: Omit<StudySession, 'id'>) => void
  getDailyStats: (days: number) => DailyStats[]
  getCategoryStats: () => CategoryStats[]
  getCurrentStreak: () => number
  getTodayStats: () => DailyStats
  resetStats: () => void
}

const StudyStatsContext = createContext<StudyStatsContextType | undefined>(undefined)

export const StudyStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('studySessions')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('studySessions', JSON.stringify(sessions))
  }, [sessions])

  const addSession = (session: Omit<StudySession, 'id'>) => {
    const newSession = {
      ...session,
      id: Date.now().toString()
    }
    setSessions(prev => [...prev, newSession])
  }

  const getDailyStats = (days: number): DailyStats[] => {
    const stats: { [key: string]: DailyStats } = {}
    const today = new Date()
    
    // Initialize stats for last n days
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      stats[dateStr] = {
        date: dateStr,
        totalDuration: 0,
        sessionsCompleted: 0,
        totalSessions: 0
      }
    }

    // Fill in actual data
    sessions.forEach(session => {
      if (stats[session.date]) {
        stats[session.date].totalDuration += session.duration
        stats[session.date].totalSessions += 1
        if (session.completed) {
          stats[session.date].sessionsCompleted += 1
        }
      }
    })

    return Object.values(stats).sort((a, b) => a.date.localeCompare(b.date))
  }

  const getCategoryStats = (): CategoryStats[] => {
    const stats: { [key: string]: CategoryStats } = {}

    sessions.forEach(session => {
      const category = session.category || 'Uncategorized'
      if (!stats[category]) {
        stats[category] = {
          category,
          totalDuration: 0,
          sessionsCompleted: 0
        }
      }
      stats[category].totalDuration += session.duration
      if (session.completed) {
        stats[category].sessionsCompleted += 1
      }
    })

    return Object.values(stats)
  }

  const getCurrentStreak = (): number => {
    const dailyStats = getDailyStats(30)
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    for (let i = 0; i < dailyStats.length; i++) {
      const currentDate = dailyStats[i].date
      const expectedDate = new Date()
      expectedDate.setDate(new Date(today).getDate() - i)
      const expectedDateStr = expectedDate.toISOString().split('T')[0]
      
      if (currentDate === expectedDateStr && dailyStats[i].sessionsCompleted > 0) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const getTodayStats = (): DailyStats => {
    const today = new Date().toISOString().split('T')[0]
    return getDailyStats(1).find(stat => stat.date === today) || {
      date: today,
      totalDuration: 0,
      sessionsCompleted: 0,
      totalSessions: 0
    }
  }

  const resetStats = () => {
    setSessions([])
    localStorage.removeItem('studySessions')
  }

  return (
    <StudyStatsContext.Provider value={{
      sessions,
      addSession,
      getDailyStats,
      getCategoryStats,
      getCurrentStreak,
      getTodayStats,
      resetStats
    }}>
      {children}
    </StudyStatsContext.Provider>
  )
}

export const useStudyStats = () => {
  const context = useContext(StudyStatsContext)
  if (context === undefined) {
    throw new Error('useStudyStats must be used within a StudyStatsProvider')
  }
  return context
}