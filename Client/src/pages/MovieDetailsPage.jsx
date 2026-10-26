import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Clock, Calendar, MapPin, Ticket, ChevronRight, ShieldAlert } from 'lucide-react';

const formatShowDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatShowTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available dates (3 days starting today)
  const today = new Date();
  const dateOptions = [0, 1, 2].map(offset => {
    const d = new Date();
    d.setDate(today.getDate() + offset);
    return {
      label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      dateString: d.toISOString().split('T')[0]
    };
  });

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].dateString);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchShowsForDate();
    }
  }, [id, selectedDate]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getMovieById(id);
      if (data.success) {
        setMovie(data.movie);
      }
    } catch (err) {
      setError(err.message || 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const fetchShowsForDate = async () => {
    try {
      const data = await api.getShows({ movieId: id, date: selectedDate });
      if (data.success) {
        setShows(data.shows);
      }
    } catch (err) {
      console.error('Error fetching shows:', err);
    }
  };

  // Group shows by Theatre
  const showsByTheatre = shows.reduce((acc, show) => {
    const theatreId = show.theatreId?._id || 'unknown';
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatreId,
        shows: []
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#e50914',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading movie experiences...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <ShieldAlert size={48} color="#e50914" style={{ margin: '0 auto 1rem' }} />
        <h2>Movie Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.8rem 0 1.5rem' }}>
          {error || 'The requested movie is not currently available.'}
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Backdrop Header */}
      <div style={{
        position: 'relative',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        {/* Blurred backdrop image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          filter: 'blur(16px) brightness(0.25)',
          transform: 'scale(1.1)'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '3rem 1.5rem' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            {/* Poster Card */}
            <div style={{
              width: '240px',
              flexShrink: 0,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 16px 32px rgba(0,0,0,0.7)',
              border: '1px solid var(--border-subtle)'
            }}>
              <img
                src={movie.posterUrl}
                alt={movie.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Info Column */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{
                display: 'inline-block',
                backgroundColor: 'rgba(229, 9, 20, 0.2)',
                border: '1px solid var(--border-accent)',
                color: '#ff4d58',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '0.8rem'
              }}>
                {movie.language}
              </div>

              <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '0.8rem' }}>
                {movie.title}
              </h1>

              {/* Meta stats */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1.2rem',
                fontSize: '0.95rem',
                color: '#cbd5e1',
                marginBottom: '1.2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700 }}>
                  <Star size={18} fill="#fbbf24" />
                  <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'} / 10</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} />
                  <span>{movie.durationMinutes} mins</span>
                </div>
                <span>•</span>
                <span>{movie.genre?.join(', ')}</span>
              </div>

              <p style={{
                fontSize: '0.95rem',
                color: '#94a3b8',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                maxWidth: '750px'
              }}>
                {movie.description}
              </p>

              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Cast & Crew
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {movie.cast.map(actor => (
                      <span key={actor} style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#e2e8f0'
                      }}>
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Theatre Selection */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.2rem' }}>Book Showtimes</h2>

        {/* Date Selector Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.8rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {dateOptions.map(tab => {
            const isActive = selectedDate === tab.dateString;
            return (
              <button
                key={tab.dateString}
                onClick={() => setSelectedDate(tab.dateString)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? '#e50914' : 'var(--bg-secondary)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  border: isActive ? '1px solid #e50914' : '1px solid var(--border-subtle)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px var(--primary-glow)' : 'none'
                }}
              >
                <Calendar size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Theatres Listing */}
        {Object.keys(showsByTheatre).length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <Clock size={40} color="#64748b" style={{ margin: '0 auto 0.8rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No Shows Scheduled</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              There are no available showtimes for this date. Please check another date tab above.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.values(showsByTheatre).map(({ theatre, shows: theatreShows }) => (
              <div
                key={theatre?._id || Math.random()}
                className="glass-panel"
                style={{ padding: '1.8rem' }}
              >
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.2rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>
                      {theatre?.name || 'Multiplex Cinema'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <MapPin size={14} color="#e50914" />
                      <span>{theatre?.address}, {theatre?.city}</span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-subtle)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    M-Ticket Available • Food & Beverage
                  </div>
                </div>

                {/* Showtime Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {theatreShows.map(show => (
                    <button
                      key={show._id}
                      onClick={() => navigate(`/shows/${show._id}/seats`)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        minWidth: '120px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#e50914';
                        e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                        {formatShowTime(show.startTime)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        Screen {show.screenNumber} • 4K
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        from ₹{show.pricing?.standard || 150}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;
