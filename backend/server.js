require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cron = require('node-cron');

const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const { fetchAllJobs } = require('./services/jobFetcher');
const { sendNewJobAlerts } = require('./services/notifier');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobalert')
  .then(() => console.log('✅ MongoDB connection initiated'))
  .catch(err => console.error('❌ MongoDB initial error:', err));

mongoose.connection.on('connected', () => console.log('🟢 Mongoose connected to DB'));
mongoose.connection.on('error', (err) => console.error('🔴 Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('⚪ Mongoose disconnected'));
mongoose.connection.on('reconnected', () => console.log('🔵 Mongoose reconnected'));

// ── Scheduler ────────────────────────────────────────────────────────────────
// Runs every 5 minutes to fetch new jobs
const INTERVAL = process.env.FETCH_INTERVAL || 5;
cron.schedule(`*/${INTERVAL} * * * *`, async () => {
  console.log(`\n🔄 [${new Date().toISOString()}] Running job fetch...`);
  try {
    const newJobs = await fetchAllJobs();
    if (newJobs.length > 0) {
      console.log(`✨ Found ${newJobs.length} new jobs. Sending alerts...`);
      await sendNewJobAlerts(newJobs);
    } else {
      console.log('📭 No new jobs found.');
    }
  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 JobAlert Backend running on port ${PORT}`);
  console.log(`📅 Job fetch interval: every ${INTERVAL} minutes`);
});
