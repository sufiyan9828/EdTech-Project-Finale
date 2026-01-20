import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom' // <--- 1. Import Link

function CourseList() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/courses/api/list/')
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error))
  }, [])

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Available Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        
        {courses.map(course => (
          // 2. The Link wraps the Card
          <Link to={`/course/${course.id}`} key={course.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            
            <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' }}>
               {/* Image Handling */}
               <div style={{ height: '150px', background: '#eee', marginBottom: '10px' }}>
                  {course.image && <img src={course.image} alt={course.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
               </div>
               
               <h3>{course.title}</h3>
               {/* Safety check for description */}
               <p>{course.description ? course.description.substring(0, 50) : ""}...</p>
               <p><strong>Price: ${course.price}</strong></p>
               <p style={{ fontSize: '0.8em', color: '#666' }}>By {course.instructor_name}</p>
            </div>

          </Link>
        ))}

      </div>
    </div>
  )
}

export default CourseList