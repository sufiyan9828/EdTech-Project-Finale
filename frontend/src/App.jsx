import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail' // <--- IMPORT THIS
import MyCourses from './pages/MyCourses' // <--- Import

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
          <Route path="/course/:id" element={<CourseDetail />} /> 
          <Route path="/my-courses" element={<MyCourses />} />

        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App