import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Database, Zap, BarChart3, BookOpen, Sun, Moon, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const [isLight, setIsLight] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsLight(true)
      document.documentElement.classList.add('light')
    }
  }, [])

  const toggleTheme = () => {
    const nextValue = !isLight
    setIsLight(nextValue)
    if (nextValue) {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    }
  }

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Analytics', path: '/dashboard', icon: <BarChart3 size={16} /> },
    { name: 'Imputation', path: '/results', icon: <Zap size={16} /> },
    { name: 'Docs', path: '/documentation', icon: <BookOpen size={16} /> },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="p-2 bg-gradient-to-br from-brand to-brand-dark rounded-xl text-slate-950 shadow-lg shadow-brand/20"
            >
              <Database size={24} />
            </motion.div>
            <span className="text-2xl font-black tracking-tighter text-white">
              ImpuTech<span className="text-brand"> AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                className={`relative py-1 text-sm font-bold transition-all flex items-center gap-2 ${
                  location.pathname === link.path ? 'text-brand' : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.icon}
                {link.name}
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-brand transition-all hover:border-brand/30 shadow-xl"
              title="Toggle Theme"
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            <Link 
              to="/" 
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block px-6 py-2.5 btn-premium text-white text-xs font-black uppercase tracking-widest shadow-brand/20"
            >
              Analyze Data
            </Link>

            <button 
              className="md:hidden p-2 text-slate-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    location.pathname === link.path ? 'bg-brand/10 text-brand border border-brand/20' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
