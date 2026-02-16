import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function InstructorCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'development', // Default
    price: '',
    start_date: '',
    end_date: ''
  })
  const [image, setImage] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('access_token')

    // We must use FormData because we are sending a File (Image)
    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (image) data.append('image', image)

    try {
      const response = await fetch('http://127.0.0.1:8000/courses/api/create-course/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Do NOT set Content-Type
        body: data
      })

      if (response.ok) {
        // ... inside if (response.ok) ...

        alert("Course Created Successfully!")
        navigate('/instructor/dashboard') // <--- CHANGE THIS (Was '/')
      } else {
        const err = await response.json()
        alert("Error: " + JSON.stringify(err))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>⚡ Create New Course</h2>
      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: '15px' }}>
          <label>Title</label>
          <input name="title" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '8px' }} required />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description</label>
          <textarea name="description" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '8px', height: '100px' }} required />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label>Price ($)</label>
            <input type="number" name="price" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '8px' }} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Category</label>
            <select name="category" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '8px' }}>
              <option value="development">Development</option>
              <option value="business">Business</option>
              <option value="design">Design</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label>Start Date</label>
            <input type="date" name="start_date" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '8px' }} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>End Date</label>
            <input type="date" name="end_date" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '8px' }} required />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Cover Image</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} style={{ display: 'block', marginTop: '5px' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#FFD700', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🚀 Launch Course
        </button>

      </form>
    </div>
  )
}

export default InstructorCreate