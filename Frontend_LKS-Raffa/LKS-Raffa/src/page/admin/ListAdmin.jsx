import React, { useEffect, useState } from 'react'
import api from '../../api/Api'
import { Link, useNavigate } from 'react-router-dom'

const ListAdmin = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Administrator'

  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await api.get('/admins')

        setAdmins(res.data.content)
      } catch (error) {
        if (error.response?.status === 403) {
          navigate('/user/dashboard')
        } else if (error.response?.status === 401) {
          navigate('/signin')
        } else {
          setMessage('Gagal mengambil data admin')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAdmins()
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
          <Link className="navbar-brand" to="/admin/dashboard">
            Administrator Portal
          </Link>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li>
              <Link to="/admin/listadmins" className="nav-link px-2 text-white">
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
        <div className="list-form py-5">
          <div className="container">
            <h6 className="mb-3">List Admin Users</h6>

            {message && (
              <div className="alert alert-danger">{message}</div>
            )}

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Created at</th>
                    <th>Last login</th>
                  </tr>
                </thead>

                <tbody>
                  {admins.length > 0 ? (
                    admins.map((admin, index) => (
                      <tr key={index}>
                        <td>{admin.username}</td>
                        <td>{admin.created_at}</td>
                        <td>{admin.last_login_at}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">
                        Tidak ada data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ListAdmin