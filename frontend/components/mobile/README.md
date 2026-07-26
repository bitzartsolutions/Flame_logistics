# Flame Logistics - Mobile Atomic Design System

This document describes the Atomic Design methodology implementation for the Flame Logistics mobile website.

## Overview

Atomic Design is a methodology for creating design systems with five distinct levels:

1. **Atoms** - Basic building blocks (buttons, icons, text, inputs)
2. **Molecules** - Groups of atoms functioning together (cards, list items)
3. **Organisms** - Complex UI components (header, footer, sections)
4. **Templates** - Page-level layouts
5. **Pages** - Specific instances of templates with real content

## Directory Structure

```
frontend/
├── components/
│   └── mobile/
│       ├── atoms/
│       │   ├── button-primary.html
│       │   ├── button-secondary.html
│       │   ├── button-link.html
│       │   ├── icon-material.html
│       │   ├── label-badge.html
│       │   ├── heading.html
│       │   ├── text.html
│       │   ├── divider.html
│       │   ├── image.html
│       │   └── input.html
│       ├── molecules/
│       │   ├── stat-card.html
│       │   ├── service-card.html
│       │   ├── sector-card.html
│       │   ├── news-card.html
│       │   ├── testimonial-card.html
│       │   ├── feature-item.html
│       │   ├── accordion-item.html
│       │   ├── social-link.html
│       │   ├── contact-info.html
│       │   ├── partner-logo.html
│       │   └── gallery-image.html
│       ├── organisms/
│       │   ├── header.html
│       │   ├── hero-section.html
│       │   ├── stats-grid.html
│       │   ├── services-carousel.html
│       │   ├── sectors-section.html
│       │   ├── partners-marquee.html
│       │   ├── authority-section.html
│       │   ├── gallery-grid.html
│       │   ├── news-section.html
│       │   └── footer.html
│       └── templates/
│           └── home-template.html
├── assets/
│   ├── css/
│   │   └── mobile/
│   │       └── atomic.css
│   └── js/
│       └── mobile/
│           └── atomic-loader.js
└── pages/
    └── mobile/
        └── home.html (refactored with atomic classes)
```

## Component Naming Convention

### CSS Classes

- **Atoms**: `.atom-{component}` (e.g., `.atom-btn-primary`, `.atom-icon`)
- **Molecules**: `.molecule-{component}` (e.g., `.molecule-stat-card`, `.molecule-news-card`)
- **Organisms**: `.organism-{component}` (e.g., `.organism-header`, `.organism-hero`)

### BEM Modifiers

Components use BEM-style modifiers:
- `.atom-btn-primary` - Base class
- `.atom-btn-primary--disabled` - Modifier
- `.atom-btn-primary__icon` - Element

## Atoms

### Buttons
| Component | File | Description |
|-----------|------|-------------|
| Primary Button | `button-primary.html` | Main CTA with flame-red background |
| Secondary Button | `button-secondary.html` | Glass/transparent background |
| Link Button | `button-link.html` | Text-based with underline |

### Typography
| Component | File | Description |
|-----------|------|-------------|
| Heading | `heading.html` | Display, headline, title variants |
| Text | `text.html` | Body and label text |

### UI Elements
| Component | File | Description |
|-----------|------|-------------|
| Icon | `icon-material.html` | Material Symbols wrapper |
| Badge | `label-badge.html` | Status indicators, tags |
| Divider | `divider.html` | Section separators |
| Image | `image.html` | Responsive image containers |
| Input | `input.html` | Form input fields |

## Molecules

| Component | File | Composed of |
|-----------|------|-------------|
| Stat Card | `stat-card.html` | icon, heading, text |
| Service Card | `service-card.html` | icon, heading, text |
| Sector Card | `sector-card.html` | image, heading, text |
| News Card | `news-card.html` | image, text, heading |
| Testimonial Card | `testimonial-card.html` | icons, text, image, heading |
| Feature Item | `feature-item.html` | icon, text |
| Accordion Item | `accordion-item.html` | heading, icon, text |
| Social Link | `social-link.html` | icon |
| Contact Info | `contact-info.html` | icon, text |
| Partner Logo | `partner-logo.html` | text |
| Gallery Image | `gallery-image.html` | image |

## Organisms

| Component | File | Composed of |
|-----------|------|-------------|
| Header | `header.html` | icon, heading, button |
| Hero Section | `hero-section.html` | image, badge, heading, buttons |
| Stats Grid | `stats-grid.html` | stat-card × 4 |
| Services Carousel | `services-carousel.html` | heading, divider, service-card × 3 |
| Sectors Section | `sectors-section.html` | heading, sector-card × 3 |
| Partners Marquee | `partners-marquee.html` | heading, divider, partner-logo |
| Authority Section | `authority-section.html` | heading, text, feature-item, testimonial-card |
| Gallery Grid | `gallery-grid.html` | heading, gallery-image × 4 |
| News Section | `news-section.html` | heading, button-link, news-card × 2 |
| Footer | `footer.html` | icon, heading, text, social-link, accordion-item, contact-info |

## Usage

### Static Implementation (Current)

The mobile `home.html` page uses atomic class names directly in the HTML for clarity and documentation:

```html
<!-- Organism: Header -->
<header class="organism-header ...">
  <!-- Atom: Icon -->
  <span class="atom-icon material-symbols-outlined">local_fire_department</span>
  <!-- Atom: Heading -->
  <span class="atom-heading font-headline-sm">Flame Logistics</span>
</header>
```

### Dynamic Loading (Optional)

For dynamic component loading, use the `atomic-loader.js`:

```html
<div data-organism="header" id="organism-header"></div>
<script src="/assets/js/mobile/atomic-loader.js"></script>
```

## CSS Architecture

The `atomic.css` file provides:

1. **CSS Variables** - Spacing, border-radius, transitions
2. **Atom Styles** - Base styles for all atoms
3. **Molecule Styles** - Styles for molecule components
4. **Organism Styles** - Layout and positioning for organisms
5. **Utilities** - Helper classes (scrollbar-hide, line-clamp, etc.)

## Benefits

1. **Consistency** - Reusable components ensure visual consistency
2. **Maintainability** - Changes to atoms propagate to all molecules/organisms
3. **Scalability** - Easy to add new pages using existing components
4. **Documentation** - Self-documenting code with clear component hierarchy
5. **Collaboration** - Designers and developers share common vocabulary

## Future Enhancements

- [ ] Add more atom variants (button sizes, icon colors)
- [ ] Create additional molecules for forms
- [ ] Build organisms for other pages (services, contact, about)
- [ ] Implement component library viewer
- [ ] Add Storybook integration for component documentation
