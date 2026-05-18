import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/Api'

const BACKEND_URL = 'http://127.0.0.1:8000'

const ManageGames = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Player'

  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        setError('Failed to load games')
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

  const handleDelete = async (slug) => {
    const confirmDelete = window.confirm(
      'Delete Game?'
    )

    if (!confirmDelete) return

    try {
      await api.delete(`/games/${slug}`)
      setGames((prevGames) => prevGames.filter((game) => game.slug !== slug))
    } catch (error) {
      console.log(error)
      alert('Failed to delete game')
    }
  }

  const myGames = useMemo(() => {
    return games.filter((game) => game.author === username)
  }, [games, username])

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
                className="nav-link px-2 text-white"
              >
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
          <div className="container">
            <Link to="/user/addgames" className="btn btn-primary">
              Add Game
            </Link>
          </div>
        </div>

        <div className="list-form py-5">
          <div className="container">
            <h6 className="mb-3">List Games</h6>

            {loading && (
              <div className="alert alert-info">Loading games...</div>
            )}

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {!loading && !error && myGames.length === 0 && (
              <div className="alert alert-warning">
                You do not have any games yet
              </div>
            )}

            {!loading && !error && myGames.length > 0 && (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th width="170">Thumbnail</th>
                      <th width="200">Title</th>
                      <th width="500">Description</th>
                      <th width="220">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {myGames.map((game) => (
                      <tr key={game.slug}>
                        <td style={{ verticalAlign: 'top' }}>
                          {game.thumbnail ? (
                            <img
                              src={`${BACKEND_URL}${game.thumbnail}`}
                              alt={game.title}
                              style={{ width: '100%' }}
                            />
                          ) : (
                            <span>No thumbnail</span>
                          )}
                        </td>

                        <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                          {game.title}
                        </td>
                        <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                          {game.description}
                        </td>

                        <td style={{ verticalAlign: 'top', paddingTop: '0.75rem' }}>
                          <div className="d-inline-flex gap-2 flex-nowrap align-items-center">
                          <Link
                            to={`/user/detailgames/${game.slug}`}
                            className="btn btn-sm btn-primary"
                          >
                            Detail
                          </Link>

                          <Link
                            to={`/user/updategames/${game.slug}`}
                            className="btn btn-sm btn-secondary"
                          >
                            Update
                          </Link>

                          <button
                            onClick={() => handleDelete(game.slug)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ManageGames
