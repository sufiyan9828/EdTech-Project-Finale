import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate() // Hook to move pages

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/jwt/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('access_token', data.access)
        navigate('/') // Redirect to Dashboard on success
      } else {
        alert("Login Failed")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <div>
      <h2>Login Page</h2>
      <form onSubmit={handleLogin}>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} /><br/>
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br/>
        <button type="submit">Log In</button>
      </form>
    </div>
  )
}

export default Login