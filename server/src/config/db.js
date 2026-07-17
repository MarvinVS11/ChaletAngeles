const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('MongoDB conectado');
}

module.exports = connectDB;
