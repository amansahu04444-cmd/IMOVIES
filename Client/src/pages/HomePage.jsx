import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import MovieCard from '../components/MovieCard';
import HeroBanner from '../components/HeroBanner';
import { Search, SlidersHorizontal, Film, AlertCircle } from 'lucide-react';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Adventure', 'Animation', 'Crime'];

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedLanguage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMovies({
        genre: selectedGenre,
        language: selectedLanguage
      });

      if (data.success) {
        setMovies(data.movies);
        if (!featuredMovie && data.movies.length > 0) {
          const featured = data.movies.find(m => m.isFeatured) || data.movies[0];
          setFeaturedMovie(featured);
        }
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
      if (err.isNetworkError || err.status === 0) {
        setError('Unable to connect to cinema server. Please verify backend is running and CORS is configured.');
      } else if (err.status === 404) {
        setError(err.message || 'Movie API endpoint not found (404). Please verify backend URL configuration.');
      } else if (err.status === 503 || err.errorType === 'DATABASE_UNAVAILABLE' || err.errorType === 'DATABASE_ERROR') {
        setError('Could not connect to cinema database. Please ensure backend is running.');
      } else {
        setError(err.message || 'Failed to load movies. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Client-side instant title/cast search
  const filteredMovies = movies.filter(movie => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const titleMatch = movie.title.toLowerCase().includes(q);
    const castMatch = movie.cast?.some(c => c.toLowerCase().includes(q));
    const genreMatch = movie.genre?.some(g => g.toLowerCase().includes(q));
    return titleMatch || castMatch || genreMatch;
  });

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Hero Banner */}
      {featuredMovie && <HeroBanner movie={featuredMovie} />}

      {/* Discovery & Filter Bar */}
      <div style={{
        marginBottom: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Now Showing</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select a movie to explore theatre showtimes and reserve seats
            </p>
          </div>

          {/* Search Input */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '320px'
          }}>
            <Search
              size={18}
              color="var(--text-subtle)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by title, cast, or genre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(229, 9, 20, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
            />
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {GENRES.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  backgroundColor: isActive ? '#e50914' : 'var(--bg-secondary)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  border: isActive ? '1px solid #e50914' : '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding: '1.2rem 1.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#f87171',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchMovies}
            style={{
              padding: '6px 16px',
              backgroundColor: '#e50914',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.8rem'
        }}>
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              style={{
                height: '420px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                animation: 'pulse 1.5s infinite ease-in-out'
              }}
            />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }`}</style>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Film size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Movies Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No titles match your search criteria. Try selecting another genre or clearing the search query.
          </p>
        </div>
      ) : (
        /* Movie Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.8rem'
        }}>
          {filteredMovies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
