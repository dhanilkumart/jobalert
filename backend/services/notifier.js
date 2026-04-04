/**
 * Notifier Service
 * Sends WhatsApp alerts via Twilio when new matching jobs are found.
 */

const twilio = require('twilio');
const User = require('../models/User');

let client;
try {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} catch {
  console.warn('⚠️  Twilio not configured — WhatsApp alerts disabled.');
}

const FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

function formatJobMessage(job) {
  const source = job.source.toUpperCase();
  const posted = job.postedAt
    ? `📅 ${new Date(job.postedAt).toLocaleDateString('en-IN')}`
    : '';

  return [
    `🔔 *New Job Alert!*`,
    ``,
    `💼 *${job.title}*`,
    `🏢 ${job.company}`,
    `📍 ${job.location}`,
    `🌐 Source: ${source}`,
    posted,
    ``,
    `🔗 Apply: ${job.link}`,
    ``,
    `Reply STOP to pause alerts.`
  ].filter(Boolean).join('\n');
}

function jobMatchesUser(job, user) {
  if (!user.alertsEnabled) return false;
  if (!user.sources.includes(job.source)) return false;

  // Check if any preference matches this job
  const prefs = user.jobPreferences || [];
  if (prefs.length === 0) return true; // No preferences = send everything

  return prefs.some(pref => {
    const titleMatch = !pref.title ||
      job.title.toLowerCase().includes(pref.title.toLowerCase());
    const locationMatch = !pref.location ||
      job.location.toLowerCase().includes(pref.location.toLowerCase()) ||
      job.location.toLowerCase().includes('remote');
    return titleMatch && locationMatch;
  });
}

async function sendWhatsApp(to, body) {
  // BYPASS: Always treat as DRY RUN. Logic remains but execution is skipped.
  const isDryRun = true; 
  
  if (isDryRun || !client) {
    console.log(`[BYPASS - DRY RUN] Would send to ${to}:\n${body}\n`);
    return;
  }
  const formattedPhone = to.startsWith('+') ? to : `+${to}`;
  try {
    await client.messages.create({
      from: FROM,
      to: `whatsapp:${formattedPhone}`,
      body
    });
    console.log(`  📱 Sent alert to ${formattedPhone}`);
  } catch (err) {
    console.error(`  ❌ Failed to send to ${to}: ${err.message}`);
  }
}

async function sendNewJobAlerts(newJobs) {
  if (!newJobs || newJobs.length === 0) return;

  const users = await User.find({ alertsEnabled: true }).lean();
  console.log(`  Found ${users.length} users to notify`);

  for (const user of users) {
    const matchingJobs = newJobs.filter(j => jobMatchesUser(j, user));
    if (matchingJobs.length === 0) continue;

    // Send top 3 matching jobs per cycle to avoid spam
    const toSend = matchingJobs.slice(0, 3);
    for (const job of toSend) {
      await sendWhatsApp(user.phone, formatJobMessage(job));
      await new Promise(r => setTimeout(r, 500)); // Rate limit
    }

    // Update lastNotifiedAt
    await User.findByIdAndUpdate(user._id, { lastNotifiedAt: new Date() });
  }
}

// Send a test message to verify Twilio setup
async function sendTestMessage(phone) {
  const body = [
    `✅ *JobAlert Setup Complete!*`,
    ``,
    `You'll now receive WhatsApp alerts for new jobs matching your preferences.`,
    ``,
    `Reply STOP at any time to pause notifications.`
  ].join('\n');
  await sendWhatsApp(phone, body);
}

module.exports = { sendNewJobAlerts, sendTestMessage, formatJobMessage };
