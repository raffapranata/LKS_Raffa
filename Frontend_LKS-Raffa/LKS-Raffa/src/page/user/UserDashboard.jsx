import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/Api'

const UserDashboard = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Player'

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/signin')
    }
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

  return (
    <div>
      <nav className="navbar navbar-expand-lg sticky-top bg-primary navbar-dark">
        <div className="container">
          <Link className="navbar-brand" to="/user/dashboard">
            Gaming Portal
          </Link>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li>
              <Link to="/user/discovergames" className="nav-link px-2 text-white">
                Discover Games
              </Link>
            </li>

            <li>
              <Link to="/user/managegames" className="nav-link px-2 text-white">
                Manage Games
              </Link>
            </li>

            <li>
              <Link to="/user/userprofile" className="nav-link px-2 text-white">
                User Profile
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
              Welcome, {username}. Don't forget to sign out when you are
              finished using this page
            </h5>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UserDashboard