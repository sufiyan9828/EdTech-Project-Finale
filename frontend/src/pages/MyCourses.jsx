import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function MyCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
        navigate('/login')
        return
    }

    fetch('http://127.0.0.1:8000/courses/api/my-courses/', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          setCourses(data)
          setLoading(false)
      })
      .catch(err => {
          console.error(err)
          setLoading(false)
      })
  }, [])

  if (loading) return <div style={{padding:'20px'}}>Loading your library...</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Learning</h1>
      {courses.length === 0 ? (
          <p>You haven't enrolled in any courses yet. <Link to="/">Browse Catalog</Link></p>
      ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {courses.map(course => (
              <Link to={`/course/${course.id}`} key={course.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' }}>
                   <div style={{ height: '150px', background: '#eee', marginBottom: '10px' }}>
                      {course.image && <img src={course.image} alt={course.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                   </div>
                   <h3>{course.title}</h3>
                   <span style={{ background: '#4CAF50', color:'white', padding: '2px 8px', borderRadius:'4px', fontSize:'0.8em' }}>
                       In Progress
                   </span>
                </div>
              </Link>
            ))}
          </div>
      )}
    </div>
  )
}

export default MyCourses