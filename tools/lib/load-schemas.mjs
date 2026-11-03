// Loads src/scenes/schemas.ts and src/core/job-schema.ts into Node, so tools use the same schemas as Studio.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildSync} from 'esbuild';
import {root} from './scaffold.mjs';

export const loadSchemas = async () => {
  const outfile = path.join(root, 'out', '.cache', 'job-schema.mjs');
  fs.mkdirSync(path.dirname(outfile), {recursive: true});
  buildSync({entryPoints: [path.join(root, 'src', 'core', 'job-schema.ts')], bundle: true, platform: 'node', format: 'esm', packages: 'external', outfile, logLevel: 'error'});
  return import(`${pathToFileURL(outfile).href}?t=${fs.statSync(outfile).mtimeMs}`);
};
