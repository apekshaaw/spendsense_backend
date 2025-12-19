// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    // ❗ NO app.listen, NO app, NO PORT here
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err; // let server.js handle failure
  }
};

module.exports = connectDB;
