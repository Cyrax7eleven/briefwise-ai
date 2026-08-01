import { FileText } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  return <nav className="site-nav"><div><Link to="/" className="brand"><span><FileText size={19}/></span>BriefWise</Link><div className="nav-links">{user && <NavLink to="/dashboard">Workspace</NavLink>}</div><div className="nav-account">{user ? <><span className="user-email">{user.email}</span><button onClick={logout}>Sign out</button></> : <Link className="nav-cta" to="/login">Sign in</Link>}</div></div></nav>
}
