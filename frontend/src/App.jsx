import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('')
  const [token, setToken] = useState(localStorage.getItem('access_token')) // Check if we already have a key
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // 1. Try to fetch the "Secret Message" whenever the token changes
  useEffect(() => {
    if (token) {
      fetch('http://127.0.0.1:8000/api/test/', {
        headers: {
          'Authorization': `Bearer ${token}` // This is how we show the ID Card
        }
      })
      .then(response => {
        if (response.ok) return response.json()
        throw new Error("Token invalid or expired")
      })
      .then(data => setMessage(data.message))
      .catch(error => {
        console.error(error)
        setMessage("Session expired. Please log in again.")
        setToken(null) // Clear invalid token
      });
    }
  }, [token])

  // 2. Handle the Login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault() // Stop page reload
    
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/jwt/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Success! We got the keys.
        console.log("Login Success:", data)
        setToken(data.access)
        localStorage.setItem('access_token', data.access) // Save it for later
      } else {
        alert("Login Failed: " + JSON.stringify(data))
      }
    } catch (error) {
      console.error("Network Error:", error)
    }
  }

  // 3. Logout Helper
  const handleLogout = () => {
    setToken(null)
    setMessage('')
    localStorage.removeItem('access_token')
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>EdTech Auth System</h1>

      {!token ? (
        // SHOW THIS IF NOT LOGGED IN
        <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
          <h3>Please Log In</h3>
          <div>
            <label>Username: </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Password: </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" style={{ marginTop: '15px' }}>Get Token</button>
        </form>
      ) : (
        // SHOW THIS IF LOGGED IN
        <div>
          <h2 style={{ color: 'green' }}>Access Granted</h2>
          <p>Backend says: <strong>{message}</strong></p>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </div>
  )
}

export default App