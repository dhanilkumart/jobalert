const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  jobPreferences: [{
    title: String,
    location: String,
  }],
  sources: { type: [String], default: ['linkedin', 'naukri', 'shine', 'indeed'] },
  alertsEnabled: { type: Boolean, default: true },
  frequency: { type: String, enum: ['instant', 'hourly', 'daily'], default: 'instant' },
  lastNotifiedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
