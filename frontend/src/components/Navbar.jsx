import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  // Use State so React knows to re-render when this changes
  const [token, setToken] = useState(localStorage.getItem('access_token'))

  // Listen for login/logout events
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('access_token'))
    }

    // Listen to our custom event (and standard storage events)
    window.addEventListener('storage', handleStorageChange)

    // Cleanup when component unmounts
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    // Trigger the update immediately
    window.dispatchEvent(new Event("storage"))
    navigate('/login')
  }

  return (
    <nav style={{ padding: '15px 20px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>EdTech Platform</Link>
      </div>

      <div>
        <Link to="/" style={{ color: '#ccc', textDecoration: 'none', marginRight: '20px' }}>Catalog</Link>

        {token && (
          <Link to="/my-courses" style={{ color: 'white', textDecoration: 'none', marginRight: '20px', fontWeight: 'bold' }}>My Learning</Link>
        )}

        {token ? (
          <>
            {/* NEW: Instructor Link (Only visible if you are an Instructor) */}
            {localStorage.getItem('user_role') === 'I' && (
              <Link to="/instructor/create" style={{ color: '#FFD700', textDecoration: 'none', marginRight: '20px', fontWeight: 'bold' }}>
                ⚡ Instructor Studio
              </Link>
            )}

            <Link to="/profile" style={{ color: 'white', textDecoration: 'none', marginRight: '20px', fontWeight: 'bold' }}>
              👤 Profile
            </Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1em' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: '#4dabf7', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar