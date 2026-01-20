import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login') // Kick user out if no token
      return
    }

    // Fetch the secret message
    fetch('http://127.0.0.1:8000/api/test/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setMessage(data.message))
  }, [])

  return (
    <div>
      <h1>Student Dashboard</h1>
      <p>Secret Message: {message}</p>
    </div>
  )
}

export default Dashboard