import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/Api'

const BACKEND_URL = 'http://127.0.0.1:8000'

const UpdateGames = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const username = localStorage.getItem('username') || 'Player'
  const token = localStorage.getItem('token')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [gameFile, setGameFile] = useState(null)

  const [game, setGame] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/signin')
    }
  }, [token, navigate])

  const getVersionFromGamePath = (gamePath) => {
  if (!gamePath) return null

  const cleanPath = gamePath.replace(/^\/|\/$/g, '')
  const parts = cleanPath.split('/')

  return parts[2] || null
  }

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/games/${slug}`)
        const gameData = response.data

        setGame(gameData)
        setTitle(gameData.title || '')
        setDescription(gameData.description || '')

        const versionFromPath = getVersionFromGamePath(gameData.gamePath)
        const uploadTime = gameData.uploadTimestamp

        if (versionFromPath && uploadTime) {
          setVersions([
            {
              version: versionFromPath,
              uploadTimestamp: uploadTime,
            },
          ])
        } else {
          setVersions([])
        }
      } catch (err) {
        console.log(err)
        setError('Failed to load game data')
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [slug])

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

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return dateString

    return date.toLocaleString('id-ID')
  }

  const currentThumbnailUrl = useMemo(() => {
    if (!game?.thumbnail) return null
    return `${BACKEND_URL}${game.thumbnail}`
  }, [game])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!title || !description) {
      setError('Title and description are required')
      return
    }

    if (gameFile && !gameFile.name.toLowerCase().endsWith('.zip')) {
      setError('Game file must be a .zip file')
      return
    }

    try {
      setSubmitting(true)

      await api.put(`/games/${slug}`, {
        title,
        description,
      })

      if (gameFile) {
        const formData = new FormData()
        formData.append('token', token)
        formData.append('zipfile', gameFile)

        if (thumbnail) {
          formData.append('thumbnail', thumbnail)
        }

        await api.post(`/games/${slug}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      setSuccess('Game updated successfully')

      setTimeout(() => {
        navigate('/user/managegames')
      }, 1000)
    } catch (err) {
      console.log(err)

      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.slug) {
        setError(err.response.data.slug)
      } else if (typeof err.response?.data === 'string') {
        setError(err.response.data)
      } else {
        setError('Failed to update game')
      }
    } finally {
      setSubmitting(false)
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
              <Link
                to="/user/managegames"
                className="nav-link px-2 text-white active"
              >
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
            <h2 className="mb-3">Manage Games - Gaming Portal</h2>
          </div>
        </div>

        <div className="py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-6">
                {loading && (
                  <div className="alert alert-info">Loading game...</div>
                )}

                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                {success && (
                  <div className="alert alert-success">{success}</div>
                )}

                {!loading && !error && (
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
                            Thumbnail{' '}
                            <span className="text-danger">
                              (select the file if you want to change it)
                            </span>
                          </label>
                          <input
                            type="file"
                            name="thumbnail"
                            className="form-control"
                            id="thumbnail"
                            accept="image/*"
                            onChange={(e) => setThumbnail(e.target.files[0])}
                          />

                          {currentThumbnailUrl && (
                            <img
                              src={currentThumbnailUrl}
                              alt={`${title} Logo`}
                              width="80"
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-item card card-default my-4">
                      <div className="card-body">
                        <div className="form-group">
                          <label htmlFor="game" className="mb-1 text-muted">
                            File Game{' '}
                            <span className="text-danger">
                              (select the file if you want to update it)
                            </span>
                          </label>
                          <input
                            type="file"
                            name="game"
                            className="form-control"
                            id="game"
                            accept=".zip"
                            onChange={(e) => setGameFile(e.target.files[0])}
                          />

                          <b>Versions:</b>
                          <ul className="mb-0">
                            {versions.length > 0 ? (
                              versions.map((item, index) => (
                                <li key={index}>
                                  v{item.version} -{' '}
                                  {formatDateTime(item.uploadTimestamp)}
                                </li>
                              ))
                            ) : (
                              <li>No version data</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 row">
                      <div className="col">
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={submitting}
                        >
                          {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                      <div className="col">
                        <Link
                          to="/user/managegames"
                          className="btn btn-danger w-100"
                        >
                          Back
                        </Link>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UpdateGames