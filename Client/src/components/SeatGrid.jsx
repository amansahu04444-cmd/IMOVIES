import React from 'react';
import { Check, Armchair, AlertCircle } from 'lucide-react';

const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat,
  maxSeats = 8
}) => {
  return (
    <div style={{ width: '100%', maxWidth: '840px', margin: '0 auto' }}>
      {/* Cinema Screen Curve */}
      <div className="cinema-screen-container">
        <div className="cinema-screen" />
        <div className="cinema-screen-label">SCREEN THIS WAY</div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1.5rem',
        margin: '1.5rem 0 2rem 0',
        padding: '0.8rem 1.2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: 'var(--seat-available)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }} />
          <span>Available</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: '#e50914',
            boxShadow: '0 0 8px rgba(229, 9, 20, 0.6)'
          }} />
          <span style={{ color: '#ff4d58', fontWeight: 600 }}>Selected</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: '#27314d',
            opacity: 0.5
          }} />
          <span style={{ color: 'var(--text-subtle)' }}>Booked</span>
        </div>
      </div>

      {/* Tier Label Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0 1rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <span><strong style={{ color: '#10b981' }}>Standard:</strong> Rows A-B</span>
          <span><strong style={{ color: '#3b82f6' }}>Premium:</strong> Rows C-E</span>
          <span><strong style={{ color: '#a855f7' }}>VIP Recliner:</strong> Rows F-H</span>
        </div>
        <span>Max {maxSeats} seats</span>
      </div>

      {/* Seating Grid */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '2rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '480px' }}>
          {seatLayout.map((rowObj) => {
            const isVip = ['F', 'G', 'H'].includes(rowObj.row);
            const isPremium = ['C', 'D', 'E'].includes(rowObj.row);
            const tierColor = isVip ? '#a855f7' : isPremium ? '#3b82f6' : '#10b981';

            return (
              <div key={rowObj.row} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                {/* Row Letter */}
                <div style={{
                  width: '24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: tierColor,
                  textAlign: 'center'
                }}>
                  {rowObj.row}
                </div>

                {/* Seat Buttons in Row */}
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  {rowObj.seats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isBooked = seat.isBooked;

                    let bgColor = 'var(--seat-available)';
                    let borderColor = 'rgba(255, 255, 255, 0.15)';
                    let cursor = 'pointer';

                    if (isBooked) {
                      bgColor = '#1e2438';
                      borderColor = 'transparent';
                      cursor = 'not-allowed';
                    } else if (isSelected) {
                      bgColor = '#e50914';
                      borderColor = '#ff3b47';
                    }

                    return (
                      <button
                        key={seat.seatNumber}
                        disabled={isBooked}
                        onClick={() => onToggleSeat(seat)}
                        title={`${seat.seatNumber} • ${seat.tier.toUpperCase()} • ₹${seat.price}`}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: bgColor,
                          border: `1px solid ${borderColor}`,
                          color: isSelected ? 'white' : isBooked ? '#475569' : '#cbd5e1',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor,
                          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: isSelected ? '0 0 10px rgba(229, 9, 20, 0.7)' : 'none',
                          transform: isSelected ? 'scale(1.08)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isBooked && !isSelected) {
                            e.currentTarget.style.borderColor = tierColor;
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isBooked && !isSelected) {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {isSelected ? <Check size={14} /> : seat.number}
                      </button>
                    );
                  })}
                </div>

                {/* Right Row Letter */}
                <div style={{
                  width: '24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: tierColor,
                  textAlign: 'center'
                }}>
                  {rowObj.row}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
