import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

function InstructorCourseEdit() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [moduleTitle, setModuleTitle] = useState('')

  // New States for Lesson Creation
  const [activeModuleId, setActiveModuleId] = useState(null) // Which module is open?
  const [lessonData, setLessonData] = useState({ title: '', content_type: 'V' })
  const [lessonFile, setLessonFile] = useState(null)

  const fetchCourse = () => {
    const token = localStorage.getItem('access_token')
    fetch(`http://127.0.0.1:8000/courses/api/teacher-courses/${id}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCourse(data))
      .catch(err => console.error(err))
  }

  useEffect(() => { fetchCourse() }, [id])

  const handleCreateModule = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('access_token')

    // Check if we need to send 'course' ID (Fix for your serializer issue)
    const payload = { title: moduleTitle, course: id }

    await fetch('http://127.0.0.1:8000/courses/api/modules/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    setModuleTitle('')
    fetchCourse()
  }

  const handleCreateLesson = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('access_token')

    const formData = new FormData()
    formData.append('module', activeModuleId)
    formData.append('title', lessonData.title)
    formData.append('content_type', lessonData.content_type)

    // Handle File based on type
    if (lessonFile) {
      if (lessonData.content_type === 'V') {
        formData.append('video_url', lessonFile) // Assuming model field is video_url
      } else {
        formData.append('document', lessonFile)
      }
    }

    const res = await fetch('http://127.0.0.1:8000/courses/api/lessons/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type for FormData
      body: formData
    })

    if (res.ok) {
      alert("Lesson Added!")
      setActiveModuleId(null) // Close the form
      setLessonData({ title: '', content_type: 'V' })
      setLessonFile(null)
      fetchCourse()
    } else {
      const err = await res.json()
      alert("Error: " + JSON.stringify(err))
    }
  }

  // ... inside InstructorCourseEdit function ...

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Are you sure? This will delete all lessons in this module.")) return

    const token = localStorage.getItem('access_token')
    await fetch(`http://127.0.0.1:8000/courses/api/modules/${moduleId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchCourse() // Refresh UI
  }

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return

    const token = localStorage.getItem('access_token')
    await fetch(`http://127.0.0.1:8000/courses/api/lessons/${lessonId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchCourse() // Refresh UI
  }

  if (!course) return <div style={{ padding: '20px' }}>Loading Studio...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <div>
          <h4 style={{ color: '#888', margin: 0 }}>COURSE MANAGER</h4>
          <h1 style={{ margin: '5px 0' }}>{course.title}</h1>
        </div>
        <Link to="/instructor/dashboard" style={{ color: '#666' }}>← Dashboard</Link>
      </div>

      <div style={{ display: 'flex', gap: '40px' }}>
        {/* LEFT: Modules List */}
        <div style={{ flex: 2 }}>
          <h3>Curriculum</h3>
          {course.modules && course.modules.map(module => (
            <div key={module.id} style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                {/* OLD: */}
                {/* <h3 style={{ margin: 0 }}>{module.title}</h3> */}

                {/* NEW: */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <h3 style={{ margin: 0 }}>{module.title}</h3>
                  <button onClick={() => handleDeleteModule(module.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                </div>
                <button onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#007bff' }}>
                  {activeModuleId === module.id ? 'Cancel' : '+ Add Lesson'}
                </button>
              </div>

              {/* LESSON LIST */}
              <div style={{ marginLeft: '20px', borderLeft: '2px solid #ddd', paddingLeft: '15px' }}>
                {module.lessons && module.lessons.map(lesson => (
                  <div key={lesson.id} style={{ padding: '5px 0', color: '#555' }}>
                    {/* OLD: */}
                    {/* {lesson.content_type === 'V' ? '🎥' : '📄'} {lesson.title} */}

                    {/* NEW: */}
                    <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                      <span style={{ color: '#555' }}>
                        {lesson.content_type === 'V' ? '🎥' : '📄'} {lesson.title}
                      </span>
                      <button onClick={() => handleDeleteLesson(lesson.id)} style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8em' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {(!module.lessons || module.lessons.length === 0) && <div style={{ fontStyle: 'italic', color: '#999' }}>Empty module</div>}
              </div>

              {/* ADD LESSON FORM (Only visible if active) */}
              {activeModuleId === module.id && (
                <form onSubmit={handleCreateLesson} style={{ marginTop: '15px', padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '5px' }}>
                  <input
                    placeholder="Lesson Title"
                    value={lessonData.title}
                    onChange={e => setLessonData({ ...lessonData, title: e.target.value })}
                    style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
                    required
                  />
                  <select
                    value={lessonData.content_type}
                    onChange={e => setLessonData({ ...lessonData, content_type: e.target.value })}
                    style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
                  >
                    <option value="V">Video (Upload)</option>
                    <option value="D">Document (PDF)</option>
                  </select>
                  <input
                    type="file"
                    onChange={e => setLessonFile(e.target.files[0])}
                    style={{ display: 'block', marginBottom: '10px' }}
                    required
                  />
                  <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                    Upload Lesson
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT: Add Module Sidebar */}
        <div style={{ flex: 1 }}>
          <div style={{ background: '#eee', padding: '20px', borderRadius: '10px' }}>
            <h4>+ Add Module</h4>
            <form onSubmit={handleCreateModule}>
              <input
                value={moduleTitle}
                onChange={e => setModuleTitle(e.target.value)}
                placeholder="Module Title..."
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                required
              />
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none' }}>Create</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorCourseEdit