import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [completedIds, setCompletedIds] = useState([])

  // --- HELPER: Fix Broken Asset URLs ---
  const getAssetUrl = (url) => {
    if (!url) return null;
    // If the URL is already absolute (e.g., YouTube or S3), return it.
    if (url.startsWith('http') || url.startsWith('//')) {
      return url;
    }
    // Otherwise, prepend the Django Backend URL
    return `http://127.0.0.1:8000${url}`;
  }

  // Helper: YouTube Embed Logic
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('embed')) return url;
    const videoId = url.split('v=')[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

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
    fetchProgress()
  }, [id])

  const handleToggleComplete = async () => {
    if (!activeLesson) return
    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch(`http://127.0.0.1:8000/courses/api/lesson/${activeLesson.id}/toggle-complete/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
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
        const errorData = await response.json()
        alert("Download Failed: " + (errorData.detail || "Server Error"))
      }
    } catch (error) {
      console.error(error)
      alert("Network Error")
    }
  }

  const handleEnroll = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { alert("Please login"); navigate('/login'); return }
    try {
      await fetch(`http://127.0.0.1:8000/courses/api/${id}/enroll/`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      })
      alert("Enrolled!")
      fetchCourse()
    } catch (e) { console.error(e) }
  }

  // --- RENDERING LOGIC ---
  const renderLessonContent = () => {
    if (!activeLesson) return <p>Select a lesson to start learning.</p>

    // 1. VIDEO LESSON
    if (activeLesson.content_type === 'V') {
      if (activeLesson.video_file) {
        // FIX: Use getAssetUrl to ensure correct backend path
        return (
          <div style={{ background: 'black', borderRadius: '8px', overflow: 'hidden' }}>
            <video controls width="100%" height="500" style={{ display: 'block' }}>
              <source src={getAssetUrl(activeLesson.video_file)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )
      } else if (activeLesson.video_url) {
        return (
          <iframe
            src={getEmbedUrl(activeLesson.video_url)}
            style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
            title="video"
            allowFullScreen
          />
        )
      } else {
        return <div style={{ padding: '50px', textAlign: 'center', background: '#eee' }}>🎥 Video Content Not Available</div>
      }
    }

    // 2. DOCUMENT LESSON
    else if (activeLesson.content_type === 'D') {
      return (
        <div style={{ padding: '40px', border: '1px solid #eee', borderRadius: '8px', background: '#f8f9fa', textAlign: 'center' }}>
          <div style={{ fontSize: '4em', marginBottom: '20px' }}>📄</div>
          <h3>{activeLesson.title}</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>This lesson contains a downloadable resource.</p>

          {activeLesson.document ? (
            // FIX: Use getAssetUrl here as well
            <a
              href={getAssetUrl(activeLesson.document)}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                background: '#007bff', color: 'white', padding: '12px 25px',
                textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              ⬇ Download Document
            </a>
          ) : (
            <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Document file missing.</p>
          )}
        </div>
      )
    }
  }

  if (!course) return <div style={{ padding: '20px' }}>Loading...</div>

  const isLessonCompleted = activeLesson && completedIds.includes(activeLesson.id)

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Course Header */}
      <div style={{ background: '#333', color: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>{course.title}</h1>
        <p style={{ color: '#ccc', fontSize: '1.1em' }}>{course.description}</p>

        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          {course.is_enrolled ? (
            <span style={{ background: '#4CAF50', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold' }}>✅ Enrolled</span>
          ) : (
            <button onClick={handleEnroll} style={{ background: '#007bff', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em' }}>
              Enroll Now (${course.price})
            </button>
          )}

          {completedIds.length > 0 &&
            course.modules.reduce((total, module) => total + module.lessons.length, 0) === completedIds.length && (
              <button
                onClick={handleDownloadCertificate}
                style={{
                  background: '#FFD700', color: 'black', border: 'none',
                  padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                🎓 Download Certificate
              </button>
            )}
        </div>
      </div>

      {course.is_enrolled ? (
        <div style={{ display: 'flex', gap: '30px', minHeight: '600px' }}>

          {/* Left: Main Content Stage */}
          <div style={{ flex: 3, border: '1px solid #ddd', borderRadius: '10px', padding: '30px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            {activeLesson ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                  <h2 style={{ margin: 0 }}>{activeLesson.title}</h2>
                  <button
                    onClick={handleToggleComplete}
                    style={{
                      background: isLessonCompleted ? '#4CAF50' : '#f0f0f0',
                      color: isLessonCompleted ? 'white' : '#333',
                      border: 'none', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isLessonCompleted ? "✅ Completed" : "○ Mark Complete"}
                  </button>
                </div>

                {renderLessonContent()}

                {activeLesson.description && (
                  <div style={{ marginTop: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <h4>About this lesson</h4>
                    <p>{activeLesson.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                <h3>Welcome back!</h3>
                <p>Select a lesson from the sidebar to continue learning.</p>
              </div>
            )}
          </div>

          {/* Right: Sidebar Syllabus */}
          <div style={{ flex: 1, minWidth: '300px', border: '1px solid #ddd', borderRadius: '10px', overflowY: 'auto', background: 'white', maxHeight: '800px' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold', background: '#f8f9fa' }}>
              Course Content
            </div>
            {course.modules.map(module => (
              <div key={module.id}>
                <div style={{ padding: '12px 15px', background: '#eee', fontWeight: 'bold', fontSize: '0.95em', color: '#444' }}>
                  {module.title}
                </div>
                {module.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                      background: activeLesson?.id === lesson.id ? '#e3f2fd' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '0.9em', transition: 'background 0.2s'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{lesson.content_type === 'V' ? '🎥' : '📄'}</span>
                      {lesson.title}
                    </span>
                    {completedIds.includes(lesson.id) && <span style={{ fontSize: '1.2em' }}>✅</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px', border: '2px dashed #ccc', borderRadius: '10px', color: '#666' }}>
          <h2>🔒 Content Locked</h2>
          <p>Enroll in this course to access the videos and materials.</p>
        </div>
      )}

    </div>
  )
}

export default CourseDetail