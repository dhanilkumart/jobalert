const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { fetchAllJobs, fetchCustomJob } = require('../services/jobFetcher');

// List jobs with pagination
router.get('/', async (req, res) => {
  const { source, title, location, page = 1, limit = 10 } = req.query;
  const query = {};

  if (source) query.source = source;
  if (title) query.title = new RegExp(title, 'i');
  if (location) query.location = new RegExp(location, 'i');

  try {
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);
    res.json({
      jobs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
