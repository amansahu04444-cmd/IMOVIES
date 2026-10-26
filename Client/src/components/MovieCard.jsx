import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

const formatDuration = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const MovieCard = ({ movie }) => {
  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.4)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.5), 0 0 16px rgba(229, 9, 20, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Poster Image Container */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', overflow: 'hidden' }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'rgba(10, 12, 19, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '4px 8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#fbbf24',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          <Star size={14} fill="#fbbf24" />
          <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
        </div>

        {/* Language Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#e2e8f0',
          textTransform: 'uppercase'
        }}>
          {movie.language}
        </div>
      </div>

      {/* Card Info Content */}
      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontSize: '1.15rem',
          marginBottom: '0.4rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {movie.title}
        </h3>

        {/* Duration & Genres */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          marginBottom: '0.8rem'
        }}>
          <Clock size={13} />
          <span>{formatDuration(movie.durationMinutes)}</span>
          <span>•</span>
          <span style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {movie.genre?.slice(0, 2).join(', ')}
          </span>
        </div>

        <p style={{
          fontSize: '0.85rem',
          color: '#94a3b8',
          lineHeight: 1.4,
          marginBottom: '1.2rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {movie.description}
        </p>

        {/* Action Button */}
        <Link
          to={`/movies/${movie._id}`}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <Ticket size={16} />
          <span>Book Tickets</span>
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
