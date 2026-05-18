import React, { useState } from 'react'
import api from '../../api/Api'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {
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

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.post('/signup', formData)

      setMessage('success')

      setTimeout(() => {
        navigate('/')
      }, 1000)

    } catch (error) {
      setMessage(
        error.response?.data?.message || 'request failed',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="hero py-5 bg-light">
        <div className="container text-center">
          <h2 className="mb-3">Sign Up - Gaming Portal</h2>
          <div className="text-muted">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
          </div>
        </div>
      </div>

      <div className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-6">

              {message && (
                <div className="alert alert-warning">
                  {message}
                </div>
              )}

              <form onSubmit={handleSignup}>
                <div className="form-item card card-default my-4">
                  <div className="card-body">
                    <div className="form-group">
                      <label className="mb-1 text-muted">
                        Username <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        className="form-control"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-item card card-default my-4">
                  <div className="card-body">
                    <div className="form-group">
                      <label className="mb-1 text-muted">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"   
                        placeholder="Password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 row">
                  <div className="col">
                    <button
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Sign Up'}
                    </button>
                  </div>

                  <div className="col">
                    <Link to="/" className="btn btn-danger w-100">
                      Sign In
                    </Link>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Signup