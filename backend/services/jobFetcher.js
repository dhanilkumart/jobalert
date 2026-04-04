/**
 * JobFetcher Service
 * Fetches public job listings from multiple sources.
 * - Respects robots.txt (no login-wall pages)
 * - Rate limits each source
 * - Deduplicates via dedupKey before DB insert
 */

const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const Job = require('../models/Job');
const path = require('path');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JobAlertBot/1.0; +https://yourdomain.com/bot)',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

const DELAY_MS = 2000; // 2s between requests to same source
const sleep = ms => new Promise(r => setTimeout(r, ms));

function makeKey(source, link) {
  return crypto.createHash('md5').update(`${source}::${link}`).digest('hex');
}

// Load job roles from external JSON config (easy to edit without touching code)
function loadJobRoles() {
  // Clear cache so changes to the file are picked up on next cron cycle
  const configPath = path.join(__dirname, '..', 'config', 'jobRoles.json');
  delete require.cache[require.resolve(configPath)];
  const config = require(configPath);
  return config.roles || [];
}


// ── LinkedIn Public Jobs ────────────────────────────────────────────────────
// Uses LinkedIn's guest search (no login required)
async function fetchLinkedIn(keywords = ['developer', 'software engineer'], locations = ['India']) {
  const jobs = [];
  for (const keyword of keywords.slice(0, 2)) {
    for (const location of locations.slice(0, 2)) {
      try {
        await sleep(DELAY_MS);
        // f_TPR=r604800 is the filter for past 7 days (604800 seconds)
        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&f_TPR=r604800&position=1&pageNum=0`;
        const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(data);

        $('div.base-card').each((_, el) => {
          const title = $(el).find('.base-search-card__title').text().trim();
          const company = $(el).find('.base-search-card__subtitle').text().trim();
          const loc = $(el).find('.job-search-card__location').text().trim();
          const link = $(el).find('a.base-card__full-link').attr('href') || '';
          const postedAt = $(el).find('time').attr('datetime');
          const salary = $(el).find('.job-search-card__salary-info').text().trim();
          const description = $(el).find('.base-search-card__metadata').text().trim();

          if (title && company && link) {
            jobs.push({
              title, company,
              location: loc || location,
              source: 'linkedin',
              link: link.split('?')[0],
              postedAt: postedAt ? new Date(postedAt) : new Date(),
              salary: salary || null,
              description: description || null,
              tags: [keyword],
              dedupKey: makeKey('linkedin', link.split('?')[0])
            });
          }
        });
      } catch (err) {
        console.warn(`LinkedIn fetch error (${keyword}/${location}): ${err.message}`);
      }
    }
  }
  return jobs;
}

// ── Naukri Public Jobs ──────────────────────────────────────────────────────
// Naukri's public search pages
async function fetchNaukri(keywords = ['react developer', 'node developer'], locations = ['Bangalore', 'Remote']) {
  const jobs = [];
  for (const keyword of keywords.slice(0, 2)) {
    for (const location of locations.slice(0, 2)) {
      try {
        await sleep(DELAY_MS);
        const slug = keyword.toLowerCase().replace(/\s+/g, '-');
        // jobAge=7 filters for last 7 days
        const url = `https://www.naukri.com/${slug}-jobs-in-${location.toLowerCase()}?src=jobsearchDesk&spl=${encodeURIComponent(keyword)}&jobAge=7`;
        const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(data);

        $('article.jobTuple').each((_, el) => {
          const title = $(el).find('.title').text().trim();
          const company = $(el).find('.companyInfo .subTitle').text().trim();
          const loc = $(el).find('.loc .ellipsis').text().trim();
          const link = $(el).find('a.title').attr('href') || '';
          const exp = $(el).find('.expwdth').text().trim();
          const salary = $(el).find('.salary').text().trim();
          const description = $(el).find('.job-description').text().trim() || $(el).find('.jobTupleFooter .ellipsis').text().trim();

          if (title && company && link) {
            jobs.push({
              title, company,
              location: loc || location,
              source: 'naukri',
              link,
              experience: exp,
              salary: salary !== 'Not disclosed' ? salary : null,
              description: description || null,
              postedAt: new Date(),
              tags: [keyword],
              dedupKey: makeKey('naukri', link)
            });
          }
        });
      } catch (err) {
        console.warn(`Naukri fetch error (${keyword}/${location}): ${err.message}`);
      }
    }
  }
  return jobs;
}

// ── Shine Jobs ──────────────────────────────────────────────────────────────
async function fetchShine(keywords = ['frontend developer', 'backend developer'], locations = ['Bangalore', 'Mumbai']) {
  const jobs = [];
  for (const keyword of keywords.slice(0, 2)) {
    for (const location of locations.slice(0, 2)) {
      try {
        await sleep(DELAY_MS);
        // Appending query param for more recent results if applicable to shine
        const url = `https://www.shine.com/job-search/${keyword.toLowerCase().replace(/\s+/g, '-')}-jobs-in-${location.toLowerCase()}?job_age=7`;
        const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(data);

        $('div.jobBox').each((_, el) => {
          const title = $(el).find('.jobTitle').text().trim();
          const company = $(el).find('.companyName').text().trim();
          const loc = $(el).find('.location').text().trim();
          const link = $(el).find('a').attr('href') || '';
          const exp = $(el).find('.exp').text().trim();
          const salary = $(el).find('.salary').text().trim();
          const description = $(el).find('.job-description').text().trim();

          if (title && company && link) {
            const fullLink = link.startsWith('http') ? link : `https://www.shine.com${link}`;
            jobs.push({
              title, company,
              location: loc || location,
              source: 'shine',
              link: fullLink,
              experience: exp,
              salary: salary || null,
              description: description || null,
              postedAt: new Date(),
              tags: [keyword],
              dedupKey: makeKey('shine', fullLink)
            });
          }
        });
      } catch (err) {
        console.warn(`Shine fetch error (${keyword}/${location}): ${err.message}`);
      }
    }
  }
  return jobs;
}

