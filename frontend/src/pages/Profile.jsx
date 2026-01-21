import { useEffect, useState } from 'react'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  // Form States
  const [bio, setBio] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const token = localStorage.getItem('access_token')

  // 1. Fetch Data
  useEffect(() => {
    // Fetch Profile
    fetch('http://127.0.0.1:8000/accounts/api/profile/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data)
        setBio(data.bio || '')
      })

    // Fetch Achievements
    fetch('http://127.0.0.1:8000/courses/api/my-achievements/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAchievements(data))

  }, [token])

  // 2. Handle Update (Image + Bio)
  const handleSave = async () => {
    const formData = new FormData()
    formData.append('bio', bio)
    if (selectedFile) {
      formData.append('profile_image', selectedFile) // 'profile_image' matches Django model field
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/accounts/api/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
          // NOTE: Do NOT set Content-Type header when sending FormData; 
          // the browser sets it automatically with the "boundary"
        },
        body: formData
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setIsEditing(false)
        alert("Profile Updated!")
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Helper for Download
  const downloadCert = (url, title) => {
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `Certificate_${title}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
      })
  }

  if (!profile) return <div style={{ padding: '20px' }}>Loading Profile...</div>

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '40px' }}>

      {/* LEFT COLUMN: Identity */}
      <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '10px', padding: '30px', textAlign: 'center', height: 'fit-content' }}>
        {/* Profile Image */}
        <div style={{ width: '150px', height: '150px', margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden', background: '#eee', border: '3px solid #333' }}>
          {profile.profile_image ? (
            <img src={profile.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ fontSize: '4em', lineHeight: '150px', color: '#ccc' }}>👤</div>
          )}
        </div>

        <h2>{profile.username}</h2>
        <p style={{ color: '#666' }}>{profile.email}</p>

        <hr style={{ margin: '20px 0' }} />

        {/* Edit Mode Toggle */}
        {!isEditing ? (
          <div>
            <p style={{ fontStyle: 'italic', color: '#555' }}>"{profile.bio || "No bio yet."}"</p>
            <button onClick={() => setIsEditing(true)} style={{ marginTop: '10px', padding: '8px 15px', cursor: 'pointer' }}>✏️ Edit Profile</button>
          </div>
        ) : (
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Update Bio:</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              style={{ width: '100%', height: '80px', marginBottom: '10px' }}
            />

            <label style={{ display: 'block', marginBottom: '5px' }}>New Picture:</label>
            <input
              type="file"
              onChange={e => setSelectedFile(e.target.files[0])}
              style={{ marginBottom: '15px' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setIsEditing(false)} style={{ background: '#ccc', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Trophy Room */}
      <div style={{ flex: 2 }}>
        <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>🏆 Achievement History</h2>

        {achievements.length === 0 ? (
          <p style={{ marginTop: '20px', color: '#666' }}>No certificates earned yet. Keep learning!</p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {achievements.map((ach, index) => (
              <div key={index} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '15px', background: '#f9f9f9', marginBottom: '15px', borderRadius: '8px', border: '1px solid #eee'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{ach.course_title}</h3>
                  <span style={{ fontSize: '0.8em', color: '#555' }}>Completed on: {ach.completed_on}</span>
                </div>
                <button
                  onClick={() => downloadCert(ach.certificate_url, ach.course_title)}
                  style={{ background: '#FFD700', color: 'black', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ⬇ PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Profile