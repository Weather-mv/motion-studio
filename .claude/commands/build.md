Job: $ARGUMENTS
Only run after I have said "approved". Build exactly what plan.json says.
1. Implement any new or changed scenes. Add props to src/scenes/schemas.ts with a description on each, create the scene in src/scenes/, register it in registry.ts, add a beat to jobs/gallery/plan.json, and run `npm run docs:scenes`. Use brand tokens via useTheme, motion via useMotion, layout via useStage. GSAP only via useGsapTimeline, Three.js only via ThreeCanvas driven by useCurrentFrame. No Date.now, no requestAnimationFrame, no colour literals. Scenes must work on 16:9, 9:16 and 1:1.
2. Run `npm run sync && npm run typecheck && npm run check -- $ARGUMENTS --static`.
3. Build the two riskiest beats first. Render stills with `npm run render -- $ARGUMENTS --still=<frame>` and show me before building the rest. If stills cannot render in this environment, say so.
4. Commit to git after each scene.
5. Do not do a full render until I confirm.
