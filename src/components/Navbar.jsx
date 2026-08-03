import { FileText, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('briefwise-theme')
    const defaultTheme = storedTheme || 'light'
    setTheme(defaultTheme)
    document.documentElement.classList.toggle('dark', defaultTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    window.localStorage.setItem('briefwise-theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  return <nav className="site-nav"><div><Link to="/" className="brand"><span><FileText size={19}/></span>BriefWise</Link><div className="nav-links">{user && <NavLink to="/dashboard">Workspace</NavLink>}</div><div className="nav-account"><button type="button" className="theme-toggle-button" onClick={toggleTheme} aria-label="Toggle dark theme">{theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}</button>{user ? <><span className="user-email">{user.email}</span><button onClick={logout}>Sign out</button></> : <Link className="nav-cta" to="/login">Sign in</Link>}</div></div></nav>
}
