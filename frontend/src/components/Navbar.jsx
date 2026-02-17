import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const [token, setToken] = useState(localStorage.getItem('access_token'))
  const [role, setRole] = useState(localStorage.getItem('user_role'))

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('access_token'))
      setRole(localStorage.getItem('user_role'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    window.dispatchEvent(new Event("storage"))
    navigate('/login')
  }

  return (
    <nav style={{ padding: '15px 30px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* 1. FIXED BRAND MARGIN */}
      <div style={{ fontWeight: 'bold', fontSize: '1.4em', marginRight: '40px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>EdTech Platform</Link>
      </div>

      {/* 2. FLEX CONTAINER FOR LINKS (Fixes collision and alignment) */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#ccc', textDecoration: 'none' }}>Catalog</Link>

        {/* 3. RBAC FIX: Only Students see "My Learning" */}
        {token && role !== 'I' && (
          <Link to="/my-courses" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>My Learning</Link>
        )}

        {token ? (
          <>
            {role === 'I' && (
              <Link to="/instructor/dashboard" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #FFD700', padding: '5px 10px', borderRadius: '4px' }}>
                ⚡ Instructor Studio
              </Link>
            )}

            <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
              👤 Profile
            </Link>
            <button onClick={handleLogout} style={{ background: '#ff4d4d', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: '#4dabf7', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar