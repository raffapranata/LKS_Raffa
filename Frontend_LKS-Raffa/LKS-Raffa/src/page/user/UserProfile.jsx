import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/Api'

const BACKEND_URL = 'http://127.0.0.1:8000'

const UserProfile = () => {
  const navigate = useNavigate()
  const { username: routeUsername } = useParams()

  const loggedInUsername = localStorage.getItem('username') || 'Player'
  const profileUsername = routeUsername || loggedInUsername

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/signin')
    }
  }, [navigate])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/users/${profileUsername}`)
        setProfile(response.data)
      } catch (err) {
        console.log(err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [profileUsername])

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
              <Link
                to="/user/profile"
                className="nav-link px-2 text-white active"
              >
                User Profile
              </Link>
            </li>

            <li className="nav-item">
              <span className="nav-link active bg-dark">
                Welcome, {loggedInUsername}
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
        {loading && (
          <div className="container py-5">
            <div className="alert alert-info">Loading profile...</div>
          </div>
        )}

        {error && (
          <div className="container py-5">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}

        {!loading && !error && profile && (
          <>
            <div className="hero py-5 bg-light">
              <div className="container text-center">
                <h2 className="mb-1">{profile.username}</h2>
                <h5 className="mt-2">
                  Last Login {formatDateTime(profile.last_login_at)}
                </h5>
              </div>
            </div>

            <div className="py-5">
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-8 col-md-10">
                    <h5>Highscores per Game</h5>
                    <div className="card-body">
                      {profile.highscores && profile.highscores.length > 0 ? (
                        <ol>
                          {profile.highscores.map((item, index) => (
                            <li key={index}>
                              <Link to={`/user/discovergames/${item.game.slug}`}>
                                {item.game.title} ({item.score})
                              </Link>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-muted">No highscores yet</p>
                      )}
                    </div>

                    {profile.authoredGames && profile.authoredGames.length > 0 && (
                      <>
                        <h5>Authored Games</h5>

                        {profile.authoredGames.map((game, index) => (
                          <Link
                            key={index}
                            to={`/user/discovergames/${game.slug}`}
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
                                      By {profile.username}
                                    </small>
                                  </h5>

                                  <div>{game.description}</div>

                                  <hr className="mt-1 mb-1" />

                                  <div className="text-muted">
                                    #scores submitted : {game.scoreCount ?? 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </>
                    )}

                    <Link
                      to="/user/discovergames"
                      className="btn btn-danger w-100"
                    >
                      Back
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default UserProfile