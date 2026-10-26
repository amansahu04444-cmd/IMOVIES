import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { CheckCircle2, Ticket, Calendar, Clock, MapPin, Printer, ArrowRight, Film } from 'lucide-react';

const formatShowDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatShowTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking && id) {
      fetchBooking();
    }
  }, [id, booking]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await api.getBookingById(id);
      if (data.success && data.booking) {
        setBooking(data.booking);
      }
    } catch (err) {
      setError(err.message || 'Could not fetch booking confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving your booking confirmation...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2>Booking Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error}</p>
        <Link to="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }

  const show = booking.showId || {};
  const movie = show.movieId || {};
  const theatre = show.theatreId || {};

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '780px' }}>
      {/* Header status */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          marginBottom: '1rem',
          boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)'
        }}>
          <CheckCircle2 size={36} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Your digital ticket has been issued. Show this pass at the cinema turnstile.
        </p>
      </div>

      {/* Ticket Pass Stub Container */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(229, 9, 20, 0.3)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(229, 9, 20, 0.15)'
        }}
      >
        {/* Ticket Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px dashed var(--border-subtle)',
          paddingBottom: '1.2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#e50914', color: 'white', padding: '6px', borderRadius: '6px' }}>
              <Film size={18} />
            </div>
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.1rem' }}>IMOVIES PASS</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Reference</span>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: '#e50914',
              letterSpacing: '0.05em'
            }}>
              {booking.bookingReference}
            </div>
          </div>
        </div>

        {/* Movie Info Grid */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.8rem', alignItems: 'center' }}>
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{
                width: '90px',
                aspectRatio: '2/3',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{movie.title || 'Movie Experience'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              <MapPin size={15} color="#e50914" />
              <span>{theatre.name || 'Theatre'}, {theatre.city} (Screen {show.screenNumber || 1})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <Clock size={15} />
              <span>{formatShowDate(show.startTime)}, {formatShowTime(show.startTime)}</span>
            </div>
          </div>
        </div>

        {/* Seats & Payment Details */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          padding: '1.2rem',
          borderRadius: 'var(--radius-md)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.8rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Seats Booked
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {booking.seats.map(s => (
                <span key={s} style={{
                  backgroundColor: '#e50914',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Status
            </div>
            <span style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              {booking.bookingStatus}
            </span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Total Amount
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>
              ₹{booking.totalAmount}
            </div>
          </div>
        </div>

        {/* Mock Digital Barcode / QR */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          borderTop: '1px dashed var(--border-subtle)',
          paddingTop: '1.2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '3px',
            height: '40px',
            alignItems: 'center',
            opacity: 0.7
          }}>
            {[4, 2, 6, 2, 8, 3, 5, 2, 7, 3, 4, 6, 2, 5, 8, 3, 2, 6, 4, 3, 7].map((w, i) => (
              <div key={i} style={{ width: `${w}px`, height: '100%', backgroundColor: '#f8fafc' }} />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
            SCAN FOR CINEMA TURNSTILE ENTRY
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <button onClick={handlePrint} className="btn-secondary" style={{ gap: '0.5rem' }}>
          <Printer size={16} />
          <span>Print / Save Ticket</span>
        </button>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <Link to="/my-bookings" className="btn-secondary">
            View All My Bookings
          </Link>
          <Link to="/" className="btn-primary" style={{ gap: '0.4rem' }}>
            <span>Explore More</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
