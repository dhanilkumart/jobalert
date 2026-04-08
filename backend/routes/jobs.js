const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { fetchAllJobs, fetchCustomJob } = require('../services/jobFetcher');

// List jobs with pagination
router.get('/', async (req, res) => {
  const MAX_JOBS = 100;
  const { source, title, location, page = 1, limit = 10 } = req.query;
  const query = {};

  if (source) query.source = source;
  if (title) query.title = new RegExp(title, 'i');
  if (location) query.location = new RegExp(location, 'i');

  try {
    // Determine how many jobs to skip, ensuring we don't exceed MAX_JOBS
    const skip = (page - 1) * limit;
    const currentLimit = Math.min(Number(limit), MAX_JOBS - skip);

    let jobs = [];
    let total = 0;

    if (currentLimit > 0) {
      jobs = await Job.find(query)
        .sort({ postedAt: -1 })
        .skip(skip)
        .limit(currentLimit);
      
      const actualTotal = await Job.countDocuments(query);
      total = Math.min(actualTotal, MAX_JOBS);
    }

    res.json({
      jobs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    console.error('Job query failed:', err.message);
    
    // BYPASS: Fallback to mock data if DB is down or error occurred
    const mockJobs = [
      {
        title: 'React Developer (Mock)',
        company: 'JobAlert Tech',
        location: 'Remote',
        source: 'linkedin',
        link: 'https://linkedin.com',
        postedAt: new Date(),
        salary: '₹15L - ₹25L',
        description: 'Join our team as a React Developer in this mock environment.'
      },
      {
        title: 'Node.js Engineer (Mock)',
        company: 'Backend Hub',
        location: 'India',
        source: 'naukri',
        link: 'https://naukri.com',
        postedAt: new Date(Date.now() - 86400000),
        salary: '₹12L - ₹20L',
        description: 'Focus on scaling distributed systems with Node.js.'
      }
    ];

    res.json({
      jobs: mockJobs,
      total: mockJobs.length,
      page: 1,
      pages: 1,
      isMock: true
    });
  }
});

// Jobs grouped by source
router.get('/stats', async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Manually trigger a fetch (custom or global)
router.post('/fetch', async (req, res) => {
  const { keyword, location } = req.body;
  try {
    let newJobs = [];
    if (keyword) {
      newJobs = await fetchCustomJob(keyword, location);
    } else {
      newJobs = await fetchAllJobs();
    }
    res.json({ message: 'Fetch completed', count: newJobs.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Clear all fetched job data
router.delete('/clear-all', async (req, res) => {
  try {
    const result = await Job.deleteMany({});
    console.log(`🗑️  Cleared ${result.deletedCount} jobs from database.`);
    res.json({ message: 'All job data cleared', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
