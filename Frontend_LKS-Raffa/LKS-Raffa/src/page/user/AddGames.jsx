import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/Api'

const ManageGamesCreate = () => {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [gameFile, setGameFile] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/signin')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!title || !description || !thumbnail || !gameFile) {
      setError('All fields are required')
      return
    }

    if (!gameFile.name.toLowerCase().endsWith('.zip')) {
      setError('Game file must be a .zip file')
      return
    }

    try {
      setLoading(true)

      const createResponse = await api.post('/games', {
        title,
        description,
      })

      const slug = createResponse.data.slug

      const formData = new FormData()
      formData.append('token', localStorage.getItem('token'))
      formData.append('thumbnail', thumbnail)
      formData.append('zipfile', gameFile)

      await api.post(`/games/${slug}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Game created successfully')

      setTimeout(() => {
        navigate('/user/managegames')
      }, 1000)
    } catch (err) {
      console.log(err)

      if (err.response?.data?.slug) {
        setError(err.response.data.slug)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (typeof err.response?.data === 'string') {
        setError(err.response.data)
      } else {
        setError('Failed to create game')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="hero py-5 bg-light">
        <div className="container text-center">
          <h2 className="mb-3">Manage Games - Gaming Portal</h2>
        </div>
      </div>

      <div className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-6">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-item card card-default my-4">
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="title" className="mb-1 text-muted">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input
                        id="title"
                        type="text"
                        placeholder="Title"
                        className="form-control"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-item card card-default my-4">
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="description" className="mb-1 text-muted">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="description"
                        className="form-control"
                        placeholder="Description"
                        id="description"
                        cols="30"
                        rows="5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="form-item card card-default my-4">
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="thumbnail" className="mb-1 text-muted">
                        Thumbnail <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        name="thumbnail"
                        className="form-control"
                        id="thumbnail"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-item card card-default my-4">
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="game" className="mb-1 text-muted">
                        File Game <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        name="game"
                        className="form-control"
                        id="game"
                        accept=".zip"
                        onChange={(e) => setGameFile(e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 row">
                  <div className="col">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                  <div className="col">
                    <Link to="/user/managegames" className="btn btn-danger w-100">
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

export default ManageGamesCreate
