/**
 * Flame Logistics - Unified Tailwind Configuration
 * Based on home page design system
 * This file should be included in all pages for consistent styling
 */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Colors (Trust Navy)
        "primary": "#09005d",
        "primary-container": "#1e197d",
        "on-primary": "#ffffff",
        "on-primary-container": "#8988eb",
        "primary-fixed": "#e2dfff",
        "primary-fixed-dim": "#c2c1ff",
        "on-primary-fixed": "#0c006a",
        "on-primary-fixed-variant": "#3b3a99",
        
        // Secondary Colors (Flame Red)
        "secondary": "#bc000c",
        "secondary-container": "#e80f16",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#fffbff",
        "secondary-fixed": "#ffdad5",
        "secondary-fixed-dim": "#ffb4aa",
        "on-secondary-fixed": "#410001",
        "on-secondary-fixed-variant": "#930007",
        
        // Tertiary Colors (Industrial Black)
        "tertiary": "#151719",
        "tertiary-container": "#2a2b2e",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#919295",
        "tertiary-fixed": "#e2e2e5",
        "tertiary-fixed-dim": "#c6c6c9",
        "on-tertiary-fixed": "#1a1c1e",
        "on-tertiary-fixed-variant": "#45474a",
        
        // Surface Colors
        "surface": "#fcf8ff",
        "surface-bright": "#fcf8ff",
        "surface-dim": "#dcd8e1",
        "surface-container": "#f0ecf5",
        "surface-container-low": "#f6f2fb",
        "surface-container-high": "#eae7f0",
        "surface-container-highest": "#e4e1ea",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e4e1ea",
        "surface-tint": "#5453b2",
        "surface-muted": "#f0ecf5",
        
        // Background & On-Surface
        "background": "#fcf8ff",
        "on-background": "#1b1b21",
        "on-surface": "#1b1b21",
        "on-surface-variant": "#464552",
        
        // Outline
        "outline": "#777683",
        "outline-variant": "#c7c5d4",
        
        // Error
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        
        // Inverse
        "inverse-surface": "#303036",
        "inverse-on-surface": "#f3eff8",
        "inverse-primary": "#c2c1ff",
        
        // Brand Colors (Aliases for convenience)
        "trust-navy": "#09005d",
        "flame-red": "#bc000c",
        "industrial-black": "#151719",
        "gcc-gold": "#ffdad5",
        "glass-border": "rgba(255, 255, 255, 0.2)"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        "container-max": "1280px",
        "base": "8px",
        "base-unit": "8px",
        "gutter": "24px",
        "section-padding": "96px"
      },
      fontFamily: {
        "label-md": ["Inter", "sans-serif"],
        "title-lg": ["Plus Jakarta Sans", "sans-serif"],
        "display-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "display-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-sm": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"]
      },
      fontSize: {
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "title-lg": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-sm": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-md": ["32px", { lineHeight: "40px", fontWeight: "600" }]
      },
      maxWidth: {
        "container-max": "1280px"
      }
    }
  }
};
