import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/Api'

const BACKEND_URL = 'http://127.0.0.1:8000'

const DetailGames = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const username = localStorage.getItem('username') || 'Player'

  const [game, setGame] = useState(null)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/signin')
    }
  }, [navigate])

  useEffect(() => {
    const fetchDetailGames = async () => {
      try {
        setLoading(true)
        setError('')

        const [gameResponse, scoreResponse] = await Promise.all([
          api.get(`/games/${slug}`),
          api.get(`/games/${slug}/scores`),
        ])

        setGame(gameResponse.data)
        setScores(scoreResponse.data.scores || [])
      } catch (err) {
        console.log(err)
        setError('Failed to load game detail')
      } finally {
        setLoading(false)
      }
    }

    fetchDetailGames()
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

  const topTenScores = useMemo(() => {
    return scores.slice(0, 10)
  }, [scores])

  const userScoreInTopTen = useMemo(() => {
    return topTenScores.some((score) => score.username === username)
  }, [topTenScores, username])

  const currentUserBestScore = useMemo(() => {
    return scores.find((score) => score.username === username)
  }, [scores, username])

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return dateString

    return date.toLocaleString('id-ID')
  }

  const getVersionText = (gamePath) => {
    if (!gamePath) return '-'

    const cleanPath = gamePath.replace(/^\/|\/$/g, '')
    const parts = cleanPath.split('/')

    return parts[2] || '-'
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
        {loading && (
          <div className="container py-5">
            <div className="alert alert-info">Loading game detail...</div>
          </div>
        )}

        {error && (
          <div className="container py-5">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}

        {!loading && !error && game && (
          <>
            <div className="hero py-5 bg-light">
              <div className="container text-center">
                <h2 className="mb-1">{game.title}</h2>

                <Link to={`/user/userprofile/${game.author}`} className="btn btn-success">
                  By {game.author}
                </Link>

                <div className="text-muted">{game.description}</div>

                <h5 className="mt-2">
                  Last Version v{getVersionText(game.gamePath)} (
                  {formatDateTime(game.uploadTimestamp)})
                </h5>
              </div>
            </div>

            <div className="py-5">
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-8 col-md-10">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card mb-3">
                          <div className="card-body">
                            <h5>Top 10 Leaderboard</h5>

                            {topTenScores.length === 0 ? (
                              <p className="text-muted mb-0">No scores yet</p>
                            ) : (
                              <ol className="mb-0">
                                {topTenScores.map((score, index) => {
                                  const isCurrentUser =
                                    score.username === username

                                  return (
                                    <li key={index}>
                                      {isCurrentUser ? (
                                        <b>
                                          {score.username} ({score.score})
                                        </b>
                                      ) : (
                                        <>
                                          {score.username} ({score.score})
                                        </>
                                      )}
                                    </li>
                                  )
                                })}
                              </ol>
                            )}

                            {!userScoreInTopTen && currentUserBestScore && (
                              <div className="mt-3">
                                <strong>
                                  Your score: {currentUserBestScore.username} (
                                  {currentUserBestScore.score})
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        {game.thumbnail ? (
                          <img
                            src={`${BACKEND_URL}${game.thumbnail}`}
                            alt={`${game.title} Logo`}
                            style={{ width: '100%' }}
                          />
                        ) : (
                          <div className="text-muted mb-3">No thumbnail</div>
                        )}

                        {game.gamePath && (
                          <a
                            href={`${BACKEND_URL}${game.gamePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary w-100 mb-2 mt-2"
                          >
                            Download Game
                          </a>
                        )}
                      </div>
                    </div>

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

export default DetailGames