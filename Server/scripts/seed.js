const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database...');

    // Clear existing collections safely
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    await Booking.deleteMany({});
    console.log('[Seed] Cleared existing data collections.');

    // 1. Create Users (Using environment variables with secure fallback for dev seeding)
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@imovies.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = (process.env.ADMIN_NAME || 'System Administrator').trim();

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN'
    });

    const demoUser = await User.create({
      name: 'Demo Moviegoer',
      email: 'user@imovies.com',
      password: process.env.DEMO_USER_PASSWORD || 'User@123',
      role: 'USER'
    });

    console.log(`[Seed] Created Admin (${admin.email}) and Demo User (${demoUser.email})`);

    // 2. Create Theatres
    const theatres = await Theatre.create([
      {
        name: 'PVR Inox Megaplex',
        city: 'Mumbai',
        address: 'Phoenix Palladium, High Street Phoenix, Lower Parel',
        screens: [
          { screenNumber: 1, name: 'Audi 1 - IMAX with Laser', totalSeats: 80, rows: 8, seatsPerRow: 10 },
          { screenNumber: 2, name: 'Audi 2 - 4K Dolby Atmos', totalSeats: 80, rows: 8, seatsPerRow: 10 }
        ]
      },
      {
        name: 'Cinepolis Grand Palladium',
        city: 'Bangalore',
        address: 'Orion Mall, Brigade Gateway, Rajajinagar',
        screens: [
          { screenNumber: 1, name: 'Screen 1 - VIP Club Lounge', totalSeats: 80, rows: 8, seatsPerRow: 10 },
          { screenNumber: 2, name: 'Screen 2 - Macro XE Atmos', totalSeats: 80, rows: 8, seatsPerRow: 10 }
        ]
      },
      {
        name: 'Miraj Cinemas Apex',
        city: 'Delhi',
        address: 'Vegas Mall, Sector 14, Dwarka',
        screens: [
          { screenNumber: 1, name: 'Screen 1 - Dolby Surround 7.1', totalSeats: 80, rows: 8, seatsPerRow: 10 },
          { screenNumber: 2, name: 'Screen 2 - 4K Laser Screen', totalSeats: 80, rows: 8, seatsPerRow: 10 }
        ]
      }
    ]);
    console.log(`[Seed] Created ${theatres.length} multiplex theatres.`);

    // 3. Create Movies
    const movies = await Movie.create([
      {
        title: 'Interstellar: Beyond Horizons',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival amidst global ecological collapse.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        durationMinutes: 169,
        releaseDate: new Date('2026-03-15'),
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
        rating: 9.2,
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        isFeatured: true
      },
      {
        title: 'Cyberpulse: Neo Tokyo',
        description: 'In a dystopian metropolis ruled by synthetic megacorporations, a rogue cyber-detective uncovers a simulation that alters human consciousness.',
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        language: 'English',
        durationMinutes: 142,
        releaseDate: new Date('2026-05-10'),
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
        rating: 8.8,
        cast: ['Ryan Gosling', 'Ana de Armas', 'Ken Watanabe'],
        isFeatured: true
      },
      {
        title: 'The Dark Knight: Legacy',
        description: 'When a new mastermind plunges the city into chaos, the caped crusader must balance justice with the ultimate sacrifice.',
        genre: ['Action', 'Crime', 'Drama'],
        language: 'English',
        durationMinutes: 152,
        releaseDate: new Date('2026-04-20'),
        posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        rating: 9.0,
        cast: ['Christian Bale', 'Heath Ledger', 'Morgan Freeman'],
        isFeatured: true
      },
      {
        title: 'Chronicles of the Wild',
        description: 'An immersive cinematic journey through the untamed corners of the earth, documenting rare migrations and nature’s fiercest rivalries.',
        genre: ['Documentary', 'Adventure'],
        language: 'English',
        durationMinutes: 110,
        releaseDate: new Date('2026-02-14'),
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&auto=format&fit=crop&q=80',
        rating: 8.6,
        cast: ['David Attenborough', 'Sigourney Weaver'],
        isFeatured: false
      },
      {
        title: 'Neon Velvet',
        description: 'A stylish jazz noir following a nocturnal getaway driver entangled with an elusive lounge singer in 1980s Los Angeles.',
        genre: ['Crime', 'Thriller', 'Romance'],
        language: 'English',
        durationMinutes: 124,
        releaseDate: new Date('2026-06-01'),
        posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80',
        rating: 8.4,
        cast: ['Oscar Isaac', 'Carey Mulligan', 'Bryan Cranston'],
        isFeatured: false
      },
      {
        title: 'Starlight Odyssey: Animation Odyssey',
        description: 'A young stargazer and a clockwork companion embark on a journey across whimsical constellations to rekindle the dying auroras.',
        genre: ['Animation', 'Family', 'Fantasy'],
        language: 'English',
        durationMinutes: 102,
        releaseDate: new Date('2026-07-04'),
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop&q=80',
        rating: 8.9,
        cast: ['Tom Hanks', 'Emma Stone', 'Taika Waititi'],
        isFeatured: false
      }
    ]);
    console.log(`[Seed] Created ${movies.length} feature movies.`);

    // 4. Create Shows for today and upcoming dates
    const showRecords = [];
    const baseDate = new Date();

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const showDate = new Date(baseDate);
      showDate.setDate(baseDate.getDate() + dayOffset);

      theatres.forEach((theatre, tIdx) => {
        movies.forEach((movie, mIdx) => {
          // Schedule 2 shows per movie per theatre
          const morning = new Date(showDate);
          morning.setHours(10 + (mIdx % 3) * 3, 0, 0, 0);

          const evening = new Date(showDate);
          evening.setHours(18 + (mIdx % 2) * 3, 30, 0, 0);

          const screenNum = (mIdx % 2) + 1;

          showRecords.push({
            movieId: movie._id,
            theatreId: theatre._id,
            screenNumber: screenNum,
            startTime: morning,
            endTime: new Date(morning.getTime() + (movie.durationMinutes + 30) * 60 * 1000),
            pricing: { standard: 180, premium: 250, vip: 380 },
            totalSeats: 80,
            bookedSeats: dayOffset === 0 && mIdx === 0 ? ['C4', 'C5', 'D5'] : [],
            status: 'ACTIVE'
          });

          showRecords.push({
            movieId: movie._id,
            theatreId: theatre._id,
            screenNumber: screenNum,
            startTime: evening,
            endTime: new Date(evening.getTime() + (movie.durationMinutes + 30) * 60 * 1000),
            pricing: { standard: 200, premium: 280, vip: 450 },
            totalSeats: 80,
            bookedSeats: dayOffset === 0 ? ['F4', 'F5', 'G5'] : [],
            status: 'ACTIVE'
          });
        });
      });
    }

    const createdShows = await Show.insertMany(showRecords);
    console.log(`[Seed] Created ${createdShows.length} showtime schedules across 3 days.`);

    // 5. Create an initial sample booking for Demo User
    const firstShow = createdShows[0];
    await Booking.create({
      bookingReference: 'IMV-DEMO01',
      userId: demoUser._id,
      showId: firstShow._id,
      seats: ['C4', 'C5'],
      seatDetails: [
        { seatNumber: 'C4', tier: 'premium', price: firstShow.pricing.premium },
        { seatNumber: 'C5', tier: 'premium', price: firstShow.pricing.premium }
      ],
      totalAmount: firstShow.pricing.premium * 2,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID'
    });
    console.log('[Seed] Created initial confirmed demo booking.');

    console.log('\n=========================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY ');
    console.log('=========================================');
    console.log(`Admin Account: ${admin.email} (Password set via ADMIN_PASSWORD)`);
    console.log(`Demo Account:  ${demoUser.email}`);
    console.log('=========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
