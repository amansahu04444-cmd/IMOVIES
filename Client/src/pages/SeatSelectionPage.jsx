import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatGrid from '../components/SeatGrid';
import { Ticket, Clock, MapPin, AlertTriangle, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

const formatShowDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatShowTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const SeatSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [showData, setShowData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [conflictError, setConflictError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchSeats();
  }, [id]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await api.getShowSeats(id);
      if (data.success) {
        setShowData(data);
      }
    } catch (err) {
      console.error('Failed to load seat layout:', err);
      if (err.isNetworkError || err.status === 0) {
        setLoadError('Unable to connect to cinema server. Please verify backend is running and CORS is configured.');
      } else if (err.status === 404) {
        setLoadError('Screening layout endpoint not found (404). Please verify backend route configuration.');
      } else {
        setLoadError(err.message || 'Failed to load cinema seat layout. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeat = (seat) => {
    setConflictError(null);
    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats(prev => [...prev, seat.seatNumber]);
    }
  };

  // Compute live price breakdown
  const calculateTotal = () => {
    if (!showData || !showData.pricing) return { subtotal: 0, fee: 0, grandTotal: 0, items: [] };

    let subtotal = 0;
    const items = selectedSeats.map(seatNumber => {
      const rowLetter = seatNumber.charAt(0);
      let tier = 'standard';
      if (['C', 'D', 'E'].includes(rowLetter)) tier = 'premium';
      else if (['F', 'G', 'H'].includes(rowLetter)) tier = 'vip';

      const price = showData.pricing[tier] || 150;
      subtotal += price;
      return { seatNumber, tier, price };
    });

    const fee = selectedSeats.length > 0 ? 30 : 0;
    const grandTotal = subtotal + fee;

    return { subtotal, fee, grandTotal, items };
  };

  const { subtotal, fee, grandTotal, items } = calculateTotal();

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/shows/${id}/seats` } });
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }

    try {
      setBookingInProgress(true);
      setConflictError(null);

      const response = await api.createBooking({
        showId: id,
        seats: selectedSeats
      });

      if (response.success && response.booking) {
        navigate(`/booking/confirmation/${response.booking._id}`, {
          state: { booking: response.booking }
        });
      }
    } catch (err) {
      if (err.status === 409) {
        setConflictError('One or more of your chosen seats were just booked by another user! The seating layout has been refreshed.');
        // Refresh seats to display fresh state
        fetchSeats();
        // Clear conflicting selection
        setSelectedSeats([]);
      } else {
        setConflictError(err.message || 'Booking transaction failed. Please try again.');
      }
    } finally {
      setBookingInProgress(false);
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
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading live cinema seat layout...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!showData) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2>Show Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          {loadError || 'The requested screening layout could not be loaded.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={fetchSeats} className="btn-primary" style={{ backgroundColor: '#e50914' }}>
            Retry
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Top Navigation & Show Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>
              {showData.movie?.title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="#e50914" />
                {showData.theatre?.name} • Screen {showData.screenNumber}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                {formatShowDate(showData.startTime)}, {formatShowTime(showData.startTime)}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {showData.availableCount} of {showData.totalSeats} seats available
        </div>
      </div>

      {/* Concurrency Error Banner */}
      {conflictError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          padding: '1rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <AlertTriangle size={22} color="#ef4444" />
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{conflictError}</span>
        </div>
      )}

      {/* Main Seat Booking Layout: Grid on Left/Center, Checkout Card on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(280px, 340px)',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="seat-booking-grid">
        {/* Interactive Seat Grid */}
        <div>
          <SeatGrid
            seatLayout={showData.seatLayout}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            maxSeats={8}
          />
        </div>

        {/* Real-time Order Summary Card */}
        <div className="glass-panel" style={{ padding: '1.8rem', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ticket size={18} color="#e50914" />
            <span>Booking Summary</span>
          </h3>

          {/* Selected Seats Pills */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Selected Seats ({selectedSeats.length}):
            </div>
            {selectedSeats.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                Click seats on the grid to reserve
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {selectedSeats.map(seat => (
                  <span key={seat} style={{
                    backgroundColor: 'rgba(229, 9, 20, 0.2)',
                    border: '1px solid var(--border-accent)',
                    color: '#ff4d58',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    {seat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tier price breakdown */}
          {items.length > 0 && (
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '1rem 0',
              marginBottom: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Seat {it.seatNumber} ({it.tier.toUpperCase()})</span>
                  <span>₹{it.price}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-subtle)', paddingTop: '0.4rem' }}>
                <span>Convenience Fee</span>
                <span>₹{fee}</span>
              </div>
            </div>
          )}

          {/* Grand Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1.5rem'
          }}>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Grand Total</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              ₹{grandTotal}
            </span>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmBooking}
            disabled={selectedSeats.length === 0 || bookingInProgress}
            className="btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
          >
            {bookingInProgress ? (
              <span>Reserving Seats...</span>
            ) : !isAuthenticated ? (
              <span>Sign In to Book (₹{grandTotal})</span>
            ) : (
              <span>Confirm & Book Seats</span>
            )}
          </button>

          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-subtle)',
            textAlign: 'center',
            marginTop: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={14} color="#10b981" />
            100% Guaranteed Instant Ticket Confirmation
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .seat-booking-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SeatSelectionPage;
