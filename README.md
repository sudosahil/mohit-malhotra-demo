# Mohit Malhotra Photography: concept demo

A static, no-build demo site (HTML, CSS and vanilla JS, with GSAP, ScrollTrigger and Lenis loaded from CDNs).

```
npm run dev     # serves the folder at http://127.0.0.1:4173
```

- `index.html`, `portfolio.html`, `story.html?s=<id>`, `services.html`, `about.html`, `contact.html`
- `app.js` holds the content (stories, testimonials) and page behaviour; `motion.js` holds the scroll animation; `styles.css` holds all styling.
- The site is deployed on Vercel. `vercel.json` marks every page `noindex`, because this is a pitch demo.

## Notes

- Photographs in `img/` were taken from Mohit's public WedMeGood profile for demonstration. Many carry the WedMeGood watermark. Replace them with his originals before any real launch.
- The enquiry form and the booked dates on the calendar are demo only; nothing is sent or stored.
- Animations respect `prefers-reduced-motion`; with it on, the site shows static layouts instead.
