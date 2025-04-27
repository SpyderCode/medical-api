require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const { connectDB } = require('../config/database');
const { logger } = require('../utils/logger');

// Admin user details - you can change these as needed
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  role: 'admin',
  phone: '1234567890'
};

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log(`Admin user with email ${adminUser.email} already exists`);
      
      // Delete the existing admin user so we can recreate it with correct password
      console.log(`Deleting existing admin user for recreation...`);
      await User.findByIdAndDelete(existingAdmin._id);
      console.log(`Existing admin user deleted successfully.`);
    }

    // Create admin user - let the model's pre-save hook handle password hashing
    const newAdmin = await User.create(adminUser);

    console.log(`Admin user created/updated with email: ${newAdmin.email}`);
    console.log('You can now log in with these credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);

    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin user: ${error.message}`);
    process.exit(1);
  }
};

// Execute the function
createAdmin();