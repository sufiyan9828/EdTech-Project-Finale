import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Dashboard</Link>
      <Link to="/login">Login</Link>
    </nav>
  )
}

export default Navbar