import { useState } from 'react'
// Remove useNavigate since we are using window.location for the hard refresh
// import { useNavigate } from 'react-router-dom' 

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log("Attempting login for:", username)

    try {
      // 1. Get Token
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

      // 2. Save Token
      console.log("Token received:", data.access)
      localStorage.setItem('access_token', data.access)

      // 3. Get Profile (to check Role)
      const profileRes = await fetch('http://127.0.0.1:8000/accounts/api/profile/', {
        headers: { 'Authorization': `Bearer ${data.access}` }
      })

      const profile = await profileRes.json()
      console.log("Profile received:", profile)

      // 4. Save Role
      // Logic: If profile.user_type is empty (like for old admins), default to 'S' (Student)
      // UNLESS you just fixed it in Step 1, then it will be 'I'
      // ... inside handleLogin, right after saving the token ...

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('user_role', profile.user_type || 'S')

      // <--- ADD THIS LINE: Tell the app we logged in
      window.dispatchEvent(new Event("storage"))

      navigate('/')

      // 5. HARD REFRESH (Fixes the Navbar/UI issue)
      window.location.href = '/'

    } catch (error) {
      console.error("Network Error:", error)
      alert("Network Error. Check console.")
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
    </div>
  )
}

export default Login