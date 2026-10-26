// Normalize and validate API Base URL
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let cleaned = envUrl.trim().replace(/\/+$/, '');
    // If it's an absolute URL without /api at the end, append /api
    if (/^https?:\/\//i.test(cleaned)) {
      if (!cleaned.endsWith('/api')) {
        cleaned = `${cleaned}/api`;
      }
      return cleaned;
    }
    // Relative path (e.g. /api)
    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  }

  // In production builds or when running on a deployed host, default to the deployed Render backend
  if (import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
    return 'https://imovies-bi04.onrender.com/api';
  }

  return '/api';
};


const BASE_URL = resolveBaseUrl();

// Diagnostic warning for misconfigured deployment
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  if (!isLocalhost && BASE_URL.includes('localhost')) {
    console.warn(
      `[IMovies API Warning] Deployed frontend on "${hostname}" is calling localhost ("${BASE_URL}"). Ensure VITE_API_URL is configured to your Render backend in your deployment settings.`
    );
  }
}

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

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    const error = new Error(
      `Unable to reach cinema server at ${url}. Please verify the backend is running and CORS is configured.`
    );
    error.isNetworkError = true;
    error.status = 0;
    error.originalError = networkErr;
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (!response.ok) {
    let fallbackMsg = `Request failed with status ${response.status}`;
    if (response.status === 404) {
      fallbackMsg = `API endpoint not found (404) at ${url}. Please verify backend route configuration.`;
    } else if (response.status === 503) {
      fallbackMsg = 'Could not connect to cinema database. Please ensure backend is running.';
    } else if (response.status === 500) {
      fallbackMsg = 'Internal server error occurred on cinema backend.';
    }

    const message = data.message || fallbackMsg;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    error.errorType = data.errorType;
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
  updateShow: (id, data) => request(`/shows/${id}`, { method: 'PUT', body: data }),
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
  createReview: (data) => request('/reviews', { method: 'POST', body: data }),

  // Health
  getHealth: () => request('/health')
};
