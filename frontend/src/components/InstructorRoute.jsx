import { Navigate, Outlet } from 'react-router-dom'

function InstructorRoute() {
  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('user_role') // We just saved this in Login

  // If logged in AND is an Instructor ('I'), let them pass.
  // Otherwise, redirect to Dashboard.
  return (token && role === 'I') ? <Outlet /> : <Navigate to="/" />
}

export default InstructorRoute