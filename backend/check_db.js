require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('--- User Database Check ---');
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      users.forEach(u => {
        console.log(`Name: ${u.name}`);
        console.log(`Phone: ${u.phone}`);
        console.log(`Alerts Enabled: ${u.alertsEnabled}`);
        console.log(`Preferences: ${JSON.stringify(u.jobPreferences)}`);
        console.log('---------------------------');
      });
    }
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUser();
