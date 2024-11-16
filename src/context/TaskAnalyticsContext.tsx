import React, { createContext, useContext, useState, useEffect } from 'react'

interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  highPriorityCompleted: number
  mediumPriorityCompleted: number
  lowPriorityCompleted: number
  deadlinesMet: number
  deadlinesMissed: number
  productiveHours: { [hour: number]: number }
  productiveDays: { [day: string]: number }
  categoryCompletion: { [category: string]: number }
}

interface TaskAnalyticsContextType {
  analytics: TaskAnalytics
  updateTaskCompletion: (task: any) => void
  resetAnalytics: () => void
}

const defaultAnalytics: TaskAnalytics = {
  totalTasks: 0,
  completedTasks: 0,
  highPriorityCompleted: 0,
  mediumPriorityCompleted: 0,
  lowPriorityCompleted: 0,
  deadlinesMet: 0,
  deadlinesMissed: 0,
  productiveHours: {},
  productiveDays: {},
  categoryCompletion: {}
}

const TaskAnalyticsContext = createContext<TaskAnalyticsContextType | undefined>(undefined)

export const TaskAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analytics, setAnalytics] = useState<TaskAnalytics>(() => {
    const saved = localStorage.getItem('taskAnalytics')
    return saved ? JSON.parse(saved) : defaultAnalytics
  })

  useEffect(() => {
    localStorage.setItem('taskAnalytics', JSON.stringify(analytics))
  }, [analytics])

  const updateTaskCompletion = (task: any) => {
    setAnalytics(prev => {
      const hour = new Date().getHours()
      const day = new Date().toLocaleDateString('en-US', { weekday: 'long' })
      
      const hourCount = prev.productiveHours[hour] || 0
      const dayCount = prev.productiveDays[day] || 0
      const categoryCount = prev.categoryCompletion[task.category] || 0

      const isDeadlineMet = task.dueDate ? new Date(task.dueDate) >= new Date() : true

      return {
        ...prev,
        totalTasks: prev.totalTasks + 1,
        completedTasks: task.completed ? prev.completedTasks + 1 : prev.completedTasks,
        highPriorityCompleted: task.priority === 'high' && task.completed ? 
          prev.highPriorityCompleted + 1 : prev.highPriorityCompleted,
        mediumPriorityCompleted: task.priority === 'medium' && task.completed ? 
          prev.mediumPriorityCompleted + 1 : prev.mediumPriorityCompleted,
        lowPriorityCompleted: task.priority === 'low' && task.completed ? 
          prev.lowPriorityCompleted + 1 : prev.lowPriorityCompleted,
        deadlinesMet: isDeadlineMet && task.completed ? prev.deadlinesMet + 1 : prev.deadlinesMet,
        deadlinesMissed: !isDeadlineMet && task.completed ? prev.deadlinesMissed + 1 : prev.deadlinesMissed,
        productiveHours: {
          ...prev.productiveHours,
          [hour]: task.completed ? hourCount + 1 : hourCount
        },
        productiveDays: {
          ...prev.productiveDays,
          [day]: task.completed ? dayCount + 1 : dayCount
        },
        categoryCompletion: {
          ...prev.categoryCompletion,
          [task.category]: task.completed ? categoryCount + 1 : categoryCount
        }
      }
    })
  }

  const resetAnalytics = () => {
    setAnalytics(defaultAnalytics)
    localStorage.removeItem('taskAnalytics')
  }

  return (
    <TaskAnalyticsContext.Provider value={{ analytics, updateTaskCompletion, resetAnalytics }}>
      {children}
    </TaskAnalyticsContext.Provider>
  )
}

export const useTaskAnalytics = () => {
  const context = useContext(TaskAnalyticsContext)
  if (context === undefined) {
    throw new Error('useTaskAnalytics must be used within a TaskAnalyticsProvider')
  }
  return context
}