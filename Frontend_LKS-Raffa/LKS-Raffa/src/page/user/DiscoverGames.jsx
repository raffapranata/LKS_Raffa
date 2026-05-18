import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/Api'

const BACKEND_URL = 'http://127.0.0.1:8000'

const DiscoverGames = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Player'

  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/signin')
    }
  }, [navigate])

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/games')
        setGames(response.data.content || [])
      } catch (err) {
        console.log(err)
        setError('Failed to load games data')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

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

  const sortedGames = useMemo(() => {
    const copiedGames = [...games]

    copiedGames.sort((a, b) => {
      let compareValue = 0

      if (sortBy === 'popularity') {
        compareValue = (a.scoreCount || 0) - (b.scoreCount || 0)
      } else if (sortBy === 'alphabetically') {
        compareValue = (a.title || '').localeCompare(b.title || '')
      } else if (sortBy === 'recently_updated') {
        compareValue =
          new Date(a.uploadTimestamp || 0) - new Date(b.uploadTimestamp || 0)
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return copiedGames
  }, [games, sortBy, sortOrder])

  return (
    <div>
      <nav className="navbar navbar-expand-lg sticky-top bg-primary navbar-dark">
        <div className="container">
          <Link className="navbar-brand" to="/user/dashboard">
            Gaming Portal
          </Link>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li>
              <Link
                to="/user/discovergames"
                className="nav-link px-2 text-white active"
              >
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
            <h1>Discover Games</h1>
          </div>
        </div>

        <div className="list-form py-5">
          <div className="container">
            <div className="row">
              <div className="col">
                <h2 className="mb-3">{games.length} Game Available</h2>
              </div>

              <div className="col-lg-8 text-lg-end">
                <div className="mb-3">
                  <div className="btn-group me-2 mb-2" role="group">
                    <button
                      type="button"
                      className={`btn ${
                        sortBy === 'popularity'
                          ? 'btn-secondary'
                          : 'btn-outline-primary'
                      }`}
                      onClick={() => setSortBy('popularity')}
                    >
                      Popularity
                    </button>

                    <button
                      type="button"
                      className={`btn ${
                        sortBy === 'recently_updated'
                          ? 'btn-secondary'
                          : 'btn-outline-primary'
                      }`}
                      onClick={() => setSortBy('recently_updated')}
                    >
                      Recently Updated
                    </button>

                    <button
                      type="button"
                      className={`btn ${
                        sortBy === 'alphabetically'
                          ? 'btn-secondary'
                          : 'btn-outline-primary'
                      }`}
                      onClick={() => setSortBy('alphabetically')}
                    >
                      Alphabetically
                    </button>
                  </div>

                  <div className="btn-group mb-2" role="group">
                    <button
                      type="button"
                      className={`btn ${
                        sortOrder === 'asc'
                          ? 'btn-secondary'
                          : 'btn-outline-primary'
                      }`}
                      onClick={() => setSortOrder('asc')}
                    >
                      ASC
                    </button>

                    <button
                      type="button"
                      className={`btn ${
                        sortOrder === 'desc'
                          ? 'btn-secondary'
                          : 'btn-outline-primary'
                      }`}
                      onClick={() => setSortOrder('desc')}
                    >
                      DESC
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="alert alert-info">Loading games...</div>
            )}

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {!loading && !error && sortedGames.length === 0 && (
              <div className="alert alert-warning">No games available</div>
            )}

            <div className="row">
              {!loading &&
                !error &&
                sortedGames.map((game) => (
                  <div className="col-md-6" key={game.slug}>
                    <Link
                      to={`/user/detailgames/${game.slug}`}
                      className="card card-default mb-3 text-decoration-none text-dark"
                    >
                      <div className="card-body">
                        <div className="row">
                          <div className="col-4">
                            {game.thumbnail ? (
                              <img
                                src={`${BACKEND_URL}${game.thumbnail}`}
                                alt={`${game.title} Logo`}
                                style={{ width: '100%' }}
                              />
                            ) : (
                              <div className="text-muted">No thumbnail</div>
                            )}
                          </div>

                          <div className="col">
                            <h5 className="mb-1">
                              {game.title}{' '}
                              <small className="text-muted">
                                By {game.author}
                              </small>
                            </h5>

                            <div>{game.description}</div>

                            <hr className="mt-1 mb-1" />

                            <div className="text-muted">
                              #scores submitted : {game.scoreCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DiscoverGames