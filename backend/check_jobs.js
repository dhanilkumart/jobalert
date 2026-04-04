require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');

async function checkJobs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const jobs = await Job.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('--- Job Database Check (Newest 5) ---');
    if (jobs.length === 0) {
      console.log('No jobs found in database.');
    } else {
      jobs.forEach((j, i) => {
        console.log(`Job ${i+1}: ${j.title}`);
        console.log(`  Company: ${j.company}`);
        console.log(`  Source: ${j.source}`);
        console.log(`  Salary: ${j.salary || 'N/A'}`);
        console.log(`  Exp: ${j.experience || 'N/A'}`);
        console.log(`  Desc Snippet: ${j.description ? j.description.substring(0, 50) + '...' : 'N/A'}`);
        console.log('---------------------------');
      });
    }
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkJobs();
