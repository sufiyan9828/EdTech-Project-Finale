import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function CourseDetail() {
  const { id } = useParams() // 1. Get the ID from the URL
  const [course, setCourse] = useState(null)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/courses/api/${id}/`) // 2. Fetch specific course
      .then(res => res.json())
      .then(data => setCourse(data))
      .catch(err => console.error(err))
  }, [id])

  if (!course) return <div>Loading Class...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ background: '#333', color: 'white', padding: '30px', borderRadius: '10px' }}>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <p><strong>Instructor: {course.instructor_name}</strong></p>
      </div>

      {/* Curriculum Section */}
      <div style={{ marginTop: '30px' }}>
        <h2>Curriculum</h2>
        
        {/* Loop through Modules */}
        {course.modules.map(module => (
          <div key={module.id} style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <div style={{ background: '#f9f9f9', padding: '15px', borderBottom: '1px solid #eee' }}>
              <h3>{module.title}</h3>
            </div>
            
            {/* Loop through Lessons inside the Module */}
            <div style={{ padding: '15px' }}>
              {module.lessons.map(lesson => (
                <div key={lesson.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📄 {lesson.title}</span>
                  {lesson.content_type === 'V' && <span style={{color: 'red'}}>Video</span>}
                </div>
              ))}
              {module.lessons.length === 0 && <p>No lessons yet.</p>}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default CourseDetail