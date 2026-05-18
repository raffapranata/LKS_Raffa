import React, { useState } from 'react'
import api from '../../api/Api'
import { Link, useNavigate } from 'react-router-dom'

const Signin = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await api.post('/signin', formData)

      const token = res.data.token

      if (!token) {
        setMessage('Token tidak ditemukan')
        return
      }

      localStorage.setItem('token', token)
      localStorage.setItem('username', formData.username)

      try {
        await api.get('/admins', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        navigate('/admin/dashboard')
      } catch (adminError) {
        if (adminError.response?.status === 403) {

          navigate('/user/dashboard')
        } else if (adminError.response?.status === 401) {
          setMessage(adminError.response?.data?.message || 'Unauthenticated')
        } else {
          setMessage(adminError.response?.data?.message || 'Gagal cek admin')
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Signin failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <main>
        <section className="login">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-6">
                <h1 className="text-center mb-4">Gaming Portal</h1>
                <div className="card card-default">
                  <div className="card-body">
                    <h3 className="mb-3">Sign In</h3>

                    {message && (
                      <div className="alert alert-warning">
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSignin}>
                      <div className="form-group my-3">
                        <label htmlFor="username" className="mb-1 text-muted">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="form-control"
                          autoFocus
                        />
                      </div>

                      <div className="form-group my-3">
                        <label htmlFor="password" className="mb-1 text-muted">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="mt-4 row">
                        <div className="col">
                          <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                          >
                            {loading ? 'Loading...' : 'Sign In'}
                          </button>
                        </div>

                        <div className="col">
                          <Link to="/signup" className="btn btn-danger w-100">
                            Sign up
                          </Link>
                        </div>
                      </div>
                    </form>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Signin