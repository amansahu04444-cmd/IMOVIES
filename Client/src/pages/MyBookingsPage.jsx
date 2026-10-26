import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, Calendar, Clock, MapPin, XCircle, AlertCircle, CheckCircle2, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatShowDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatShowTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getMyBookings();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking history');
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
        // Update local list
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
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your tickets...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '880px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>My Bookings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          View all your upcoming cinema reservations and past booking history
        </p>
      </div>

      {actionSuccess && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '1rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div style={{
          padding: '4rem 1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Ticket size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>No Bookings Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You haven't reserved any cinema tickets yet. Explore trending movies to book now!
          </p>
          <Link to="/" className="btn-primary">
            Explore Movies
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map(booking => {
            const show = booking.showId || {};
            const movie = show.movieId || {};
            const theatre = show.theatreId || {};
            const isCancelled = booking.bookingStatus === 'CANCELLED';

            return (
              <div
                key={booking._id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  alignItems: 'center',
                  opacity: isCancelled ? 0.7 : 1,
                  border: isCancelled ? '1px solid var(--border-subtle)' : '1px solid rgba(229, 9, 20, 0.25)'
                }}
              >
                {/* Poster */}
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    style={{
                      width: '75px',
                      aspectRatio: '2/3',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      flexShrink: 0
                    }}
                  />
                )}

                {/* Info Details */}
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      color: isCancelled ? 'var(--text-subtle)' : '#e50914',
                      fontSize: '0.9rem'
                    }}>
                      {booking.bookingReference}
                    </span>
                    <span style={{
                      backgroundColor: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: isCancelled ? '#ef4444' : '#10b981',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {booking.bookingStatus}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                    {movie.title || 'Movie Experience'}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#e50914" />
                      {theatre.name || 'Multiplex'}, {theatre.city}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {formatShowDate(show.startTime)}, {formatShowTime(show.startTime)}
                    </span>
                  </div>

                  {/* Seats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-subtle)' }}>Seats:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {booking.seats.map(s => (
                        <span key={s} style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#e2e8f0',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.8rem'
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '0.8rem'
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Paid</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>
                      ₹{booking.totalAmount}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/booking/confirmation/${booking._id}`}
                      className="btn-secondary"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                    >
                      View Ticket
                    </Link>

                    {!isCancelled && (
                      <button
                        onClick={() => setCancelModalBooking(booking)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '0.45rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {cancelModalBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            border: '1px solid rgba(239, 68, 68, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444', marginBottom: '1rem' }}>
              <AlertCircle size={24} />
              <h3 style={{ fontSize: '1.25rem' }}>Cancel Booking?</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingReference}</strong>?
              Your seats ({cancelModalBooking.seats.join(', ')}) will be released immediately back into the available pool.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.65rem 1.2rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Yes, Cancel & Release Seats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
