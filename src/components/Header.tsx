import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Menu, X, User } from 'lucide-react'

interface HeaderProps {
  userName: string | null
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all duration-500">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors duration-300">
            <div className="bg-white rounded-full p-2 transition-transform duration-300 hover:scale-110">
              <BookOpen size={24} className="text-indigo-600" />
            </div>
            <span className="text-2xl font-bold tracking-tight">EduMate</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/pomodoro">Pomodoro</NavLink>
            <NavLink to="/todo-list">To-Do List</NavLink>
            <NavLink to="/note-taking">Notes</NavLink>
          </nav>
          <div className="flex items-center space-x-4">
            {userName && (
              <div className="flex items-center space-x-2">
                <User size={20} />
                <span className="font-medium">{userName}</span>
              </div>
            )}
            <button 
              className="md:hidden text-white hover:text-indigo-200 transition-colors duration-300"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="px-4 pt-2 pb-4 space-y-2">
            <MobileNavLink to="/" onClick={toggleMenu}>Home</MobileNavLink>
            <MobileNavLink to="/pomodoro" onClick={toggleMenu}>Pomodoro</MobileNavLink>
            <MobileNavLink to="/todo-list" onClick={toggleMenu}>To-Do List</MobileNavLink>
            <MobileNavLink to="/note-taking" onClick={toggleMenu}>Notes</MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  )
}

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link
    to={to}
    className="text-white hover:text-indigo-200 transition-colors duration-300 font-medium hover-lift"
  >
    {children}
  </Link>
)

const MobileNavLink: React.FC<{ to: string; children: React.ReactNode; onClick: () => void }> = ({ to, children, onClick }) => (
  <Link
    to={to}
    className="block text-white hover:text-indigo-200 transition-colors duration-300 font-medium"
    onClick={onClick}
  >
    {children}
  </Link>
)

export default Header