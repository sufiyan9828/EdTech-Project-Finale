import { useState, useEffect } from 'react'

function App() {
  // 1. "Memory" to hold our backend message
  const [message, setMessage] = useState('')

  // 2. "Startup Script" to fetch data when page loads
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/test/')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error:', error));
  }, []) // The empty [] means "run this only once on load"

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>React + Django Integration</h1>
      {/* Display the message from backend */}
      <h2>Status: {message ? message : "Loading..."}</h2>
    </div>
  )
}

export default App