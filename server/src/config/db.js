const mongoose = require('mongoose');

let connectionPromise = null;

function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    connectionPromise = mongoose
      .connect(uri)
      .then(() => {
        console.log('MongoDB conectado');
        return mongoose.connection;
      })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }

  return connectionPromise;
}

module.exports = connectDB;
