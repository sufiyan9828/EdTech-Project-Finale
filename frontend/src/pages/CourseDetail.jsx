import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [completedIds, setCompletedIds] = useState([]) // <--- NEW: Stores completed lesson IDs

  // 1. Fetch Course Content
  const fetchCourse = () => {
    const token = localStorage.getItem('access_token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

    fetch(`http://127.0.0.1:8000/courses/api/${id}/`, { headers })
      .then(res => res.json())
      .then(data => {
        setCourse(data)
        if (data.modules && data.modules.length > 0 && data.modules[0].lessons.length > 0) {
          setActiveLesson(data.modules[0].lessons[0])
        }
      })
      .catch(err => console.error(err))
  }

  // 2. Fetch User Progress (Green Checkmarks)
  const fetchProgress = () => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    fetch(`http://127.0.0.1:8000/courses/api/${id}/progress/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCompletedIds(data.completed_lesson_ids))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchCourse()
    fetchProgress() // <--- Load progress when page opens
  }, [id])

  // 3. Handle "Mark Complete" Click
  const handleToggleComplete = async () => {
    if (!activeLesson) return
    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch(`http://127.0.0.1:8000/courses/api/lesson/${activeLesson.id}/toggle-complete/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        // Refresh the progress list to update UI
        fetchProgress()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDownloadCertificate = async () => {
    const token = localStorage.getItem('access_token')
    try {
      const response = await fetch(`http://127.0.0.1:8000/courses/api/course/${id}/certificate/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Certificate_${course.title}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        // This will tell us the specific error from Django
        const errorData = await response.json()
        alert("Download Failed: " + (errorData.detail || "Server Error " + response.status))
      }
    } catch (error) {
      console.error(error)
      alert("Network Error: Check console for details")
    }
  }

  // Helper
  const handleEnroll = async () => { /* ... Keep your existing handleEnroll ... */
    // (For brevity, I'm assuming you know to keep the enroll logic we wrote before)
    // If you need me to paste the FULL file again with enroll logic included, ask.
    // For now, I will include the critical parts below.
    const token = localStorage.getItem('access_token')
    if (!token) { alert("Please login"); navigate('/login'); return }
    try {
      await fetch(`http://127.0.0.1:8000/courses/api/${id}/enroll/`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      })
      alert("Enrolled!"); fetchCourse();
    } catch (e) { console.error(e) }
  }

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (!course) return <div style={{ padding: '20px' }}>Loading...</div>

  const isLessonCompleted = activeLesson && completedIds.includes(activeLesson.id)

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: '#333', color: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px' }}>
        <h1>{course.title}</h1>

        {completedIds.length > 0 &&
          course.modules.reduce((total, module) => total + module.lessons.length, 0) === completedIds.length && (
            <button
              onClick={handleDownloadCertificate}
              style={{
                marginTop: '10px',
                background: '#FFD700', // Gold color for reward
                color: 'black',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎓 Download Certificate
            </button>
          )}

        <p>{course.description}</p>
        <div style={{ marginTop: '15px' }}>
          {course.is_enrolled ? (
            <span style={{ background: '#4CAF50', padding: '8px 15px', borderRadius: '5px' }}>✅ Enrolled</span>
          ) : (
            <button onClick={handleEnroll} style={{ background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Enroll Now (${course.price})
            </button>
          )}
        </div>
      </div>

      {course.is_enrolled ? (
        <div style={{ display: 'flex', gap: '20px', minHeight: '500px' }}>

          {/* Main Stage */}
          <div style={{ flex: 3, border: '1px solid #ddd', borderRadius: '10px', padding: '20px', background: '#fff' }}>
            {activeLesson ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3>{activeLesson.title}</h3>
                  {/* TOGGLE BUTTON */}
                  <button
                    onClick={handleToggleComplete}
                    style={{
                      background: isLessonCompleted ? '#4CAF50' : '#ddd',
                      color: isLessonCompleted ? 'white' : 'black',
                      border: 'none', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    {isLessonCompleted ? "✅ Completed" : "○ Mark Complete"}
                  </button>
                </div>

                {activeLesson.content_type === 'V' && (
                  <iframe
                    src={getEmbedUrl(activeLesson.video_url)}
                    style={{ width: '100%', height: '400px', border: 'none' }}
                    title="video"
                  />
                )}
                <p style={{ marginTop: '20px' }}>{activeLesson.content}</p>
              </div>
            ) : (
              <p>Select a lesson.</p>
            )}
          </div>

          {/* Sidebar Syllabus */}
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '10px', overflowY: 'auto', background: '#f9f9f9' }}>
            {course.modules.map(module => (
              <div key={module.id}>
                <div style={{ padding: '10px', background: '#eee', fontWeight: 'bold' }}>{module.title}</div>
                {module.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ddd',
                      background: activeLesson?.id === lesson.id ? '#d1e7dd' : 'none',
                      display: 'flex', justifyContent: 'space-between'
                    }}
                  >
                    <span>{lesson.title}</span>
                    {/* SIDEBAR CHECKMARK */}
                    {completedIds.includes(lesson.id) && <span>✅</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', border: '2px dashed #ccc' }}>
          <h2>🔒 Content Locked</h2>
        </div>
      )}

    </div>
  )
}

export default CourseDetail