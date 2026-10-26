import React from 'react';
import { Film, Heart, ShieldCheck, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3rem 0 2rem 0',
      marginTop: '5rem',
      color: 'var(--text-muted)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#e50914',
              color: 'white',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex'
            }}>
              <Film size={20} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#f8fafc'
            }}>
              IMOVIES
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94a3b8' }}>
            Next-generation cinematic ticketing platform. Discover trending releases, experience immersive formats, and reserve your perfect seats instantly.
          </p>
        </div>

        {/* Feature Highlights */}
        <div>
          <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>Experience</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={15} color="#e50914" /> Real-time Seat Concurrency
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={15} color="#10b981" /> Verified Digital Pass & QR
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Film size={15} color="#3b82f6" /> IMAX, 4K & Dolby Atmos
            </li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>Engineered With</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['React 18', 'Node.js', 'Express', 'MongoDB 8', 'Mongoose', 'Vite', 'JWT'].map((tag) => (
              <span key={tag} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#cbd5e1'
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.85rem'
      }}>
        <p>© 2026 IMovies Entertainment Network. All rights reserved.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Crafted with <Heart size={14} color="#e50914" fill="#e50914" /> for true cinephiles
        </p>
      </div>
    </footer>
  );
};

export default Footer;