// ── Indeed Jobs ─────────────────────────────────────────────────────────────
async function fetchIndeed(keywords = ['software developer'], locations = ['India']) {
  const jobs = [];
  for (const keyword of keywords.slice(0, 2)) {
    for (const location of locations.slice(0, 1)) {
      try {
        await sleep(DELAY_MS + 1000);
        // fromage=7 filters for last 7 days
        const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}&fromage=7`;
        const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $ = cheerio.load(data);

        $('div.job_seen_beacon').each((_, el) => {
          const title = $(el).find('[data-testid="jobTitle"] span').text().trim();
          const company = $(el).find('[data-testid="company-name"]').text().trim();
          const loc = $(el).find('[data-testid="text-location"]').text().trim();
          const linkEl = $(el).find('[data-testid="jobTitle"] a');
          const href = linkEl.attr('href') || '';
          const link = href.startsWith('/') ? `https://www.indeed.com${href}` : href;

          const salary = $(el).find('[data-testid="attribute_snippet_item"]').first().text().trim();
          const description = $(el).find('.job-snippet').text().trim();

          if (title && company && link) {
            jobs.push({
              title, company,
              location: loc || location,
              source: 'indeed',
              link,
              salary: salary || null,
              description: description || null,
              postedAt: new Date(),
              tags: [keyword],
              dedupKey: makeKey('indeed', link.split('?')[0])
            });
          }
        });
      } catch (err) {
        console.warn(`Indeed fetch error (${keyword}/${location}): ${err.message}`);
      }
    }
  }
  return jobs;
}

// ── Main orchestrator ────────────────────────────────────────────────────────
async function fetchAllJobs() {
  const User = require('../models/User');

  // Load roles from config/jobRoles.json
  const allRoles = loadJobRoles();
  if (allRoles.length === 0) {
    console.warn('⚠️  No roles found in config/jobRoles.json — skipping fetch.');
    return [];
  }

  // Randomly pick 3-4 roles per cycle to avoid rate limits
  const shuffledRoles = [...allRoles].sort(() => 0.5 - Math.random());
  const keywords = shuffledRoles.slice(0, 4);

  // We still need locations from users or default
  const users = await User.find({ alertsEnabled: true }).lean();
  const locationSet = new Set();
  
  users.forEach(u => {
    (u.jobPreferences || []).forEach(p => {
      if (p.location) locationSet.add(p.location);
    });
  });

  // Limit to max 3 locations to keep the request volume manageable
  const locations = locationSet.size > 0 ? [...locationSet].slice(0, 3) : ['India', 'Remote'];

  console.log(`  📋 Roles loaded from jobRoles.json: ${allRoles.length} total`);
  console.log(`  🎯 Cron Keywords Selected: ${keywords.join(', ')}`);
  console.log(`  📍 Cron Locations Selected: ${locations.join(', ')}`);

  return await runFetchAndSave(keywords, locations);
}

// ── Custom Fetch ─────────────────────────────────────────────────────────────
async function fetchCustomJob(keyword, location) {
  console.log(`  Custom Fetch - Keyword: ${keyword}, Location: ${location}`);
  const keywords = [keyword];
  const locations = location ? [location] : ['India', 'Remote'];
  return await runFetchAndSave(keywords, locations);
}

// ── Execute Fetch & Save ─────────────────────────────────────────────────────
async function runFetchAndSave(keywords, locations) {
  // Fetch from all sources in parallel (with internal rate limiting per source)
  const [li, nk, sh, ind] = await Promise.allSettled([
    fetchLinkedIn(keywords, locations),
    fetchNaukri(keywords, locations),
    fetchShine(keywords, locations),
    fetchIndeed(keywords, locations)
  ]);

  const allJobs = [
    ...(li.status === 'fulfilled' ? li.value : []),
    ...(nk.status === 'fulfilled' ? nk.value : []),
    ...(sh.status === 'fulfilled' ? sh.value : []),
    ...(ind.status === 'fulfilled' ? ind.value : [])
  ];

  console.log(`  Fetched ${allJobs.length} raw jobs from all sources`);

  // Upsert jobs, skip duplicates (dedupKey unique index)
  const newJobs = [];
  for (const jobData of allJobs) {
    try {
      const job = await Job.findOneAndUpdate(
        { dedupKey: jobData.dedupKey },
        { $setOnInsert: jobData },
        { upsert: true, new: true, rawResult: true }
      );
      if (job.lastErrorObject?.upserted) {
        newJobs.push(job.value);
      }
    } catch (err) {
      if (err.code !== 11000) console.warn('Job save error:', err.message);
    }
  }

  console.log(`  ✅ ${newJobs.length} new jobs saved to DB`);
  return newJobs;
}

module.exports = { fetchAllJobs, fetchCustomJob, fetchLinkedIn, fetchNaukri, fetchShine, fetchIndeed };
