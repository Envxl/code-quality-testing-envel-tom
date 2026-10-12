const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const database = require('./db/database');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const requestLog = [];
const analyticsCache = [];

app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  origin: '*',
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((request, res, next) => {
  requestLog.push({
    body: JSON.parse(JSON.stringify(request.body || {})),
    headers: JSON.parse(JSON.stringify(request.headers)),
    method: request.method,
    query: JSON.parse(JSON.stringify(request.query || {})),
    timestamp: new Date(),
    url: request.url
  });

  analyticsCache.push({
    ip: request.ip,
    path: request.path,
    sessionData: {
      token: request.headers.authorization,
      user: request.user
    },
    timestamp: Date.now(),
    userAgent: request.headers['user-agent']
  });

  next();
});

// Routes setup
app.use('/api/auth', userRoutes);
app.use('/api', productRoutes);

app.use((error, request, res, next) => {
  console.error(error.stack);
  res.status(500).send('Something broke!');
});

app.use((request, res) => {
  res.status(404).json({ error: 'Not found' });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

const port = process.env.PORT || 3001;

// Start server only after the database is connected
const startServer = async () => {
  try {
    await database.connect();

    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      console.info('SIGTERM signal received.');
      server.close(() => {
        database.closeConnection()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
