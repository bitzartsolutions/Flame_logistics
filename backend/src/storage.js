const fs = require('fs');
const path = require('path');

function getDataDir() {
  const configuredDir = process.env.DATA_DIR || process.env.STORAGE_DIR;
  if (configuredDir) {
    return path.resolve(configuredDir);
  }

  return path.join(__dirname, '..', 'data');
}

function getDataFile(fileName) {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, fileName);
}

const GALLERY_FILE = getDataFile('gallery.json');
const BLOG_FILE = getDataFile('blogs.json');
const JOBS_FILE = getDataFile('jobs.json');

// Initial default gallery items
const defaultGalleryItems = [
  {
    id: 1,
    category: 'transportation',
    title: 'Long-haul Desert Operations',
    subtitle: 'Fleet Excellence',
    description: 'Heavy-duty assets moving mission-critical freight across KSA corridors.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA33tyJqXpSGVg0uncV-Yxjn-nTcAj7MLpFQpcdf2R8C4TFKLNH9mlEn12DXwmPBL4Tj3sr9ci2Myanlwvdj3ipPaR93GS1pUcJTNXO1Dv9iYVT7Y670U9kDqAZDsz61UU_O7EIGoC8-vAu18XRrZ-9MwM_mmfen-NI4szscoGIuUQfqUD_ty1XMozqCOqO1Z2mE2RqdUo_Nu6-rUf0BDeztAwzbVaupAbk_SRw5rh5SjHHw-Zcjd4xVvwvRoH_R-iDMuIePHrvaHU',
    mobileAspect: 'aspect-[4/5]',
    desktopLayout: 'large',
    createdAt: new Date('2024-10-01').toISOString()
  },
  {
    id: 2,
    category: 'warehousing',
    title: 'Cold-Chain Storage Alpha',
    subtitle: 'Warehousing',
    description: 'Temperature-controlled warehousing designed for pharma-grade inventory.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzhJc3FWikdLaIZIcNptAH66g5R2yL_O4-i21uSEDni6ngIqOWjFRYYrxStW_0PHgOJ9AiebJxHqiwN_9BxnuWZYXqWNrLF4t-S7LnfoNcAHmvnMikOdWcScpkALkQhIbgR2ElmtjKzLdS2iuoWkLbLzIQZFiNfhJh8vAURRCxN68ufzPqetkatC_uLhM6lw3V9d8nTS2vVDj3k_-jgyUIVmrs_Cv1P3YpZHSEIwF8AcdqBIs8emyrmIEWEJnRONXHXsOlowNfssg',
    mobileAspect: 'aspect-square',
    desktopLayout: 'tall',
    createdAt: new Date('2024-10-02').toISOString()
  },
  {
    id: 3,
    category: 'projects',
    title: 'Maritime Integration',
    subtitle: 'Global Network',
    description: 'Seamless land-sea handoff operations at GCC gateway ports.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEorESN-xVdaZsxscYpfgfT0UE96vQo4oMpjKtAMmtM2KBn4ryS6IK4n-IjXVcfdDYtTBhq-bAS-04uOz4Nif9sbY6Wb8n1Tq0ZksT8UzV3g3wJJCatQBK19ZYv6t8_T7KO7NQ9y5ICzIIHHbR8_yi4oHfNzSvAm9CxOBQLlSVWyewQ7n7WdaCUSOaJ_Rjkw-UNfsFT81FHD22GAvZclBtyGeb7pWxp8z2ZR7DkguW3nBSwuz5WFBUuK48VCm4wxlmyD55TbwrPtM',
    mobileAspect: 'aspect-video',
    desktopLayout: 'wide',
    createdAt: new Date('2024-10-03').toISOString()
  },
  {
    id: 4,
    category: 'transportation',
    title: '500+ Vehicle Modern Fleet',
    subtitle: 'Fleet Showcase',
    description: 'Scalable line-haul network connecting major industrial zones.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlZq1mWUT3KlQiBw8KJqgZRgJLUj0lWdGCscJ3WluhGqPROiO2QAxI1OawSPPrV1LIX7BKkUkaRknsJd7OxiZODsN1mlmlBVSko-cD6YPIaIRgrF3ImlI4awSqa9oyhthy3w31IZacKyk4AY5gv0e7-rQkRJcAvDi3I8lUrTXqRSks4m_64oHMW5zuYZZFaTHc0kaU9wh8kob15U7N5jT7Roe_JSQZR7ESxQyGCLfpFDh0qQN4m35F',
    mobileAspect: 'aspect-[4/5]',
    desktopLayout: 'large',
    createdAt: new Date('2024-10-04').toISOString()
  },
  {
    id: 5,
    category: 'projects',
    title: 'Global Express Network',
    subtitle: 'Air Freight',
    description: 'Priority uplift services for high-value industrial cargo.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCAnSFPtc-7kA9WEBPhMAJe_zo_qWOlDHKylm6Z0fcJwMeMctoF8GJxPBSOt2R_Y0OYdtYUO7AZr__kj0Qdk_TN4n-VFQp3nzckr7alrJHvel2DytHQ_IeeMvBCEATISGybg8V2HvBJpfvxZU8IcOkcWkZZAVx55D90TqraGR9K5Jue0l4bMPD_SUHbLPW8Sv6Nw_HRYKhgS9k8yNia16rz0fy0tbu0G1MMnTgnWdvMpPhrtqHyu_ia',
    mobileAspect: 'aspect-video',
    desktopLayout: 'wide',
    createdAt: new Date('2024-10-05').toISOString()
  },
  {
    id: 6,
    category: 'pharma',
    title: 'Pharma Integrity Chain',
    subtitle: 'Pharma Chain',
    description: 'Validated cold-chain workflows for medical distribution.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3k1VSbRS9bWNcY7JbEYqbC5IwJPjZPRk97eBlrpyOQ9RICl9Gz2BGbToRLcVZvFglcBjjviVO8Krdzb9WGLpV5wFjAhbPw1uoLyCCE9QQIZyguctigN3RJpkxHvlV1vrzKizIpdnt_6wdR1akjV8Ql4VRvyLhAk1jVV-vGHJ_BopBJMb4FR0e6iQ2O4-ovfhpy9P5j-jx-dKJ_Lf-OO1JqJ1zNoqJVEvupdAOLfVAIDVk2P5Ehgi6QgyMjS51JfDMWdCu6fDjkVo',
    mobileAspect: 'aspect-square',
    desktopLayout: 'default',
    createdAt: new Date('2024-10-06').toISOString()
  }
];

