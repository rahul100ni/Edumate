import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Menu, X, User } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import QuickStats from './QuickStats'

interface HeaderProps {
  userName: string | null
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const { settings } = useSettings()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleDashboardClick = () => {
    navigate('/dashboard')
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all duration-500">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors duration-300">
            <div className="bg-white rounded-full p-2 transition-transform duration-300 hover:scale-110">
              <BookOpen size={24} className="text-indigo-600" />
            </div>
            <span className="text-2xl font-bold tracking-tight">EduMate</span>
          </Link>

          {/* Quick Stats - Only show on larger screens and when user exists */}
          {userName && (
            <div className="hidden md:block">
              <QuickStats />
            </div>
          )}

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/pomodoro" className="hover:text-indigo-200 transition-colors duration-200">
              Pomodoro Timer
            </Link>
            <Link to="/todo-list" className="hover:text-indigo-200 transition-colors duration-200">
              Todo List
            </Link>
            <Link to="/note-taking" className="hover:text-indigo-200 transition-colors duration-200">
              Notes
            </Link>
            <div className="relative group">
              <button
                onClick={handleDashboardClick}
                className="flex items-center space-x-1 hover:text-indigo-200 transition-colors duration-200"
              >
                <User className="h-5 w-5" />
                <span>{userName || 'Dashboard'}</span>
              </button>
            </div>
          </nav>

          {/* Mobile menu button and profile */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Mobile Profile Button */}
            {userName && (
              <button
                onClick={handleDashboardClick}
                className="flex items-center space-x-1 hover:text-indigo-200 transition-colors duration-200"
              >
                <User className="h-5 w-5" />
              </button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <nav className="flex flex-col space-y-2 pt-4 pb-2">
            {userName && (
              <div className="px-4 py-2 border-b border-indigo-500">
                <QuickStats />
              </div>
            )}
            <Link
              to="/pomodoro"
              className="px-4 py-2 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Pomodoro Timer
            </Link>
            <Link
              to="/todo-list"
              className="px-4 py-2 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Todo List
            </Link>
            <Link
              to="/note-taking"
              className="px-4 py-2 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Notes
            </Link>
            <button
              onClick={handleDashboardClick}
              className="flex items-center space-x-1 px-4 py-2 hover:bg-indigo-700 rounded-lg transition-colors duration-200 text-left w-full"
            >
              <User className="h-5 w-5" />
              <span>{userName || 'Dashboard'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
