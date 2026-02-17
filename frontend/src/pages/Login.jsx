import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom' // <--- 1. Import this

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // vvvvv THIS IS THE MISSING LINE vvvvv
  const navigate = useNavigate()
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log("Attempting login for:", username)

    try {
      // 1. Get the Token
      const response = await fetch('http://127.0.0.1:8000/auth/jwt/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        alert("Login Failed: " + JSON.stringify(data))
        return
      }

      // 2. Token Success - Save it
      console.log("Token received:", data.access)
      localStorage.setItem('access_token', data.access)

      // 3. Get the User Role (Profile)
      const profileRes = await fetch('http://127.0.0.1:8000/accounts/api/profile/', {
        headers: { 'Authorization': `Bearer ${data.access}` }
      })

      if (!profileRes.ok) {
        // Fallback if profile fails
        localStorage.setItem('user_role', 'S')
      } else {
        const profile = await profileRes.json()
        console.log("Profile received:", profile)
        // 4. Save Role
        localStorage.setItem('user_role', profile.user_type || 'S')
      }

      // 5. Force Navbar Update & Redirect
      window.dispatchEvent(new Event("storage"))
      navigate('/') // <--- This will now work

    } catch (error) {
      console.error("Login Error:", error)
      alert("Something went wrong. Check console.")
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Log In
        </button>
      </form>
      {/* // ... inside the return div, at the bottom ... */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Don't have an account?</p>
        <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
          Create New Account
        </Link>
      </div>
    </div>
  )
}

export default Login