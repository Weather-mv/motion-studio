# Requirements

## Tools

| Tool | Why | Check |
|---|---|---|
| Node.js 20+ and npm | Runs Remotion and the tools | `node --version` |
| ffmpeg and ffprobe | Mux, resize, loudness, frame grabs | `ffmpeg -version` |
| Python 3.10+ | Audio timing (`tools/align.py`) | `.venv/Scripts/python.exe --version` |
| Git | Lets you undo any AI edit | `git --version` |
| Chrome or Chromium | Remotion downloads its own on first run | `npx remotion browser ensure` |
| Claude Code (paid plan) | Does the planning and building | `claude --version` |
| 16 GB RAM, 4+ CPU cores | 8 GB works but renders are slow. No GPU needed | |
| Blender (optional) | 3D assets to import | |

On Windows, with winget:

```
winget install OpenJS.NodeJS.LTS
winget install Gyan.FFmpeg
winget install Python.Python.3.14
winget install Git.Git
winget install BlenderFoundation.Blender
```

## Install this repo

```
npm install
python -m venv .venv
.venv/Scripts/python.exe -m pip install faster-whisper numpy
```

`tools/align.py` downloads the Whisper `small` model on its first run. It runs on the CPU and decodes audio through ffmpeg.

## npm packages

All `@remotion/*` packages and `remotion` must be the same version, currently 4.0.539. `package.json` pins them. To upgrade, use `npx remotion upgrade`.

### Core

| Package | Use |
|---|---|
| `remotion`, `@remotion/cli` | The renderer and Studio |
| `three`, `@react-three/fiber`, `@react-three/drei`, `@remotion/three` | 3D scenes |
| `gsap` | UI timing and easing |
| `@remotion/transitions` | Fades and slides between scenes |
| `@remotion/captions` | Word-timed captions |
| `@remotion/layout-utils` | Measures text to catch overflow |
| `@remotion/paths`, `@remotion/shapes` | Drawn lines, routes and icons |
| `@remotion/media-utils` | Audio data for sync |
| `@remotion/fonts` | Loads local font files |
| `zod`, `@remotion/zod-types` | Editable fields in Studio's sidebar |

```
npm install --save-exact remotion@4.0.539 @remotion/cli@4.0.539 @remotion/three@4.0.539 @remotion/transitions@4.0.539 @remotion/captions@4.0.539 @remotion/layout-utils@4.0.539 @remotion/paths@4.0.539 @remotion/shapes@4.0.539 @remotion/media-utils@4.0.539 @remotion/fonts@4.0.539 @remotion/zod-types@4.0.539
npm install three @react-three/fiber @react-three/drei gsap
npm install --save-exact zod@4.5.4
```

`@remotion/zod-types` needs the zod version Remotion uses. Check with `npm ls zod` after upgrading.

### Recommended extras

| Package | Use | Status here |
|---|---|---|
| `culori` | Colour contrast checks | Used by the audit |
| `sharp` | Image resizing and cropping | Used by the audit |
| `d3-scale`, `d3-shape` | Chart scenes | Used by `chart` |
| `@remotion/motion-blur` | Smoother fast moves | Installed, not used yet |
| `@remotion/noise` | Organic movement and textures | Installed, not used yet |
| `@remotion/lottie`, `lottie-web` | After Effects animations exported as Lottie | Installed, not used yet |
| `@remotion/rive` | Rive animations | Installed, not used yet |
| `playwright` | Capturing real product screens | Installed. Uses your Chrome with `channel: 'chrome'`, or run `npx playwright install chromium` for its own |

```
npm install --save-exact @remotion/motion-blur@4.0.539 @remotion/noise@4.0.539 @remotion/lottie@4.0.539 @remotion/rive@4.0.539
npm install lottie-web d3-scale d3-shape culori sharp playwright
npm install -D @types/d3-scale @types/d3-shape @types/culori
```

### Used by the tools

| Package | Use |
|---|---|
| `@remotion/renderer`, `@remotion/bundler` | Browser gates in `tools/audit.mjs` |
| `esbuild` | Loads the TypeScript schemas into the Node tools. Keep it at the version `@remotion/bundler` uses |

```
npm install --save-exact @remotion/renderer@4.0.539 @remotion/bundler@4.0.539
npm install -D --save-exact esbuild@0.28.1
```
