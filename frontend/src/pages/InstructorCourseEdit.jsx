import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

function InstructorCourseEdit() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [moduleTitle, setModuleTitle] = useState('')

  const fetchCourse = () => {
    const token = localStorage.getItem('access_token')
    fetch(`http://127.0.0.1:8000/courses/api/teacher-courses/${id}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCourse(data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchCourse()
  }, [id])

  // --- HANDLER: Create Module ---
  const handleCreateModule = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch('http://127.0.0.1:8000/courses/api/modules/', { // We will create this API next
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course: id,
          title: moduleTitle
        })
      })

      if (response.ok) {
        setModuleTitle('')
        fetchCourse() // Refresh the list
      } else {
        alert("Error creating module")
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (!course) return <div style={{ padding: '20px' }}>Loading Studio...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <div>
          <h4 style={{ color: '#888', margin: 0 }}>COURSE MANAGER</h4>
          <h1 style={{ margin: '5px 0' }}>{course.title}</h1>
        </div>
        <Link to="/instructor/dashboard" style={{ color: '#666', textDecoration: 'none' }}>← Back to Dashboard</Link>
      </div>

      {/* CONTENT AREA */}
      <div style={{ display: 'flex', gap: '40px' }}>

        {/* LEFT: Existing Modules */}
        <div style={{ flex: 2 }}>
          <h3>Curriculum</h3>
          {course.modules && course.modules.length > 0 ? (
            course.modules.map(module => (
              <div key={module.id} style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{module.title}</span>
                  <span style={{ color: '#666', fontSize: '0.9em' }}>{module.lessons ? module.lessons.length : 0} Lessons</span>
                </div>
                {/* We will add "Add Lesson" button here later */}
              </div>
            ))
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No modules yet. Add one to start!</p>
          )}
        </div>

        {/* RIGHT: Add New Module */}
        <div style={{ flex: 1, height: 'fit-content', background: '#eee', padding: '20px', borderRadius: '10px' }}>
          <h4>+ Add Module</h4>
          <form onSubmit={handleCreateModule}>
            <input
              type="text"
              placeholder="e.g., Introduction to Python"
              value={moduleTitle}
              onChange={e => setModuleTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              required
            />
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Create Module
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default InstructorCourseEdit