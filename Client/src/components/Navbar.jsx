import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut, Ticket, Shield, Menu, X, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(10, 12, 19, 0.85)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
            color: 'white',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <Film size={22} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(90deg, #ffffff 0%, #f1f5f9 60%, #e50914 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            IMOVIES
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }} className="desktop-nav">
          <Link to="/" style={{ fontSize: '0.95rem', fontWeight: 500, color: '#e2e8f0', transition: 'color 0.2s' }}>
            Movies
          </Link>

          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Link to="/dashboard" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#e2e8f0'
                }}>
                  <LayoutDashboard size={18} color="#e50914" />
                  <span>Dashboard</span>
                </Link>
              )}

              <Link to="/my-bookings" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: '#e2e8f0'
              }}>
                <Ticket size={18} color="#e50914" />
                <span>My Bookings</span>
              </Link>

              {isAdmin && (
                <Link to="/admin" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#f5a623',
                  backgroundColor: 'rgba(245, 166, 35, 0.12)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid rgba(245, 166, 35, 0.3)'
                }}>
                  <Shield size={16} />
                  <span>Admin Panel</span>
                </Link>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '0.5rem' }}>
                <Link to={dashboardPath} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '5px 12px',
                  borderRadius: '30px',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isAdmin ? '#f5a623' : '#e50914',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f8fafc' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff3b47'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <LogOut size={19} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Link to="/login" style={{
                color: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '0.5rem 1rem'
              }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1.1rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            color: 'white',
            padding: '8px'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', fontWeight: 500 }}>
            Movies
          </Link>
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', fontWeight: 500 }}>
                  Dashboard
                </Link>
              )}
              <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white' }}>
                My Bookings
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f5a623', fontWeight: 600 }}>
                  Admin Panel
                </Link>
              )}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Signed in as {user?.email}</span>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    color: '#e50914',
                    marginTop: '0.5rem',
                    background: 'none',
                    fontWeight: 600
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white' }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e50914' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
