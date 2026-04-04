const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  source: { type: String, required: true },
  link: { type: String, required: true },
  experience: { type: String },
  salary: { type: String },
  description: { type: String },
  postedAt: { type: Date, default: Date.now },
  tags: { type: [String] },
  dedupKey: { type: String, unique: true, required: true }, // MD5 hash of source and link
}, { timestamps: true });

JobSchema.index({ dedupKey: 1 });

module.exports = mongoose.model('Job', JobSchema);
