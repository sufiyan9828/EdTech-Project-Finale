import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)

  // Fetch Course Data
  const fetchCourse = () => {
    const token = localStorage.getItem('access_token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

    fetch(`http://127.0.0.1:8000/courses/api/${id}/`, { headers })
      .then(res => res.json())
      .then(data => {
        setCourse(data)
        // Only auto-play if we actually HAVE modules (i.e., we are enrolled)
        if (data.modules && data.modules.length > 0 && data.modules[0].lessons.length > 0) {
            setActiveLesson(data.modules[0].lessons[0])
        }
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchCourse()
  }, [id])

  // Handle Enroll Click
  const handleEnroll = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
        alert("Please login to enroll!")
        navigate('/login')
        return
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/courses/api/${id}/enroll/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            alert("Enrollment Successful!")
            fetchCourse() // Refresh page to get the content
        } else {
            alert("Enrollment failed.")
        }
    } catch (error) {
        console.error(error)
    }
  }

  // Helper for YouTube
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (!course) return <div style={{padding: '20px'}}>Loading...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ background: '#333', color: 'white', padding: '30px', borderRadius: '10px', marginBottom: '20px' }}>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div style={{ marginTop: '15px' }}>
            {course.is_enrolled ? (
                <span style={{ background: '#4CAF50', padding: '8px 15px', borderRadius: '5px' }}>✅ Enrolled</span>
            ) : (
                <button 
                    onClick={handleEnroll}
                    style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', fontSize: '1.1em', cursor: 'pointer', borderRadius: '5px' }}
                >
                    Enroll Now (${course.price})
                </button>
            )}
        </div>
      </div>

      {/* CONTENT LOGIC: Show Content ONLY if Enrolled */}
      {course.is_enrolled ? (
          <div style={{ display: 'flex', gap: '20px', height: '600px' }}>
            {/* Player */}
            <div style={{ flex: 3, border: '1px solid #ddd', borderRadius: '10px', padding: '20px', background: '#fff' }}>
                {activeLesson ? (
                    <div>
                        <h3>{activeLesson.title}</h3>
                        {activeLesson.content_type === 'V' && (
                            <iframe 
                                src={getEmbedUrl(activeLesson.video_url)} 
                                style={{ width: '100%', height: '400px', border: 'none' }} 
                                title="video"
                            />
                        )}
                        <p>{activeLesson.content}</p>
                    </div>
                ) : (
                    <p>Select a lesson.</p>
                )}
            </div>

            {/* Sidebar */}
            <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '10px', overflowY: 'auto', background: '#f9f9f9' }}>
                {course.modules.map(module => (
                    <div key={module.id}>
                        <div style={{ padding: '10px', background: '#eee', fontWeight: 'bold' }}>{module.title}</div>
                        {module.lessons.map(lesson => (
                            <div 
                                key={lesson.id} 
                                onClick={() => setActiveLesson(lesson)}
                                style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ddd', background: activeLesson?.id === lesson.id ? '#d1e7dd' : 'none' }}
                            >
                                {lesson.title}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
          </div>
      ) : (
          <div style={{ textAlign: 'center', padding: '50px', border: '2px dashed #ccc', color: '#666' }}>
              <h2>🔒 Content Locked</h2>
              <p>Please enroll in this course to access the videos and materials.</p>
          </div>
      )}

    </div>
  )
}

export default CourseDetail