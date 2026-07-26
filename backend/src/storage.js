const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const BLOG_FILE = path.join(DATA_DIR, 'blogs.json');

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
const defaultBlogPosts = [
  {
    id: 1,
    category: 'logistics',
    title: 'Transforming the Riyadh Hub',
    excerpt:
      'How Flame Logistics is redefining the Middle Eastern supply chain with AI-driven orchestration.',
    content: `Saudi Arabia is rapidly emerging as a central logistics nexus connecting Asia, Europe, and Africa. At Flame Logistics, we are leading this evolution by integrating smart fleet management, automated cold-storage facilities, and AI-powered predictive dispatching.\n\nOur state-of-the-art hub in Riyadh now handles over 50,000 movements monthly with 99.4% on-time delivery efficiency.`,
    date: '2024-10-14',
    readTime: '6 min read',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCe5SAhTld1qwElXfH5Ymhn2L1IaCyiWpHPsyEji3AOX-5Ne0LVwnhYijNptTLvCZF_2knXkh6Dc_M54zCrKjpEq5liGCA07VoVGxg4Gw_tHf9mXdilUXnwiVwPVdRN9iy9hwtYwrwGWcmBbNO_OfnxyAS5onmKYFkWVXTvRagG6hXOVPFxATXMxxzdnA14-aotzr8F__pTeyj2A9N0Mxlmihle5ISFufWRwmuzGJlddZfNdHVoprKlqDWRulB-jYCohRQiGPQUPt0',
    featured: true
  },
  {
    id: 2,
    category: 'customs',
    title: 'Navigating GCC Customs: 2024 Regulatory Update',
    excerpt:
      'Essential insights for enterprise logistics managers dealing with cross-border trade in the Gulf region.',
    content: `Cross-border trade within the GCC requires meticulous compliance with evolving tariff structures and digital customs clearance protocols. This guide outlines key operational shifts introduced in late 2024, including pre-clearance filings and accelerated green-lane clearance.`,
    date: '2024-10-12',
    readTime: '5 min read',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBncGCyER_Dp9RBYgDIZEZKULQATPSvXVUU_SJ-Ib0MTu3Cxnamlu7BhRnbJS5NvFD9ZthJBpbVdnXnhnSH9981lzxEr1W-kWgxvJ_gglhn62OcyI_BMM-aUrDrjFIrFs0ZQX0mmwyJJZva2MOn7OT2TT5uNubRiSTpaWz7rHR-wQutLX6PFWbOV9FPVZGIxcBfKfyL1InN_0SokRLnk_Lk56Sd3BYl2lU1KyB6nBixyKaHj5CDwCcjthYOkDPmM37cK50eCy4YYX8',
    featured: false
  },
  {
    id: 3,
    category: 'warehousing',
    title: 'The Future of Cold Storage in Arid Climates',
    excerpt:
      'How solar-assisted cooling is revolutionizing the storage of pharmaceuticals across Saudi Arabia.',
    content: `Maintaining thermal stability in extreme ambient temperatures requires pioneering engineering. Flame Logistics has deployed solar-assisted thermal backup systems across high-density storage complexes in Dammam and Riyadh.`,
    date: '2024-10-08',
    readTime: '8 min read',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCR2mqoKLg6otjlJLLICqOEVj5cjT4hjaGyB7d_fZi8ry8oU6RDsj6aQ53c2boypzyVakLv3xgtWP2EeZiX1jyRRePdTuzXoqK2txW-AP-yNnXYQdBV4U4YBKr3yu0c4LJQPL4Ej5LOkYC5dAovL-pPoi2TemAggyGWmopRD44YpWWsiajUAfnU7J2MNayd2zg3yS5lahfOga2NDP_DPzvYxTn4tVliHFhHOWtAADg9h1D-aDhpGsBWZuvSuCTE4rhJk5YgPz-rmXg',
    featured: false
  },
  {
    id: 4,
    category: 'global network',
    title: 'Expanding the Silk Road: Flame New Gateway',
    excerpt:
      'Strengthening the bond between East Asian manufacturing hubs and Saudi consumer markets through direct freight routes.',
    content: `Direct ocean-to-land corridors reduce turnaround time by up to 4 days. Discover how our new multimodal agreements enhance throughput between Far East manufacturing ecosystems and GCC industrial parks.`,
    date: '2024-10-05',
    readTime: '4 min read',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCulLaUK6U_lNg1V91KqkVZ4UYlnpJplh3hpL95KTllBJxJofycTNX9c4sryercYw9S86sSnXpT7keMZtEEUHX8WYdQ3qYOscEG6l0wAe8Hig-pO2pzCls9RjzsiTni4i-GfdJ2byNeKr7EUQK9nkFbN1ti2MNcZhlj2jZViZJPfRHkcz1WH1knfhb3CRyykbcxoY4vMMeRSMLmLE6rXcPHwHvaOCNEIyvixoTrho-GyfaIFuLvg8CMK8HxtJpZMQYcv4x20llWPgM',
    featured: false
  },
  {
    id: 5,
    category: 'transportation',
    title: 'The Shift to Green Fleets in the GCC Region',
    excerpt:
      'Evaluating the feasibility and benefits of electric vehicle adoption for heavy-duty logistics in desert climates.',
    content: `Sustainability meets heavy logistics. We evaluate performance data from our preliminary EV heavy-haul pilot tests across desert highway corridors.`,
    date: '2024-09-20',
    readTime: '7 min read',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDskU2Hdzjv8zGCVUvoZ1w4Nn-gVxSOM07yN7IQTWsCfbLDnl8zAwYHx8CWLyjU_eMTZh2DPxj3MjBe8s4cK1OM1Qmg7HhyBqWBZ21w8TTEdzimakFZevvMVPUjKmTgI4_zT3pKdHdxeRYJ3CvwyXxddrin9CGXKSf-iCZ7wM6Rwn1oA9M_nl0yKAFeEK5IiMCd4GfwKyl5Em3g4pWttKaocJMJ668dRX_MqSxaG--AC7lx_qUed_kJ',
    featured: false
  }
];

function initDataStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(GALLERY_FILE)) {
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(defaultGalleryItems, null, 2));
  }

  if (!fs.existsSync(BLOG_FILE)) {
    fs.writeFileSync(BLOG_FILE, JSON.stringify(defaultBlogPosts, null, 2));
  }
}

function getGallery() {
  initDataStorage();
  try {
    const raw = fs.readFileSync(GALLERY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading gallery file:', err);
    return defaultGalleryItems;
  }
}

function saveGallery(items) {
  initDataStorage();
  fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2));
}

function getBlogs() {
  initDataStorage();
  try {
    const raw = fs.readFileSync(BLOG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading blogs file:', err);
    return defaultBlogPosts;
  }
}

function saveBlogs(posts) {
  initDataStorage();
  fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2));
}

module.exports = {
  getGallery,
  saveGallery,
  getBlogs,
  saveBlogs
};
