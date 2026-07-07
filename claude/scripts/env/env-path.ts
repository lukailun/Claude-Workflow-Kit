import { config } from 'dotenv';
import { isCI } from '@/env/is-ci';

const envPath = isCI ? 'CI/CD Settings > Variables' : '.claude/.env';

if (!isCI) {
  config({ path: envPath });
}

export { envPath };
