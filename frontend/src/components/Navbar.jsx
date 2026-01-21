import { Link } from 'react-router-dom'

function Navbar() {
  const token = localStorage.getItem('access_token')

  return (
    <nav style={{ padding: '15px 20px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>EdTech Platform</Link>
      </div>

      <div>
        {/* Public Catalog Link */}
        <Link to="/" style={{ color: '#ccc', textDecoration: 'none', marginRight: '20px' }}>Catalog</Link>

        {/* Student Links (Only if logged in) */}
        {token && (
          <Link to="/my-courses" style={{ color: 'white', textDecoration: 'none', marginRight: '20px', fontWeight: 'bold' }}>My Learning</Link>
        )}

        {/* Profile / Logout Logic */}
        {token ? (
          <>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none', marginRight: '20px', fontWeight: 'bold' }}>
              👤 Profile
            </Link>
            <Link to="/login" onClick={() => localStorage.removeItem('access_token')} style={{ color: '#ff6b6b', textDecoration: 'none' }}>
              Logout
            </Link>
          </>
        ) : (
          <Link to="/login" style={{ color: '#4dabf7', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar