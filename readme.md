# Diraflow — Premium Training Data for AI Agents & LLMs

## Website Structure

```
DiraFlow/
├── index.html          # Main landing page
├── blog/
│   └── index.html      # Blog listing page
├── careers/
│   └── index.html      # Careers page
├── assets/
│   ├── logo.jpg        # Brand logo (used with transparent mix-blend treatment)
│   ├── styles.css      # Full stylesheet — light/dark mode, animations, layout
│   └── main.js         # JS: animations, scroll reveals, dark mode toggle, counters
└── readme.md           # This file
```

## Changelog (Latest Update)

### Visual Updates
- **Removed** "Trusted by leading AI research teams" eyebrow from hero section
- **Replaced** "Partners & clients" logo row with immersive blurred video mosaic showcasing what Diraflow does
- **Logo** now rendered with transparent background using CSS `mix-blend-mode` (multiply in light mode, screen in dark mode) — no white or colored background box
- **Replaced** lifestyle image (researcher figure) with high-tech AI circuit board / computer imagery
- **Replaced** process section person image with LiDAR / autonomous vehicle sensor technology imagery
- **Added** full-width video mosaic section with 4 looping blurred AI videos, each labeled with a service category

### Video Mosaic Section
The new "What We Do" video showcase features:
- Agentic AI Environments
- LiDAR & Perception Data
- Safety & Red-Teaming
- RLHF & Human Feedback

Each video cell blurs on idle and sharpens on hover for an interactive, cinematic feel.

## Tech Stack
- Pure HTML5 / CSS3 / Vanilla JS — no build tools required
- Google Fonts: Sora + DM Serif Display + DM Mono
- Unsplash for stock images (loaded remotely)
- Pexels for background videos (loaded remotely)
- CSS custom properties for full light/dark theme support
- IntersectionObserver for scroll-triggered animations
- localStorage for theme persistence across sessions

## Deployment
Drop the folder on any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).
No build step needed — open `index.html` directly or serve with any HTTP server.

```bash
# Quick local preview
npx serve .
# or
python3 -m http.server 8080
```

## Color Tokens

| Token        | Light Mode   | Dark Mode    |
|--------------|-------------|--------------|
| `--bg`       | `#f7f6f2`   | `#0e0e0c`    |
| `--fg`       | `#0f0f0d`   | `#f0ede6`    |
| `--gold`     | `#c8a96e`   | `#d4b07a`    |
| `--border`   | `#dedad2`   | `#2a2a26`    |
| `--card`     | `#ffffff`   | `#161614`    |

## Contact
Email: diraflowai@gmail.com  
Website: https://diraflow.ai

---
© 2026 Diraflow AI. All rights reserved.
