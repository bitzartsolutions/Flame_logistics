const test = require('node:test');
const assert = require('node:assert/strict');
const { getJobs, saveJobs } = require('../src/storage');

test('getJobs and saveJobs persist job openings', () => {
  const originalJobs = getJobs();
  const sampleJob = {
    id: 999,
    title: 'Operations Analyst',
    department: 'Operations',
    location: 'Riyadh',
    jobType: 'Full Time',
    experience: '2+ years',
    salary: 'Competitive',
    description: 'Support day-to-day logistics coordination.',
    requirements: ['Excellent communication skills'],
    active: true,
    createdAt: new Date().toISOString()
  };

  saveJobs([sampleJob]);
  const jobs = getJobs();

  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].title, 'Operations Analyst');
  assert.equal(jobs[0].department, 'Operations');

  saveJobs(originalJobs);
});
