
import { useState, useEffect } from 'react'
import './App.css'
import Signup from './components/Signup'
import Login from './components/Login'

function App() {
  const [posts, setPosts] = useState([])
  const [user, setUser] = useState(null)
  const [view, setView] = useState('home')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // Check whether a user is already signed in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include'
        })

        const data = await response.json()
        setUser(data.user)
      } catch (err) {
        setError('Unable to check login status.')
      }
    }

    checkUser()
    fetchPosts()
  }, [])

  // Retrieve blog posts
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')

      if (!response.ok) {
        throw new Error('Failed to load blog posts.')
      }

      const data = await response.json()

      setPosts(Array.isArray(data) ? data : data.posts || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle successful login
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
    setView('home')
    setMessage('Welcome back, ' + loggedInUser.name + '!')
  }

  // Handle signup/login navigation
  const handleSwitch = (newView, newMessage = '') => {
    setView(newView)
    setMessage(newMessage)
    setError('')
  }

  // Log out
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Unable to log out.')
      }

      setUser(null)
      setView('home')
      setMessage('You have successfully logged out.')
    } catch (err) {
      setError(err.message)
    }
  }

  // Create a blog post
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post.')
      }

      setTitle('')
      setContent('')
      setMessage('Post published successfully!')
      fetchPosts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <h1 onClick={() => setView('home')}>My Blog</h1>

        <nav>
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => handleSwitch('login')}>
                Login
              </button>

              <button onClick={() => handleSwitch('signup')}>
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="container">

        {view === 'signup' && (
          <Signup onSwitch={handleSwitch} />
        )}

        {view === 'login' && (
          <Login
            onLogin={handleLogin}
            onSwitch={handleSwitch}
            message={message}
          />
        )}

        {view === 'home' && (
          <>
            <section className="welcome">
              <h2>Welcome to My Blog</h2>
              <p>
                Share your thoughts, experiences, and ideas with the world.
              </p>
            </section>

            {message && (
              <p className="success-message">{message}</p>
            )}

            {error && (
              <p className="error-message">{error}</p>
            )}

            {user && (
              <section className="create-post">
                <h2>Create a New Post</h2>

                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Blog title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <textarea
                    placeholder="What would you like to share?"
                    rows="5"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />

                  <button type="submit">Publish Post</button>
                </form>
              </section>
            )}

            {!user && (
              <p className="empty-message">
                Please log in to create a blog post.
              </p>
            )}

            <section className="posts">
              <h2>Recent Blog Posts</h2>

              {loading && <p>Loading blog posts...</p>}

              {!loading && posts.length === 0 && (
                <p className="empty-message">
                  No blog posts yet.
                </p>
              )}

              {posts.map((post) => (
                <article className="post-card" key={post.blog_id}>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  <small>Posted by {post.creator_name}</small>
                </article>
              ))}
            </section>
          </>
        )}

      </main>

      <footer>
        <p>
          My Blog | Built with React, Node.js, Express, and PostgreSQL
        </p>
      </footer>
    </div>
  )
}

export default App
