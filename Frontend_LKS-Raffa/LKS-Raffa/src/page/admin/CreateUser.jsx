import React, { useState } from 'react'
import api from '../../api/Api'
import { Link, useNavigate } from 'react-router-dom'

const CreateUser = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await api.post('/users', formData)
      setMessage(res.data.message || 'success')

      setTimeout(() => {
        navigate('/admin/listusers')
      }, 1000)
    } catch (error) {
      setMessage(error.response?.data?.message || 'create user failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <div className="hero py-5 bg-light">
        <div className="container text-center">
          <h2 className="mb-3">Manage User - Administrator Portal</h2>
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

              <form onSubmit={handleSubmit}>
                <div className="form-item card card-default my-4">
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="username" className="mb-1 text-muted">
                        Username <span className="text-danger">*</span>
                      </label>
                      <input
                        id="username"
                        type="text"
                        placeholder="Username"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-item card card-default my-4">
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="password" className="mb-1 text-muted">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 row">
                  <div className="col">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={saving}
                    >
                      {saving ? 'Loading...' : 'Submit'}
                    </button>
                  </div>

                  <div className="col">
                    <Link to="/admin/listusers" className="btn btn-danger w-100">
                      Back
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

export default CreateUser