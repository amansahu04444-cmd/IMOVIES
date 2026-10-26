import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Shield, 
  Film, 
  Building, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  DollarSign,
  Star,
  Search,
  Edit,
  X,
  Layers,
  Ticket,
  BarChart3,
  RefreshCw,
  CreditCard,
  MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [paymentsData, setPaymentsData] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  
  // Loading & notification states
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Search/Filter states
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Modal states
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieFormData, setMovieFormData] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    language: 'English',
    durationMinutes: 120,
    releaseDate: '2026-06-01',
    posterUrl: '',
    rating: 8.0,
    isFeatured: false
  });

  // Theatre Modal states
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [theatreFormData, setTheatreFormData] = useState({
    name: '',
    city: 'Mumbai',
    address: '',
    screens: [
      { screenNumber: 1, name: 'Audi 1 - 4K Dolby Atmos', totalSeats: 80, rows: 8, seatsPerRow: 10 },
      { screenNumber: 2, name: 'Audi 2 - IMAX Laser', totalSeats: 80, rows: 8, seatsPerRow: 10 }
    ]
  });

  // Show Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    movieId: '',
    theatreId: '',
    screenNumber: 1,
    startTime: '',
    standardPrice: 180,
    premiumPrice: 250,
    vipPrice: 380
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const notify = (msg, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setStatusMessage(msg);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        moviesRes,
        theatresRes,
        showsRes,
        bookingsRes,
        usersRes,
        paymentsRes,
        reviewsRes
      ] = await Promise.all([
        api.getAdminStats().catch(() => ({ success: false })),
        api.getMovies().catch(() => ({ success: false })),
        api.getTheatres().catch(() => ({ success: false })),
        api.getShows().catch(() => ({ success: false })),
        api.getAllAdminBookings().catch(() => ({ success: false })),
        api.getAdminUsers().catch(() => ({ success: false })),
        api.getAdminPayments().catch(() => ({ success: false })),
        api.getAdminReviews().catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (moviesRes.success) setMovies(moviesRes.movies || []);
      if (theatresRes.success) setTheatres(theatresRes.theatres || []);
      if (showsRes.success) setShows(showsRes.shows || []);
      if (bookingsRes.success) setAllBookings(bookingsRes.bookings || []);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (paymentsRes.success) setPaymentsData(paymentsRes);
      if (reviewsRes.success) setReviewsList(reviewsRes.reviews || []);

      // Default schedule selections
      if (moviesRes.movies?.length > 0 && theatresRes.theatres?.length > 0) {
        setScheduleData(prev => ({
          ...prev,
          movieId: prev.movieId || moviesRes.movies[0]._id,
          theatreId: prev.theatreId || theatresRes.theatres[0]._id,
          screenNumber: theatresRes.theatres[0]?.screens?.[0]?.screenNumber || 1
        }));
      }
    } catch (err) {
      console.error('Error loading admin console data:', err);
      if (err.isNetworkError || err.status === 0) {
        setErrorMessage('Unable to connect to cinema server. Please verify backend is running and CORS is configured.');
      } else {
        setErrorMessage(err.message || 'Error loading cinema data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // THEATRE ACTIONS (HIGHEST PRIORITY)
  // ----------------------------------------------------
  const openAddTheatreModal = () => {
    setEditingTheatre(null);
    setTheatreFormData({
      name: '',
      city: 'Mumbai',
      address: '',
      screens: [
        { screenNumber: 1, name: 'Screen 1 - 4K Atmos', totalSeats: 80, rows: 8, seatsPerRow: 10 },
        { screenNumber: 2, name: 'Screen 2 - IMAX Experience', totalSeats: 80, rows: 8, seatsPerRow: 10 }
      ]
    });
    setShowTheatreModal(true);
  };

  const openEditTheatreModal = (theatre) => {
    setEditingTheatre(theatre);
    setTheatreFormData({
      name: theatre.name,
      city: theatre.city,
      address: theatre.address,
      screens: theatre.screens?.length > 0 ? theatre.screens : [
        { screenNumber: 1, name: 'Screen 1', totalSeats: 80, rows: 8, seatsPerRow: 10 }
      ]
    });
    setShowTheatreModal(true);
  };

  const handleAddScreenField = () => {
    setTheatreFormData(prev => ({
      ...prev,
      screens: [
        ...prev.screens,
        {
          screenNumber: prev.screens.length + 1,
          name: `Screen ${prev.screens.length + 1}`,
          totalSeats: 80,
          rows: 8,
          seatsPerRow: 10
        }
      ]
    }));
  };

  const handleRemoveScreenField = (index) => {
    if (theatreFormData.screens.length <= 1) {
      alert('A theatre must contain at least one screen.');
      return;
    }
    setTheatreFormData(prev => ({
      ...prev,
      screens: prev.screens.filter((_, i) => i !== index)
    }));
  };

  const handleScreenChange = (index, field, value) => {
    setTheatreFormData(prev => {
      const updated = [...prev.screens];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'rows' || field === 'seatsPerRow') {
        const rows = Number(field === 'rows' ? value : updated[index].rows) || 1;
        const seatsPerRow = Number(field === 'seatsPerRow' ? value : updated[index].seatsPerRow) || 1;
        updated[index].totalSeats = rows * seatsPerRow;
      }
      return { ...prev, screens: updated };
    });
  };

  const handleSaveTheatre = async (e) => {
    e.preventDefault();
    if (!theatreFormData.name || !theatreFormData.city || !theatreFormData.address) {
      notify('Please provide Theatre Name, City, and Address.', true);
      return;
    }

    try {
      if (editingTheatre) {
        const res = await api.updateTheatre(editingTheatre._id, theatreFormData);
        if (res.success) {
          notify(`Theatre "${res.theatre.name}" updated successfully!`);
          setShowTheatreModal(false);
          loadAllData();
        }
      } else {
        const res = await api.createTheatre(theatreFormData);
        if (res.success) {
          notify(`Theatre "${res.theatre.name}" created and saved to MongoDB!`);
          setShowTheatreModal(false);
          loadAllData();
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to save theatre', true);
    }
  };

  const handleDeleteTheatre = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.deleteTheatre(id);
      if (res.success) {
        notify(`Theatre "${name}" removed from database.`);
        setTheatres(prev => prev.filter(t => t._id !== id));
        loadAllData();
      }
    } catch (err) {
      notify(err.message || 'Failed to delete theatre', true);
    }
  };

  // ----------------------------------------------------
  // MOVIE ACTIONS
  // ----------------------------------------------------
  const openAddMovieModal = () => {
    setEditingMovie(null);
    setMovieFormData({
      title: '',
      description: '',
      genre: 'Action, Sci-Fi',
      language: 'English',
      durationMinutes: 120,
      releaseDate: '2026-06-01',
      posterUrl: '',
      rating: 8.0,
      isFeatured: false
    });
    setShowMovieModal(true);
  };

  const openEditMovieModal = (movie) => {
    setEditingMovie(movie);
    setMovieFormData({
      title: movie.title,
      description: movie.description || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
      language: movie.language || 'English',
      durationMinutes: movie.durationMinutes || 120,
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '2026-06-01',
      posterUrl: movie.posterUrl || '',
      rating: movie.rating || 8.0,
      isFeatured: !!movie.isFeatured
    });
    setShowMovieModal(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieFormData,
        genre: movieFormData.genre.split(',').map(s => s.trim()),
        durationMinutes: Number(movieFormData.durationMinutes),
        rating: Number(movieFormData.rating)
      };

      if (editingMovie) {
        const res = await api.updateMovie(editingMovie._id, payload);
        if (res.success) {
          notify(`Movie "${res.movie.title}" updated successfully!`);
          setShowMovieModal(false);
          loadAllData();
        }
      } else {
        const res = await api.createMovie(payload);
        if (res.success) {
          notify(`Movie "${res.movie.title}" created successfully!`);
          setShowMovieModal(false);
          loadAllData();
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to save movie', true);
    }
  };

  const handleDeleteMovie = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;

    try {
      const res = await api.deleteMovie(id);
      if (res.success) {
        notify(`Movie "${title}" removed.`);
        setMovies(prev => prev.filter(m => m._id !== id));
        loadAllData();
      }
    } catch (err) {
      notify(err.message || 'Failed to delete movie', true);
    }
  };

  // ----------------------------------------------------
  // SHOW ACTIONS
  // ----------------------------------------------------
  const handleScheduleShow = async (e) => {
    e.preventDefault();
    try {
      if (!scheduleData.startTime) {
        notify('Please select a valid show start date and time', true);
        return;
      }

      const res = await api.createShow({
        movieId: scheduleData.movieId,
        theatreId: scheduleData.theatreId,
        screenNumber: Number(scheduleData.screenNumber),
        startTime: new Date(scheduleData.startTime),
        pricing: {
          standard: Number(scheduleData.standardPrice),
          premium: Number(scheduleData.premiumPrice),
          vip: Number(scheduleData.vipPrice)
        }
      });

      if (res.success) {
        notify('New show screening scheduled successfully!');
        setShowScheduleModal(false);
        loadAllData();
      }
    } catch (err) {
      notify(err.message || 'Scheduling conflict or validation error', true);
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this show?')) return;
    try {
      const res = await api.deleteShow(id);
      if (res.success) {
        notify('Show deleted successfully.');
        setShows(prev => prev.filter(s => s._id !== id));
        loadAllData();
      }
    } catch (err) {
      notify(err.message || 'Failed to delete show', true);
    }
  };

  // ----------------------------------------------------
  // BOOKING & REVIEWS ACTIONS
  // ----------------------------------------------------
  const handleAdminCancelBooking = async (id, ref) => {
    if (!window.confirm(`Cancel booking ${ref} and release reserved seats?`)) return;
    try {
      const res = await api.cancelBooking(id);
      if (res.success) {
        notify(`Booking ${ref} cancelled and seats released.`);
        loadAllData();
      }
    } catch (err) {
      notify(err.message || 'Failed to cancel booking', true);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this user review?')) return;
    try {
      const res = await api.deleteReview(id);
      if (res.success) {
        notify('Review deleted by moderator.');
        setReviewsList(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      notify(err.message || 'Failed to delete review', true);
    }
  };

  // Filtered bookings
  const filteredBookings = allBookings.filter(b => {
    const matchesSearch = !bookingSearch || 
      b.bookingReference?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userId?.email?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userId?.name?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatusFilter === 'ALL' || b.bookingStatus === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Selected theatre's screens for dynamic dropdown
  const selectedTheatreObj = theatres.find(t => t._id === scheduleData.theatreId);
  const availableScreens = selectedTheatreObj?.screens || [];

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Admin Header Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f5a623 0%, #d97706 100%)',
            color: 'white',
            padding: '12px',
            borderRadius: '14px',
            display: 'flex',
            boxShadow: '0 4px 14px rgba(245, 166, 35, 0.3)'
          }}>
            <Shield size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>IMovies Central Command</h1>
              <span style={{
                backgroundColor: 'rgba(245, 166, 35, 0.15)',
                color: '#f5a623',
                border: '1px solid rgba(245, 166, 35, 0.3)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                ADMIN PORTAL
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
              Real-time platform operations for multiplex theatres, catalogue, shows, revenue, and users
            </p>
          </div>
        </div>

        <button
          onClick={loadAllData}
          disabled={loading}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Sync Real-Time Data</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        backgroundColor: 'var(--bg-secondary)',
        padding: '6px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '2rem',
        overflowX: 'auto',
        border: '1px solid var(--border-subtle)'
      }}>
        {[
          { id: 'overview', label: 'Dashboard', icon: BarChart3 },
          { id: 'theatres', label: 'Manage Theatres', icon: Building, count: theatres.length, highlight: true },
          { id: 'movies', label: 'Manage Movies', icon: Film, count: movies.length },
          { id: 'shows', label: 'Manage Shows', icon: Clock, count: shows.length },
          { id: 'bookings', label: 'Manage Bookings', icon: Ticket, count: allBookings.length },
          { id: 'users', label: 'Manage Users', icon: Users, count: usersList.length },
          { id: 'payments', label: 'Payments & Revenue', icon: DollarSign },
          { id: 'reviews', label: 'Review Moderation', icon: MessageSquare, count: reviewsList.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 15px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: isActive ? '#e50914' : 'transparent',
                color: isActive ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: isActive ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.08)',
                  padding: '1px 7px',
                  borderRadius: '10px'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div>
          {/* Quick Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.2rem',
            marginBottom: '2rem'
          }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Revenue</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.3rem' }}>
                ₹{stats?.totalRevenue?.toLocaleString('en-IN') || '0'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>From confirmed paid bookings</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Theatres</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f5a623', marginTop: '0.3rem' }}>
                {stats?.totalTheatres ?? theatres.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Multiplex cinema locations</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Catalogued Movies</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.3rem' }}>
                {stats?.totalMovies ?? movies.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Active cinema titles</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scheduled Shows</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '0.3rem' }}>
                {stats?.totalShows ?? shows.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Screenings across multiplexes</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Bookings</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginTop: '0.3rem' }}>
                {stats?.totalBookings ?? allBookings.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>User reservations recorded</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Users</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.3rem' }}>
                {stats?.totalUsers ?? usersList.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Platform customer accounts</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => { setActiveTab('theatres'); openAddTheatreModal(); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} />
                <span>Create New Theatre</span>
              </button>
              <button onClick={() => { setActiveTab('movies'); openAddMovieModal(); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Film size={16} />
                <span>Add New Movie</span>
              </button>
              <button onClick={() => { setActiveTab('shows'); setShowScheduleModal(true); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} />
                <span>Schedule Showtime</span>
              </button>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Platform Bookings</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
                    <th style={{ padding: '0.8rem' }}>Reference</th>
                    <th style={{ padding: '0.8rem' }}>Customer</th>
                    <th style={{ padding: '0.8rem' }}>Movie</th>
                    <th style={{ padding: '0.8rem' }}>Theatre</th>
                    <th style={{ padding: '0.8rem' }}>Seats</th>
                    <th style={{ padding: '0.8rem' }}>Amount</th>
                    <th style={{ padding: '0.8rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentBookings || allBookings.slice(0, 8)).map(b => (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.8rem', fontFamily: 'monospace', fontWeight: 700 }}>{b.bookingReference}</td>
                      <td style={{ padding: '0.8rem' }}>{b.userId?.name || 'Customer'}</td>
                      <td style={{ padding: '0.8rem', fontWeight: 600 }}>{b.showId?.movieId?.title || 'Movie'}</td>
                      <td style={{ padding: '0.8rem' }}>{b.showId?.theatreId?.name || 'Multiplex'}</td>
                      <td style={{ padding: '0.8rem' }}>{b.seats?.join(', ')}</td>
                      <td style={{ padding: '0.8rem', fontWeight: 700 }}>₹{b.totalAmount}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: b.bookingStatus === 'CONFIRMED' ? '#10b981' : '#f87171',
                          backgroundColor: b.bookingStatus === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: MANAGE THEATRES (HIGHEST PRIORITY) */}
      {/* ==================================================== */}
      {activeTab === 'theatres' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Multiplex Theatres ({theatres.length})</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                Add and configure physical cinema theatres, cities, addresses, and screen seating capacities
              </p>
            </div>
            <button
              onClick={openAddTheatreModal}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem' }}
            >
              <Plus size={18} />
              <span>Add Theatre</span>
            </button>
          </div>

          {theatres.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
              <Building size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Theatres Configured Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Click below to add your first multiplex theatre with custom screen seating configurations.
              </p>
              <button onClick={openAddTheatreModal} className="btn-primary">
                Create First Theatre
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {theatres.map(theatre => (
                <div key={theatre._id} className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Building size={22} color="#e50914" />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{theatre.name}</h3>
                    </div>
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#cbd5e1'
                    }}>
                      {theatre.city}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: 1.4 }}>
                    {theatre.address}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem', marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Configured Screens ({theatre.screens?.length || 0}):
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {theatre.screens?.map(scr => (
                        <div key={scr.screenNumber} style={{
                          fontSize: '0.85rem',
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>Screen {scr.screenNumber}: {scr.name}</span>
                          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem' }}>{scr.totalSeats} seats</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                    <button
                      onClick={() => openEditTheatreModal(theatre)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTheatre(theatre._id, theatre.name)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: MANAGE MOVIES */}
      {/* ==================================================== */}
      {activeTab === 'movies' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Catalogue Movies ({movies.length})</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                Add, edit details, and remove movies available for ticket bookings
              </p>
            </div>
            <button
              onClick={openAddMovieModal}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem' }}
            >
              <Plus size={18} />
              <span>Add Movie</span>
            </button>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
                  <th style={{ padding: '1rem' }}>Poster</th>
                  <th style={{ padding: '1rem' }}>Title</th>
                  <th style={{ padding: '1rem' }}>Language</th>
                  <th style={{ padding: '1rem' }}>Duration</th>
                  <th style={{ padding: '1rem' }}>Genres</th>
                  <th style={{ padding: '1rem' }}>Rating</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map(movie => (
                  <tr key={movie._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <img src={movie.posterUrl} alt="" style={{ width: '45px', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{movie.title}</td>
                    <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>{movie.language}</td>
                    <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>{movie.durationMinutes}m</td>
                    <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>
                      {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#fbbf24', fontWeight: 700 }}>★ {movie.rating?.toFixed(1) || '8.0'}</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditMovieModal(movie)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie._id, movie.title)}
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: MANAGE SHOWS & SCHEDULES */}
      {/* ==================================================== */}
      {activeTab === 'shows' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Scheduled Screenings ({shows.length})</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                Schedule movie screenings in specific theatre screens with conflict overlap checking
              </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem' }}
            >
              <Plus size={18} />
              <span>Schedule New Show</span>
            </button>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
                  <th style={{ padding: '1rem' }}>Movie</th>
                  <th style={{ padding: '1rem' }}>Theatre & Screen</th>
                  <th style={{ padding: '1rem' }}>Date & Showtime</th>
                  <th style={{ padding: '1rem' }}>Tier Pricing (Std/Prem/VIP)</th>
                  <th style={{ padding: '1rem' }}>Booked Seats</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map(show => {
                  const startTime = new Date(show.startTime);
                  return (
                    <tr key={show._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{show.movieId?.title || 'Movie'}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div>{show.theatreId?.name || 'Multiplex'}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Screen {show.screenNumber}</span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div>{startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                          {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        ₹{show.pricing?.standard} / ₹{show.pricing?.premium} / ₹{show.pricing?.vip}
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{ fontWeight: 700 }}>{show.bookedSeats?.length || 0}</span> / 80
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: show.status === 'ACTIVE' ? '#10b981' : '#f87171',
                          backgroundColor: show.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {show.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteShow(show._id)}
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: MANAGE BOOKINGS */}
      {/* ==================================================== */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Customer Bookings ({allBookings.length})</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                Complete ticket log with cancellation and seat release controls
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search ref or email..."
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                  style={{ padding: '0.55rem 1rem 0.55rem 2.2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white', fontSize: '0.85rem', width: '220px' }}
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={e => setBookingStatusFilter(e.target.value)}
                style={{ padding: '0.55rem 0.8rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
                  <th style={{ padding: '1rem' }}>Reference</th>
                  <th style={{ padding: '1rem' }}>Customer</th>
                  <th style={{ padding: '1rem' }}>Movie Title</th>
                  <th style={{ padding: '1rem' }}>Theatre & Screen</th>
                  <th style={{ padding: '1rem' }}>Seats</th>
                  <th style={{ padding: '1rem' }}>Total Amount</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontWeight: 700 }}>{b.bookingReference}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{b.userId?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{b.userId?.email}</div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{b.showId?.movieId?.title || 'Movie'}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div>{b.showId?.theatreId?.name || 'Multiplex'}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Screen {b.showId?.screenNumber}</span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>{b.seats?.join(', ')}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>₹{b.totalAmount}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: b.bookingStatus === 'CONFIRMED' ? '#10b981' : '#f87171',
                        backgroundColor: b.bookingStatus === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                      {b.bookingStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => handleAdminCancelBooking(b._id, b.bookingReference)}
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: MANAGE USERS */}
      {/* ==================================================== */}
      {activeTab === 'users' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Registered Users ({usersList.length})</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              System accounts, security roles, and registration timelines (passwords securely hidden)
            </p>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
                  <th style={{ padding: '1rem' }}>User Name</th>
                  <th style={{ padding: '1rem' }}>Email Address</th>
                  <th style={{ padding: '1rem' }}>System Role</th>
                  <th style={{ padding: '1rem' }}>Member Since</th>
                  <th style={{ padding: '1rem' }}>Account ID</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '0.8rem 1rem', color: '#38bdf8' }}>{u.email}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: u.role === 'ADMIN' ? '#f5a623' : '#cbd5e1',
                        backgroundColor: u.role === 'ADMIN' ? 'rgba(245, 166, 35, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {u._id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 7: PAYMENTS & REVENUE */}
      {/* ==================================================== */}
      {activeTab === 'payments' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Payments & Revenue Ledger</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Audited transaction stream calculating true net income from confirmed payments
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Net Realized Revenue</span>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#10b981', marginTop: '0.3rem' }}>
                ₹{paymentsData?.summary?.totalRevenue?.toLocaleString('en-IN') || '0'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Excludes cancelled/refunded sums</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paid Transactions</span>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.3rem' }}>
                {paymentsData?.summary?.paidCount || 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Confirmed successful sales</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Refunded / Cancelled</span>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f87171', marginTop: '0.3rem' }}>
                {paymentsData?.summary?.refundedCount || 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Released seats returned to pool</span>
            </div>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)' }}>
                  <th style={{ padding: '1rem' }}>Booking Code</th>
                  <th style={{ padding: '1rem' }}>Customer Email</th>
                  <th style={{ padding: '1rem' }}>Movie Title</th>
                  <th style={{ padding: '1rem' }}>Transaction Amount</th>
                  <th style={{ padding: '1rem' }}>Payment Status</th>
                  <th style={{ padding: '1rem' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {(paymentsData?.transactions || []).map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontWeight: 700 }}>{t.bookingReference}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>{t.userId?.email}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{t.showId?.movieId?.title || 'Movie'}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>₹{t.totalAmount}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: t.paymentStatus === 'PAID' ? '#10b981' : '#f87171',
                        backgroundColor: t.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: REVIEW MODERATION */}
      {/* ==================================================== */}
      {activeTab === 'reviews' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Review Moderation ({reviewsList.length})</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Audit user movie ratings and comments; remove inappropriate submissions
            </p>
          </div>

          {reviewsList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
              <MessageSquare size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No User Reviews Submitted</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Customer reviews and ratings on cinema titles will appear here for administrative moderation.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
              {reviewsList.map(r => (
                <div key={r._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{r.movieId?.title || 'Movie'}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By {r.userName} ({r.userId?.email})</span>
                    </div>
                    <span style={{
                      backgroundColor: 'rgba(251, 191, 36, 0.15)',
                      color: '#fbbf24',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      ★ {r.rating}/10
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, margin: '0 0 1.2rem', flex: 1 }}>
                    "{r.comment}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteReview(r._id)}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT THEATRE */}
      {/* ==================================================== */}
      {showTheatreModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-accent)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                {editingTheatre ? 'Edit Multiplex Theatre' : 'Add New Multiplex Theatre'}
              </h3>
              <button onClick={() => setShowTheatreModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTheatre} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem', fontWeight: 500 }}>
                    Theatre Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cinepolis Grand Megaplex"
                    value={theatreFormData.name}
                    onChange={e => setTheatreFormData({ ...theatreFormData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem', fontWeight: 500 }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, Delhi, Bangalore"
                    value={theatreFormData.city}
                    onChange={e => setTheatreFormData({ ...theatreFormData, city: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem', fontWeight: 500 }}>
                  Physical Address / Location *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Phoenix Marketcity, Kurla West, LBS Marg"
                  value={theatreFormData.address}
                  onChange={e => setTheatreFormData({ ...theatreFormData, address: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white', fontSize: '0.9rem' }}
                />
              </div>

              {/* Screens Configuration Builder */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Configure Auditorium Screens ({theatreFormData.screens.length})</span>
                  <button
                    type="button"
                    onClick={handleAddScreenField}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} />
                    <span>Add Screen</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {theatreFormData.screens.map((scr, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr)) 36px',
                      gap: '0.8rem',
                      alignItems: 'center'
                    }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Screen Name</label>
                        <input
                          type="text"
                          required
                          value={scr.name}
                          onChange={e => handleScreenChange(idx, 'name', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'white', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Rows</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={scr.rows || 8}
                          onChange={e => handleScreenChange(idx, 'rows', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'white', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Seats/Row</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={scr.seatsPerRow || 10}
                          onChange={e => handleScreenChange(idx, 'seatsPerRow', e.target.value)}
                          style={{ width: '100%', padding: '0.45rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'white', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#10b981' }}>Total Seats</label>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>{scr.totalSeats || 80}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveScreenField(idx)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                        title="Remove screen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowTheatreModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTheatre ? 'Save Changes' : 'Create Theatre & Persist to DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT MOVIE */}
      {/* ==================================================== */}
      {showMovieModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-accent)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                {editingMovie ? 'Edit Movie Details' : 'Add New Movie to Catalogue'}
              </h3>
              <button onClick={() => setShowMovieModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Title *</label>
                <input
                  type="text"
                  required
                  value={movieFormData.title}
                  onChange={e => setMovieFormData({ ...movieFormData, title: e.target.value })}
                  placeholder="e.g. Dune: Part Three"
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Genres (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={movieFormData.genre}
                  onChange={e => setMovieFormData({ ...movieFormData, genre: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Duration (Minutes) *</label>
                <input
                  type="number"
                  required
                  min="30"
                  max="300"
                  value={movieFormData.durationMinutes}
                  onChange={e => setMovieFormData({ ...movieFormData, durationMinutes: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Language *</label>
                <input
                  type="text"
                  required
                  value={movieFormData.language}
                  onChange={e => setMovieFormData({ ...movieFormData, language: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Rating (1-10) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  required
                  value={movieFormData.rating}
                  onChange={e => setMovieFormData({ ...movieFormData, rating: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Release Date *</label>
                <input
                  type="date"
                  required
                  value={movieFormData.releaseDate}
                  onChange={e => setMovieFormData({ ...movieFormData, releaseDate: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Poster Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={movieFormData.posterUrl}
                  onChange={e => setMovieFormData({ ...movieFormData, posterUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Synopsis / Description *</label>
                <textarea
                  rows={3}
                  required
                  value={movieFormData.description}
                  onChange={e => setMovieFormData({ ...movieFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowMovieModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMovie ? 'Update Movie' : 'Publish Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: SCHEDULE NEW SHOW */}
      {/* ==================================================== */}
      {showScheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-accent)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Schedule New Screening</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleShow} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>Movie *</label>
                <select
                  value={scheduleData.movieId}
                  onChange={e => setScheduleData({ ...scheduleData, movieId: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                >
                  {movies.map(m => (
                    <option key={m._id} value={m._id}>{m.title} ({m.durationMinutes}m)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>Multiplex Theatre *</label>
                <select
                  value={scheduleData.theatreId}
                  onChange={e => {
                    const newThId = e.target.value;
                    const thObj = theatres.find(t => t._id === newThId);
                    setScheduleData({
                      ...scheduleData,
                      theatreId: newThId,
                      screenNumber: thObj?.screens?.[0]?.screenNumber || 1
                    });
                  }}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                >
                  {theatres.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>Screen *</label>
                <select
                  value={scheduleData.screenNumber}
                  onChange={e => setScheduleData({ ...scheduleData, screenNumber: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                >
                  {availableScreens.map(scr => (
                    <option key={scr.screenNumber} value={scr.screenNumber}>
                      Screen {scr.screenNumber}: {scr.name} ({scr.totalSeats} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>Show Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleData.startTime}
                  onChange={e => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Standard (₹)</label>
                  <input
                    type="number"
                    min="50"
                    value={scheduleData.standardPrice}
                    onChange={e => setScheduleData({ ...scheduleData, standardPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>Premium (₹)</label>
                  <input
                    type="number"
                    min="50"
                    value={scheduleData.premiumPrice}
                    onChange={e => setScheduleData({ ...scheduleData, premiumPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>VIP (₹)</label>
                  <input
                    type="number"
                    min="50"
                    value={scheduleData.vipPrice}
                    onChange={e => setScheduleData({ ...scheduleData, vipPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
