Create a new video job from: "$ARGUMENTS" (format: `<name> [--type=<type>] [--ratio=16x9|9x16|1x1] [--seconds=<n>]`; the older `<name> [ratio] [seconds]` also works).
1. Run `npm run new -- $ARGUMENTS`. Types are the files in templates/types/ (see video-types.md).
2. Tell me exactly which files to fill: jobs/<name>/brief.md, brand.json, script.md, claims.json, assets.json, and which assets to drop in public/jobs/<name>/ (logo, fonts, voiceover, ref.mp4). List what the type says it needs.
3. Do not write a storyboard yet. plan.json holds only the type's skeleton, with OPEN placeholders.
