import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function InstructorDashboard() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch('http://127.0.0.1:8000/courses/api/teacher-courses/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCourses(data))
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>⚡ Instructor Studio</h1>
        <Link to="/instructor/create" style={{ background: '#FFD700', color: 'black', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          + New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '10px' }}>
          <h3>You haven't created any courses yet.</h3>
          <p>Share your knowledge with the world!</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#333', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Course</th>
              <th style={{ padding: '10px' }}>Students</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '15px' }}>
                  <div style={{ fontWeight: 'bold' }}>{course.title}</div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>${course.price}</div>
                </td>
                {/* OLD: */}
                {/* <td style={{ padding: '15px' }}>-</td> */}

                {/* NEW: */}
                <td style={{ padding: '15px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                    👥 {course.students_count}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <Link to={`/instructor/course/${course.id}`} style={{ marginRight: '10px', color: '#007bff' }}>Manage Content</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default InstructorDashboard