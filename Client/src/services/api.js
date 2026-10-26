const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('imovies_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, config);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me'),

  // Movies
  getMovies: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.genre && params.genre !== 'All') query.append('genre', params.genre);
    if (params.language && params.language !== 'All') query.append('language', params.language);
    if (params.featured) query.append('featured', 'true');
    const qs = query.toString();
    return request(`/movies${qs ? `?${qs}` : ''}`);
  },
  getMovieById: (id) => request(`/movies/${id}`),
  createMovie: (data) => request('/movies', { method: 'POST', body: data }),
  updateMovie: (id, data) => request(`/movies/${id}`, { method: 'PUT', body: data }),
  deleteMovie: (id) => request(`/movies/${id}`, { method: 'DELETE' }),

  // Theatres
  getTheatres: (params = {}) => {
    const query = new URLSearchParams();
    if (params.city && params.city !== 'All') query.append('city', params.city);
    const qs = query.toString();
    return request(`/theatres${qs ? `?${qs}` : ''}`);
  },
  getTheatreById: (id) => request(`/theatres/${id}`),
  createTheatre: (data) => request('/theatres', { method: 'POST', body: data }),
  updateTheatre: (id, data) => request(`/theatres/${id}`, { method: 'PUT', body: data }),
  deleteTheatre: (id) => request(`/theatres/${id}`, { method: 'DELETE' }),

  // Shows
  getShows: (params = {}) => {
    const query = new URLSearchParams();
    if (params.movieId) query.append('movieId', params.movieId);
    if (params.theatreId) query.append('theatreId', params.theatreId);
    if (params.date) query.append('date', params.date);
    const qs = query.toString();
    return request(`/shows${qs ? `?${qs}` : ''}`);
  },
  getShowById: (id) => request(`/shows/${id}`),
  getShowSeats: (id) => request(`/shows/${id}/seats`),
  createShow: (data) => request('/shows', { method: 'POST', body: data }),
  deleteShow: (id) => request(`/shows/${id}`, { method: 'DELETE' }),

  // Bookings
  createBooking: (data) => request('/bookings', { method: 'POST', body: data }),
  getMyBookings: () => request('/bookings/my'),
  getBookingById: (id) => request(`/bookings/${id}`),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  getAllAdminBookings: () => request('/bookings/admin/all'),

  // Admin Console & Management
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  getAdminPayments: () => request('/admin/payments'),
  getAdminReviews: () => request('/admin/reviews'),
  deleteReview: (id) => request(`/admin/reviews/${id}`, { method: 'DELETE' }),

  // Reviews
  getMovieReviews: (movieId) => request(`/reviews/movie/${movieId}`),
  createReview: (data) => request('/reviews', { method: 'POST', body: data })
};
