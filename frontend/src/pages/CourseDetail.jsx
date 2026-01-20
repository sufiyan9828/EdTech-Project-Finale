import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null) // <--- NEW: Tracks what is playing

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/courses/api/${id}/`)
      .then(res => res.json())
      .then(data => {
        setCourse(data)
        // Auto-select the first lesson if it exists
        if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
            setActiveLesson(data.modules[0].lessons[0])
        }
      })
      .catch(err => console.error(err))
  }, [id])

  // Helper: Convert YouTube watch URL to Embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (!course) return <div style={{padding: '20px'}}>Loading Class...</div>

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', height: '80vh' }}>
      
      {/* LEFT COLUMN: Main Stage (The Player) */}
      <div style={{ flex: 3, border: '1px solid #ddd', borderRadius: '10px', padding: '20px', background: '#fff' }}>
        
        {activeLesson ? (
            <div>
                <h2 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>{activeLesson.title}</h2>
                
                {/* VIDEO PLAYER LOGIC */}
                {activeLesson.content_type === 'V' && (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                        <iframe 
                            src={getEmbedUrl(activeLesson.video_url)} 
                            title={activeLesson.title}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* TEXT/DOCUMENT LOGIC */}
                {activeLesson.content_type === 'D' && (
                    <div style={{ padding: '20px', background: '#f9f9f9', marginTop: '20px' }}>
                        <p>📄 This lesson contains a document.</p>
                        {activeLesson.document && <a href={activeLesson.document} target="_blank" rel="noreferrer">Download Document</a>}
                    </div>
                )}

                <p style={{ marginTop: '20px', color: '#555' }}>{activeLesson.content}</p>
            </div>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <h3>Select a lesson to start learning</h3>
            </div>
        )}
      </div>

      {/* RIGHT COLUMN: Sidebar (The Syllabus) */}
      <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '10px', overflowY: 'auto', background: '#f9f9f9' }}>
        <div style={{ padding: '15px', background: '#333', color: 'white' }}>
            <h3 style={{ margin: 0 }}>Course Content</h3>
        </div>

        {course.modules.map(module => (
          <div key={module.id}>
            <div style={{ padding: '10px 15px', background: '#e0e0e0', fontWeight: 'bold', fontSize: '0.9em' }}>
              {module.title}
            </div>
            
            {module.lessons.map(lesson => (
              <div 
                key={lesson.id} 
                onClick={() => setActiveLesson(lesson)} // <--- CLICK TO PLAY
                style={{ 
                    padding: '12px 15px', 
                    cursor: 'pointer', 
                    background: activeLesson && activeLesson.id === lesson.id ? '#d1e7dd' : 'transparent', // Highlight active
                    borderBottom: '1px solid #eee',
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <span>{lesson.content_type === 'V' ? '🎥' : '📄'}</span>
                <span style={{ fontSize: '0.9em' }}>{lesson.title}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  )
}

export default CourseDetail