// Initial default blog posts
const defaultBlogPosts = [];

const defaultJobs = [];

function initDataStorage() {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const galleryFile = getDataFile('gallery.json');
  const blogFile = getDataFile('blogs.json');
  const jobsFile = getDataFile('jobs.json');

  if (!fs.existsSync(galleryFile)) {
    fs.writeFileSync(galleryFile, JSON.stringify(defaultGalleryItems, null, 2));
  }

  if (!fs.existsSync(blogFile)) {
    fs.writeFileSync(blogFile, JSON.stringify(defaultBlogPosts, null, 2));
  }

  if (!fs.existsSync(jobsFile)) {
    fs.writeFileSync(jobsFile, JSON.stringify(defaultJobs, null, 2));
  }
}

function getGallery() {
  initDataStorage();
  try {
    const raw = fs.readFileSync(getDataFile('gallery.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading gallery file:', err);
    return defaultGalleryItems;
  }
}

function saveGallery(items) {
  initDataStorage();
  fs.writeFileSync(getDataFile('gallery.json'), JSON.stringify(items, null, 2));
}

function getBlogs() {
  initDataStorage();
  try {
    const raw = fs.readFileSync(getDataFile('blogs.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading blogs file:', err);
    return defaultBlogPosts;
  }
}

function saveBlogs(posts) {
  initDataStorage();
  fs.writeFileSync(getDataFile('blogs.json'), JSON.stringify(posts, null, 2));
}

function getJobs() {
  initDataStorage();
  try {
    const raw = fs.readFileSync(getDataFile('jobs.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading jobs file:', err);
    return defaultJobs;
  }
}

function saveJobs(jobs) {
  initDataStorage();
  fs.writeFileSync(getDataFile('jobs.json'), JSON.stringify(jobs, null, 2));
}

module.exports = {
  getGallery,
  saveGallery,
  getBlogs,
  saveBlogs,
  getJobs,
  saveJobs
};
