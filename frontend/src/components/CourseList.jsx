import { useEffect, useState } from 'react'

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
        
        {/* THE MAGIC PART: .map() */}
        {courses.map(course => (
          <div key={course.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
             {/* If there is an image, display it. If not, show a placeholder color */}
            <div style={{ height: '150px', background: '#eee', marginBottom: '10px' }}>
                {course.image && <img src={course.image} alt={course.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
            </div>
            
            <h3>{course.title}</h3>
            <p>{course.description.substring(0, 50)}...</p> {/* Truncate text */}
            <p><strong>Price: ${course.price}</strong></p>
            <p style={{ fontSize: '0.8em', color: '#666' }}>By {course.instructor_name}</p>
          </div>
        ))}

      </div>
    </div>
  )
}

export default CourseList