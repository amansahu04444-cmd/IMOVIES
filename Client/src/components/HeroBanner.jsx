import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Sparkles } from 'lucide-react';

const HeroBanner = ({ movie }) => {
  if (!movie) return null;

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: '3rem',
      minHeight: '440px',
      display: 'flex',
      alignItems: 'center',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
    }}>
      {/* Background Image with Gradients */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        filter: 'brightness(0.45)'
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, #0a0c13 0%, rgba(10, 12, 19, 0.8) 55%, rgba(10, 12, 19, 0.3) 100%)'
      }} />

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '2.5rem' }}>
        <div style={{ maxWidth: '640px' }}>
          {/* Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(229, 9, 20, 0.2)',
            border: '1px solid var(--border-accent)',
            color: '#ff4d58',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} />
            <span>Featured Spotlight</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            lineHeight: 1.15,
            marginBottom: '1rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.8)'
          }}>
            {movie.title}
          </h1>

          {/* Badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.2rem',
            fontSize: '0.9rem',
            color: '#cbd5e1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24', fontWeight: 700 }}>
              <Star size={16} fill="#fbbf24" />
              <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'} / 10</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={16} />
              <span>{movie.durationMinutes} mins</span>
            </div>
            <span>•</span>
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              {movie.language}
            </span>
            <span>•</span>
            <span>{movie.genre?.join(', ')}</span>
          </div>

          <p style={{
            fontSize: '1rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '2rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {movie.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link
              to={`/movies/${movie._id}`}
              className="btn-primary animate-pulse-glow"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              <Ticket size={20} />
              <span>Book Showtimes</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
