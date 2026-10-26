import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  Film, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  CreditCard,
  XCircle,
  AlertCircle
} from 'lucide-react';

const formatShowDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatShowTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const UserDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);

  // If the logged-in user is an administrator, redirect them to the Admin Dashboard
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, moviesRes] = await Promise.all([
        api.getMyBookings(),
        api.getMovies()
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.bookings || []);
      }
      if (moviesRes.success) {
        setFeaturedMovies((moviesRes.movies || []).slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;

    try {
      const response = await api.cancelBooking(cancelModalBooking._id);
      if (response.success) {
        setActionSuccess(`Booking ${cancelModalBooking.bookingReference} has been cancelled and seats released.`);
        setBookings(prev =>
          prev.map(b => b._id === cancelModalBooking._id ? { ...b, bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : b)
        );
      }
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setCancelModalBooking(null);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const activeBookings = bookings.filter(b => b.bookingStatus === 'CONFIRMED');
  const pastBookings = bookings.filter(b => b.bookingStatus !== 'CONFIRMED');
  const totalSpent = bookings
    .filter(b => b.bookingStatus === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative backdrop glow */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(229, 9, 20, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px var(--primary-glow)'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                  Welcome back, {user?.name || 'Moviegoer'}!
                </h1>
                <span style={{
                  backgroundColor: 'rgba(229, 9, 20, 0.15)',
                  color: '#e50914',
                  border: '1px solid rgba(229, 9, 20, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {user?.role || 'USER'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                {user?.email} • IMovies Cinephile Member
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <Link to="/" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem' }}>
              <Film size={18} />
              <span>Explore Movies</span>
            </Link>
            <Link to="/my-bookings" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem' }}>
              <Ticket size={18} />
              <span>All Bookings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Total Bookings */}
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Total Bookings</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(229, 9, 20, 0.1)', color: '#e50914' }}>
              <Ticket size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{bookings.length}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>All-time ticket reservations</span>
        </div>

        {/* Active Reservations */}
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Active Tickets</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{activeBookings.length}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Ready for cinema entry</span>
        </div>

        {/* Total Spent */}
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Total Investment</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(245, 166, 35, 0.1)', color: '#f5a623' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f5a623' }}>₹{totalSpent}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Total cinema spend</span>
        </div>

        {/* Membership Tier */}
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Club Status</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#a855f7' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.3rem', color: '#c084fc' }}>
            Gold Cinephile
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Instant booking privileges</span>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          padding: '1rem 1.2rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Active & Recent Bookings Section */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Upcoming & Active Reservations</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Your current cinema tickets and booking details
            </p>
          </div>
          <Link to="/my-bookings" style={{ color: '#e50914', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>View All History</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#e50914',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your dashboard tickets...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <Film size={44} color="var(--text-subtle)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Active Bookings Right Now</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              You don't have any upcoming reservations. Catch the latest blockbusters and reserve your favorite seats now!
            </p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Film size={18} />
              <span>Browse Now Showing</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {activeBookings.slice(0, 3).map(booking => {
              const show = booking.showId;
              const movie = show?.movieId;
              const theatre = show?.theatreId;

              return (
                <div
                  key={booking._id}
                  className="glass-panel"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', padding: '1.2rem' }}>
                    <img
                      src={movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400'}
                      alt={movie?.title || 'Movie Poster'}
                      style={{
                        width: '80px',
                        height: '115px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {booking.bookingStatus}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-subtle)' }}>
                          {booking.bookingReference}
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        margin: '0 0 0.4rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {movie?.title || 'Selected Movie'}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} color="#e50914" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {theatre?.name || 'Multiplex'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} color="var(--text-subtle)" />
                          <span>{formatShowDate(show?.startTime)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} color="var(--text-subtle)" />
                          <span>{formatShowTime(show?.startTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: 'auto',
                    padding: '0.8rem 1.2rem',
                    borderTop: '1px solid var(--border-subtle)',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Reserved Seats</span>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {booking.seats.map(s => (
                          <span key={s} style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            color: '#e2e8f0'
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link
                        to={`/booking/confirmation/${booking._id}`}
                        state={{ booking }}
                        style={{
                          fontSize: '0.8rem',
                          color: '#e50914',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(229, 9, 20, 0.3)'
                        }}
                      >
                        View Slip
                      </Link>
                      <button
                        type="button"
                        onClick={() => setCancelModalBooking(booking)}
                        style={{
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'none',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured / Trending Movies Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Recommended For You</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Trending cinema selections available for instant booking
            </p>
          </div>
          <Link to="/" style={{ color: '#e50914', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>View Full Catalogue</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {featuredMovies.map(movie => (
            <div
              key={movie._id}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#f5a623',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  ★ {movie.rating}
                </div>
              </div>

              <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#f8fafc' }}>
                  {movie.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                  {movie.genre?.join(', ')} • {movie.durationMinutes} mins
                </p>
                <Link
                  to={`/movies/${movie._id}`}
                  className="btn-primary"
                  style={{
                    marginTop: 'auto',
                    textAlign: 'center',
                    padding: '0.65rem',
                    fontSize: '0.85rem'
                  }}
                >
                  Book Showtimes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem'
            }}>
              <AlertCircle size={30} />
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>Confirm Cancellation</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to cancel booking <strong style={{ color: 'white' }}>{cancelModalBooking.bookingReference}</strong>?
              Your reserved seats ({cancelModalBooking.seats?.join(', ')}) will be released immediately.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
