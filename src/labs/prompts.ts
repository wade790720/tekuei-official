import type { LabId } from './index.ts'

export const LAB_PROMPTS: Record<LabId, string> = {
  'living-portrait': `Build an interactive hero section with three stacked layers on one full-screen canvas.

Layers, back to front:
1. A background photo that covers the viewport.
2. A large name set in a serif typeface, centred.
3. The same photo's subject cut out on a transparent background, so the name looks like it stands behind the person.

Hover:
- Use the cut-out's alpha channel as the hit area.
- While the pointer is over the figure, draw tracking boxes around nearby points of its outline. Snap them to an 8px grid and label them with short tags such as TRACK, SCAN, ID 07.
- Fill each box with ASCII characters from the ramp " .:-=+*#%@". Pick the character by the brightness of the photo underneath, and colour it from the same pixel.
- Boxes fade in over 600ms, hold, and fade out over 400ms.

Double-click on the figure:
- Play a short RGB-split glitch.
- Swap to a second photo for two seconds, with small sparks along its outline, then swap back.

Rules:
- Read the images once at a small size (about 420px wide) for hit tests and colour.
- Stop requestAnimationFrame when nothing is moving.
- Cap the content width at 1920px.
- With prefers-reduced-motion, show the still layers only.
- The name must be real HTML text; the canvas is decorative (aria-hidden).

Write it as mountHeroFx({ root, bg, cut, alt, canvas }) that returns a cleanup function, plus a small React component that calls it in useEffect.`,

  'falling-figure': `Build a scroll-driven story page where a figure made of particles falls through stone slabs.

Scene:
- A fixed full-screen canvas behind the page. A dark background (#0B0B0D).
- The figure is a cut-out photo sampled at about 420px wide into particles. Keep pixels with alpha; brighter pixels get brighter particles.
- The page has one section per chapter. Each chapter is a stone slab with a small monospace label and a large serif title carved into it.

Motion:
- Smooth the scroll with Lenis.
- The figure falls as the reader scrolls. When a section's top reaches the figure, it smashes through that slab: the slab breaks into chunks, a cloud of dust rises (shape it with fractal noise into tall clouds), and a short impact sound plays.
- A thin progress dot on the side follows the scroll progress.
- Report the index of the last slab the figure went through, so the page can highlight the current chapter.

Rules:
- Cap devicePixelRatio at 2 and stop drawing when the scene is off screen.
- Add a sound toggle, and never play two impacts within 280ms.
- With prefers-reduced-motion, skip the fall and show the slabs and text as a normal page.
- Chapter text must be real HTML; the canvas is decorative (aria-hidden).

Write it as mountFallScene({ canvas, figure, sections, acts, progressDot, onAct }) that returns { destroy, setSound }, plus a React page that calls it.`,

  'shatter-footer': `Build a site footer where an engraved image assembles from fragments when the footer scrolls into view.

Layout:
- Four columns: brand (spaced-out wordmark, a small subtitle, the copyright), Explore links, Resources links (support, FAQ, privacy policy, sitemap), Contact links.
- Thin dashed rules between the columns on desktop. Two columns by two rows below 900px.
- Under the columns, a full-width canvas showing a strip of a black-and-white engraving (a sea), at a 1280:470 ratio, capped at 1920px wide. Past 1920px, fade its cut edges with a mask-image gradient.
- The lighthouse in the engraving sits at 75% of its width, on the third column rule. When the footer fills one screen and the strip must shrink to fit under the links, keep that point at 75% of the width (offset the strip by 75% of the leftover space) instead of centring it.

Effect (canvas 2D):
- Draw the image crop once into an offscreen canvas. Turn brightness into alpha: pixels whose r+g+b is under 75 become transparent, the rest keep their colour divided by their brightest channel, with alpha = that channel. The image then sits on any dark background.
- Every 2px of the image becomes one 2x2 fragment that flies in from the right with an ease-out cubic, about 0.9s each.
- A reveal edge sweeps left to right over 1.9s and starts each fragment as it passes. Add a little randomness so a few fragments run ahead.
- Group fragments by start time so each frame skips the groups that have not started.
- When all have landed, crossfade to the full image over 0.35s, then stop requestAnimationFrame.
- Start once, when 35% of the canvas is visible (IntersectionObserver). Pause if it leaves the screen mid-animation.
- As it starts, fade the footer text in one item after another, 70ms apart.

Rules:
- Cap devicePixelRatio at 1.5 and rebuild on resize.
- With prefers-reduced-motion, draw the finished image and show the text at once.
- The canvas is decorative (aria-hidden); every link is real HTML.

Write it as mountShatterImage(canvas, { src, crop, onPlay }) that returns a cleanup function, plus a React footer component that calls it in useEffect.`,
}
