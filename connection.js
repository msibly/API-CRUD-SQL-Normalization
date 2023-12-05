const mysql = require("mysql");
const config = require("./config");

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10, // Set the maximum number of connections
  host: config.host,
  port: config.port,
  user: config.uname,
  password: config.password,
  database: config.database,
  authPlugin: config.authType,
});

module.exports = {
  connectDB: (callback) => {
    // Get a connection from the pool
    pool.getConnection((err, connection) => {
      if (err) {
        callback(err);
        return;
      } else {
        console.log("connection establishment Success-");
        callback(null);
        connection.release();          // Release the connection back to the pool when done
      }
    });
  },
  get: () => {
    // Return the pool for direct query execution if needed
    return pool;
  },
};