import React, { useEffect, useState } from 'react'
import api from '../../api/Api'
import { Link, useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Administrator'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        await api.get('/admins')
        setLoading(false)
      } catch (error) {
        if (error.response?.status === 403) {
          navigate('/user/dashboard')
        } else if (error.response?.status === 401) {
          navigate('/signin')
        } else {
          navigate('/signin')
        }
      }
    }

    checkAdmin()
  }, [navigate])

  const handleSignout = async () => {
    try {
      await api.post('/signout')
    } catch (error) {
      console.log(error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      navigate('/')
    }
  }

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg sticky-top bg-primary navbar-dark">
        <div className="container">
          <Link className="navbar-brand" to="/admin/dashboard">
            Administrator Portal
          </Link>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li>
              <Link to="/admin/listadmin" className="nav-link px-2 text-white">
                List Admins
              </Link>
            </li>
            <li>
              <Link to="/admin/listusers" className="nav-link px-2 text-white">
                List Users
              </Link>
            </li>
            <li className="nav-item">
              <span className="nav-link active bg-dark">
                Welcome, {username}
              </span>
            </li>
            <li className="nav-item">
              <button
                onClick={handleSignout}
                className="btn bg-white text-primary ms-4"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        <div className="hero py-5 bg-light">
          <div className="container text-center">
            <h1 className="mb-0 mt-0">Dashboard</h1>
          </div>
        </div>

        <div className="list-form py-5">
          <div className="container">
            <h5 className="alert alert-info">
              Welcome, {username}. Don't forget to sign out when you are finished using this page
            </h5>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard