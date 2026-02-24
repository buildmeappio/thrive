import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createNextConfig } from '@thrive/eslint-config';

const __dirname = dirname(fileURLToPath(import.meta.url));
export default createNextConfig(__dirname);
