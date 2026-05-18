import React, { useEffect, useState } from 'react'
import api from '../../api/Api'
import { Link, useNavigate } from 'react-router-dom'

const ListUser = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Administrator'

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users')
        console.log('DATA USERS:', res.data)
        setUsers(res.data.content || [])
      } catch (error) {
        console.log('ERROR GET USERS:', error.response)

        if (error.response?.status === 403) {
          navigate('/user/dashboard')
        } else if (error.response?.status === 401) {
          navigate('/signin')
        } else {
          setMessage(error.response?.data?.message || 'Failed get data users')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [navigate])

  const handleDelete = async (id) => {
    console.log('ID DELETED:', id)

    if (!window.confirm('Delete user?')) return

    try {
      await api.delete(`/users/${id}`)

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
      alert('Deleted success')
    } catch (error) {
      console.log('ERROR DELETE USER:', error.response)
      alert(error.response?.data?.message || 'Delete user failed')
    }
  }

  const handleSignout = async () => {
    try {
      await api.post('/signout')
    } catch (error) {
      console.log('ERROR SIGNOUT:', error.response)
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
          <div className="container">
            <Link to="/admin/createuser" className="btn btn-primary">
              Add User
            </Link>
          </div>
        </div>

        <div className="list-form py-5">
          <div className="container">
            <h6 className="mb-3">List Users</h6>

            {message && <div className="alert alert-danger">{message}</div>}

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Created at</th>
                    <th>Last login</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>

                        <td>
                          <Link to={`/profile/${user.username}`} target="_blank">
                            {user.username}
                          </Link>
                        </td>

                        <td>{user.created_at}</td>
                        <td>{user.last_login_at}</td>

                        <td>
                            <span className="bg-success text-white p-1 d-inline-block">
                              Active
                            </span>
                        </td>

                        <td>
                          <div className="d-flex gap-2">

                            <button type="button" class="btn btn-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                Lock
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        <a type="submit" class="dropdown-item" name="reason" value="spamming">Spamming</a>
                                    </li>
                                    <li>
                                        <a type="submit" class="dropdown-item" name="reason" value="cheating">Cheating</a>
                                    </li>
                                    <li>
                                        <a type="submit" class="dropdown-item" name="reason" value="other">Other</a>
                                    </li>
                                </ul>

                            <Link
                              to={`/admin/updateuser/${user.id}`}
                              className="btn btn-sm btn-secondary"
                            >
                              Update
                            </Link>

                            <button
                              onClick={() => handleDelete(user.id)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
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

export default ListUser