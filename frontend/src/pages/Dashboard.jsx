import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseList from '../components/CourseList' // <--- IMPORT THIS

function Dashboard() {
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    fetch('http://127.0.0.1:8000/api/test/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessage(data.message))
  }, [])

  return (
    // Change maxWidth to '1400px'
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Course Catalog</h1>
      <p>Welcome back! (Backend Status: {message})</p>

      <hr style={{ margin: '30px 0' }} />

      {/* <--- USE THE COMPONENT HERE */}
      <CourseList />

    </div>
  )
}

export default Dashboard