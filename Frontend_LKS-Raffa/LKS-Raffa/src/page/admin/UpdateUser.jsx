import React, { useEffect, useState } from 'react'
import api from '../../api/Api'
import { Link, useNavigate, useParams } from 'react-router-dom'

const UpdateUser = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users')
        const user = res.data.content.find((u) => String(u.id) === String(id))

        if (!user) {
          setMessage('User not found')
          return
        }

        setFormData({
          username: user.username,
          password: '',
        })
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed get data users')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

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
      const res = await api.put(`/users/${id}`, formData)
      setMessage(res.data.message || 'success')

      setTimeout(() => {
        navigate('/admin/listusers')
      }, 1000)
    } catch (error) {
      setMessage(error.response?.data?.message || 'update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="container py-5">Loading...</div>
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

export default UpdateUser