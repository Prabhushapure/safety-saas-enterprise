import express from 'express';
import cors from 'cors';
import { testConnection } from './config/database.js';
import gamesRouter from './routes/games.js';
import authRouter from './routes/auth.js';
import licensesRouter from './routes/licenses.js';
import playRouter from './routes/play.js';
import usersRouter from './routes/users.js';
import sendMailRouter from './routes/sendmail.js';
import safetyQnaRouter from './routes/safetyQna.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/games', gamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/licenses', licensesRouter);
app.use('/api/play', playRouter);
app.use('/api/users', usersRouter);
app.use('/api/sendmail', sendMailRouter);
app.use('/api/safety-qna', safetyQnaRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      // eslint-disable-next-line no-undef
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // eslint-disable-next-line no-undef
    process.exit(1);
  }
};

startServer();
