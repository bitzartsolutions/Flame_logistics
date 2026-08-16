const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { getContent, createContent, updateContent, deleteContent } = require('../src/contentStore');
const { saveUploadedFiles } = require('../src/contactAttachments');
const { getPublicBaseUrl } = require('../src/imageUrls');

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'info@flamelogistics.net';
const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@flamelogistics.net';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (error) {
  console.warn('Unable to ensure uploads directory exists', error.message);
}

const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

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

function isDeadlinePassed(deadline) {
  if (!deadline) return false;

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) {
    // Free-text deadlines that aren't parseable dates (e.g. "Open until filled")
    // are treated as having no deadline.
    return false;
  }

  const endOfDeadlineDay = new Date(parsed);
  endOfDeadlineDay.setHours(23, 59, 59, 999);

  return endOfDeadlineDay.getTime() < Date.now();
}

function isDeletionDue(deadline) {
  if (!deadline) return false;

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const endOfDeadlineDay = new Date(parsed);
  endOfDeadlineDay.setHours(23, 59, 59, 999);

  const oneDayAfterDeadline = endOfDeadlineDay.getTime() + 24 * 60 * 60 * 1000;
  return Date.now() >= oneDayAfterDeadline;
}

async function pruneExpiredJobs(jobs) {
  const expired = (jobs || []).filter((job) => isDeletionDue(job.deadline));
  if (!expired.length) return jobs || [];

  await Promise.all(
    expired.map((job) =>
      deleteContent('careers', Number(job.id)).catch((error) => {
        console.warn('Failed to auto-delete expired job opening', job.id, error.message);
      })
    )
  );

  const expiredIds = new Set(expired.map((job) => Number(job.id)));
  return (jobs || []).filter((job) => !expiredIds.has(Number(job.id)));
}

function normalizeJob(job) {
  if (!job) return null;

  const deadline = job.deadline || '';

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
    deadline,
    deadlinePassed: isDeadlinePassed(deadline)
  };
}

function normalizeJobs(jobs) {
  return (jobs || []).map(normalizeJob).filter(Boolean);
}

router.get('/', async (req, res) => {
  try {
    const activeOnly = (req.query.active || 'true').toString().toLowerCase() !== 'false';
    const rawJobs = await pruneExpiredJobs(await getContent('careers', []));
    let jobs = normalizeJobs(rawJobs);

    if (activeOnly) {
      jobs = jobs.filter((job) => job.active);
    }

    res.json({ items: jobs, total: jobs.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job openings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    const rawJobs = await pruneExpiredJobs(await getContent('careers', []));
    const jobs = normalizeJobs(rawJobs);
    const job = jobs.find((item) => Number(item.id) === jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job opening' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, department, location, jobType, experience, salary, description, requirements, deadline, active } = req.body || {};

    if (!title || !department || !location || !description) {
      return res.status(400).json({ error: 'Title, department, location, and description are required.' });
    }

    const jobs = await getContent('careers', []);
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

    const savedJob = await createContent('careers', {
      ...newJob,
      created_at: new Date().toISOString()
    });

    if (!savedJob) {
      return res.status(500).json({ error: 'Failed to save job opening' });
    }

    res.status(201).json({ message: 'Job opening added successfully', item: savedJob });
  } catch (error) {
    console.error('Error adding job opening:', error);
    res.status(500).json({ error: 'Failed to add job opening' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    const { title, department, location, jobType, experience, salary, description, requirements, deadline, active } = req.body || {};

    if (!title || !department || !location || !description) {
      return res.status(400).json({ error: 'Title, department, location, and description are required.' });
    }

    const jobs = await getContent('careers', []);
    const exists = jobs.some((job) => Number(job.id) === jobId);
    if (!exists) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    const normalizedRequirements = Array.isArray(requirements)
      ? requirements.map((item) => String(item).trim()).filter(Boolean)
      : [];

    const updatedJob = {
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      jobType: jobType ? jobType.trim() : 'Full Time',
      experience: experience ? experience.trim() : 'Mid-Level',
      salary: salary ? salary.trim() : 'Competitive',
      description: description.trim(),
      requirements: normalizedRequirements,
      deadline: deadline ? deadline.trim() : '',
      active: active !== false
    };

    const savedJob = await updateContent('careers', jobId, updatedJob);
    if (!savedJob) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    res.json({ message: 'Job opening updated successfully', item: savedJob });
  } catch (error) {
    console.error('Error updating job opening:', error);
    res.status(500).json({ error: 'Failed to update job opening' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    let jobs = await getContent('careers', []);

    const exists = jobs.some((job) => Number(job.id) === jobId);
    if (!exists) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    const deleted = await deleteContent('careers', jobId);
    if (!deleted) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    res.json({ message: 'Job opening deleted successfully', id: jobId });
  } catch (error) {
    console.error('Error deleting job opening:', error);
    res.status(500).json({ error: 'Failed to delete job opening' });
  }
});

router.post('/apply', cvUpload.single('cv'), async (req, res) => {
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
    const jobId = body.jobId;

    if (!fullName || !email || !applyingFor || !message) {
      return res.status(400).json({ error: 'Please provide your full name, email, role, and a message.' });
    }

    if (jobId) {
      const jobs = await getContent('careers', []);
      const job = jobs.find((item) => Number(item.id) === Number(jobId));
      if (job && isDeadlinePassed(job.deadline)) {
        return res.status(400).json({ error: 'The application deadline for this role has passed.' });
      }
    }

    const transporter = createMailTransporter();
    if (!transporter) {
      console.error('SMTP configuration missing. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env');
      return res.status(500).json({ error: 'Mail service is not configured yet.' });
    }

    const savedFiles = req.file ? saveUploadedFiles([req.file], UPLOADS_DIR, getPublicBaseUrl(req, 'http://localhost:4000')) : [];
    const attachments = savedFiles.map((file) => ({
      filename: file.filename,
      contentType: file.mimeType,
      path: file.path
    }));

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
        ${savedFiles.length ? `<p><strong>CV:</strong> ${savedFiles[0].filename}</p>` : '<p><strong>CV:</strong> Not attached</p>'}
      `,
      attachments
    });

    res.json({ success: true, message: 'Your application was sent successfully.', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending career application email:', error);
    res.status(500).json({ error: 'Failed to send application email.', detail: error.message });
  }
});

module.exports = router;
