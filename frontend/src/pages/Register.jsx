import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    re_password: '',
    user_type: 'S'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.re_password) {
      alert("Passwords do not match!")
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert("Account Created! Please Log In.")
        navigate('/login')
      } else {
        const data = await response.json()
        alert("Error: " + JSON.stringify(data))
      }
    } catch (error) {
      alert("Network Error")
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2 style={{ textAlign: 'center' }}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />

        <select name="user_type" onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}>
          <option value="S">Student</option>
          <option value="I">Instructor</option>
        </select>

        <input name="password" type="password" placeholder="Password" onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input name="re_password" type="password" placeholder="Confirm Password" onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: '20px', padding: '8px' }} required />

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Register</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default Register