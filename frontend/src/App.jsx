import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail' // <--- IMPORT THIS
import MyCourses from './pages/MyCourses' // <--- Import
import Profile from './pages/Profile'
import InstructorRoute from './components/InstructorRoute'
import InstructorCreate from './pages/InstructorCreate'
import InstructorDashboard from './pages/InstructorDashboard'
import InstructorCourseEdit from './pages/InstructorCourseEdit'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />

          {/* NEW DYNAMIC ROUTE */}
          {/* :id is a variable placeholder */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route element={<InstructorRoute />}>
            <Route path="/instructor/create" element={<InstructorCreate />} />
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/course/:id" element={<InstructorCourseEdit />} />
          </Route>

        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App