const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { getJobs, saveJobs } = require('../src/storage');

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'info@flamelogistics.net';
const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@flamelogistics.net';

function createMailTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function normalizeJob(job) {
  if (!job) return null;

  return {
    ...job,
    title: job.title || 'Open Role',
    department: job.department || 'Operations',
    location: job.location || 'Riyadh, Saudi Arabia',
    jobType: job.jobType || 'Full Time',
    experience: job.experience || 'Mid-Level',
    salary: job.salary || 'Competitive',
    description: job.description || 'Join our team and help shape the next chapter of Flame Logistics.',
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    active: job.active !== false,
    deadline: job.deadline || ''
  };
}

function normalizeJobs(jobs) {
  return (jobs || []).map(normalizeJob).filter(Boolean);
}

router.get('/', (req, res) => {
  try {
    const activeOnly = (req.query.active || 'true').toString().toLowerCase() !== 'false';
    let jobs = normalizeJobs(getJobs());

    if (activeOnly) {
      jobs = jobs.filter((job) => job.active);
    }

    res.json({ items: jobs, total: jobs.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job openings' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const jobId = Number(req.params.id);
    const jobs = normalizeJobs(getJobs());
    const job = jobs.find((item) => Number(item.id) === jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job opening' });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, department, location, jobType, experience, salary, description, requirements, deadline, active } = req.body || {};

    if (!title || !department || !location || !description) {
      return res.status(400).json({ error: 'Title, department, location, and description are required.' });
    }

    const jobs = getJobs();
    const newId = jobs.length > 0 ? Math.max(...jobs.map((item) => Number(item.id) || 0)) + 1 : 1;
    const normalizedRequirements = Array.isArray(requirements)
      ? requirements.map((item) => String(item).trim()).filter(Boolean)
      : [];

    const newJob = {
      id: newId,
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      jobType: jobType ? jobType.trim() : 'Full Time',
      experience: experience ? experience.trim() : 'Mid-Level',
      salary: salary ? salary.trim() : 'Competitive',
      description: description.trim(),
      requirements: normalizedRequirements,
      deadline: deadline ? deadline.trim() : '',
      active: active !== false,
      createdAt: new Date().toISOString()
    };

    jobs.unshift(newJob);
    saveJobs(jobs);

    res.status(201).json({ message: 'Job opening added successfully', item: newJob });
  } catch (error) {
    console.error('Error adding job opening:', error);
    res.status(500).json({ error: 'Failed to add job opening' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const jobId = Number(req.params.id);
    let jobs = getJobs();

    const exists = jobs.some((job) => Number(job.id) === jobId);
    if (!exists) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    jobs = jobs.filter((job) => Number(job.id) !== jobId);
    saveJobs(jobs);

    res.json({ message: 'Job opening deleted successfully', id: jobId });
  } catch (error) {
    console.error('Error deleting job opening:', error);
    res.status(500).json({ error: 'Failed to delete job opening' });
  }
});

router.post('/apply', async (req, res) => {
  try {
    const body = req.body || {};
    const fullName = body.fullName || body.name || '';
    const email = body.email || '';
    const phone = body.phone || '';
    const applyingFor = body.applyingFor || body.position || '';
    const location = body.location || '';
    const experience = body.experience || '';
    const expectedSalary = body.expectedSalary || '';
    const noticePeriod = body.noticePeriod || '';
    const message = body.message || '';

    if (!fullName || !email || !applyingFor || !message) {
      return res.status(400).json({ error: 'Please provide your full name, email, role, and a message.' });
    }

    const transporter = createMailTransporter();
    if (!transporter) {
      console.error('SMTP configuration missing. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env');
      return res.status(500).json({ error: 'Mail service is not configured yet.' });
    }

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: `Career application from ${fullName}`,
      html: `
        <h3>New career application from Flame Logistics website</h3>
        <p><strong>Applicant:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Applying for:</strong> ${applyingFor}</p>
        <p><strong>Location:</strong> ${location || 'Not provided'}</p>
        <p><strong>Experience:</strong> ${experience || 'Not provided'}</p>
        <p><strong>Expected salary:</strong> ${expectedSalary || 'Not provided'}</p>
        <p><strong>Notice period:</strong> ${noticePeriod || 'Not provided'}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    });

    res.json({ success: true, message: 'Your application was sent successfully.', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending career application email:', error);
    res.status(500).json({ error: 'Failed to send application email.', detail: error.message });
  }
});

module.exports = router;
