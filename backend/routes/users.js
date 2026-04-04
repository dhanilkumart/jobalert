const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register user
router.post('/register', async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { name, phone },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get user profile
router.get('/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;
    let user = await User.findOne({ phone });

    // BYPASS: Handle guest_user auto-provisioning
    if (!user && phone === 'guest_user') {
      user = await User.create({
        name: 'Guest User',
        phone: 'guest_user',
        alertsEnabled: false,
        jobPreferences: [
          { title: 'Frontend Developer', location: 'India' }
        ]
      });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Save job preferences
router.post('/preferences', async (req, res) => {
  const { phone, preferences } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { jobPreferences: preferences },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Toggle alerts
router.post('/toggle-alerts', async (req, res) => {
  const { phone, alertsEnabled } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { alertsEnabled },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
