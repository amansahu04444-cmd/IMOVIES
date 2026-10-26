const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// DNS server fallback for MongoDB Atlas SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');

const initAdmin = async () => {
  const forceReset = process.argv.includes('--force-reset');

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = (process.env.ADMIN_NAME || 'System Administrator').trim();

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

  console.log('========================================================');
  console.log('       IMOVIES SECURE ADMIN PROVISIONING UTILITY        ');
  console.log('========================================================\n');

  try {
    await mongoose.connect(mongoUri);
    console.log('[Setup] Connected to database.');

    // 1. Check if an Admin account already exists
    const existingAdmin = await User.findOne({ role: 'ADMIN' });

    if (existingAdmin) {
      if (!forceReset) {
        console.log(`[Setup] Admin account already exists: ${existingAdmin.email} (ID: ${existingAdmin._id})`);
        console.log('[Setup] Skipping creation to prevent duplicate accounts and unauthorized credential resets.');
        console.log('[Setup] Note: To explicitly reset credentials for this admin, run:');
        console.log('        npm run setup:admin -- --force-reset\n');
        await mongoose.disconnect();
        process.exit(0);
      }

      // Force reset requested
      console.log(`[Setup] Force-reset flag detected. Updating credentials for existing Admin: ${existingAdmin.email}...`);

      if (!adminPassword || adminPassword.length < 6) {
        console.error('[Setup Error] ADMIN_PASSWORD must be configured in environment variables and be at least 6 characters long.');
        await mongoose.disconnect();
        process.exit(1);
      }

      existingAdmin.password = adminPassword;
      if (adminName) existingAdmin.name = adminName;
      if (adminEmail && adminEmail !== existingAdmin.email) {
        // Verify email uniqueness
        const duplicateCheck = await User.findOne({ email: adminEmail });
        if (duplicateCheck && duplicateCheck._id.toString() !== existingAdmin._id.toString()) {
          console.error(`[Setup Error] Cannot change admin email to ${adminEmail} because an account with that email already exists.`);
          await mongoose.disconnect();
          process.exit(1);
        }
        existingAdmin.email = adminEmail;
      }

      await existingAdmin.save(); // Triggers bcrypt hashing pre-save hook
      console.log(`[Setup Success] Credentials successfully updated and hashed with bcrypt for Admin: ${existingAdmin.email}\n`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // 2. No Admin account exists: Create initial Admin
    if (!adminEmail || !adminPassword) {
      console.error('[Setup Error] ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables (or Server/.env).');
      console.error('              Example: ADMIN_EMAIL=admin@imovies.com ADMIN_PASSWORD=your_secure_password');
      await mongoose.disconnect();
      process.exit(1);
    }

    if (adminPassword.length < 6) {
      console.error('[Setup Error] ADMIN_PASSWORD must be at least 6 characters long.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if user with adminEmail already exists as a regular USER
    let userByEmail = await User.findOne({ email: adminEmail });
    if (userByEmail) {
      console.log(`[Setup] User with email ${adminEmail} already exists with role '${userByEmail.role}'. Elevating to 'ADMIN'...`);
      userByEmail.role = 'ADMIN';
      userByEmail.password = adminPassword;
      if (adminName) userByEmail.name = adminName;
      await userByEmail.save();
      console.log(`[Setup Success] User ${userByEmail.email} elevated to ADMIN with secure bcrypt-hashed password.\n`);
    } else {
      const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN'
      });
      console.log(`[Setup Success] Initial Admin account created: ${newAdmin.email} (Role: ADMIN, ID: ${newAdmin._id})`);
      console.log('              Password securely hashed with bcrypt (10 rounds).\n');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Setup Fatal Error]', err.message);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
};

initAdmin();
