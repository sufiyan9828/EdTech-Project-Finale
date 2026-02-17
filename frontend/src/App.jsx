import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'
import MyCourses from './pages/MyCourses'
import Profile from './pages/Profile'
import InstructorRoute from './components/InstructorRoute'
import InstructorDashboard from './pages/InstructorDashboard'
import InstructorCreate from './pages/InstructorCreate'
import InstructorCourseEdit from './pages/InstructorCourseEdit'

// IMPORT THE NEW PAGE (Ensure you created this file!)
import Register from './pages/Register' // <--- 1. ADD THIS IMPORT

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* <--- 2. ADD THIS ROUTE */}
        <Route path="/course/:id" element={<CourseDetail />} />

        {/* Student Routes */}
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/profile" element={<Profile />} />

        {/* Instructor Routes */}
        <Route element={<InstructorRoute />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/create" element={<InstructorCreate />} />
          <Route path="/instructor/course/:id" element={<InstructorCourseEdit />} />
        </Route>
      </Routes>
    </>
  )
}

export default App