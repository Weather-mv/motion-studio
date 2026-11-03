Job: $ARGUMENTS
Only run after I have said "approved". Build exactly what plan.json says.
1. Implement any new or changed scenes in src/scenes/ (register them in registry.ts and in tools/check-job.mjs SCENES). Use brand tokens via useTheme, GSAP via useGsapTimeline, Three.js via ThreeCanvas driven by useCurrentFrame. No Date.now, no requestAnimationFrame, no hard-coded colours.
2. Run `npm run sync && npm run typecheck && npm run check -- $ARGUMENTS`.
3. Build the two riskiest beats first. Render stills with `npx remotion still src/index.ts $ARGUMENTS jobs/$ARGUMENTS/edit/stills/<beat>.png --frame=<n>` and show me before building the rest. If stills cannot render in this environment, say so.
4. Do not do a full render until I confirm.
