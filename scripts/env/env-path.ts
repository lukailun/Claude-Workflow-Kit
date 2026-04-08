import { config } from 'dotenv';

const envPath = '.claude/.env';
config({ path: envPath });

export default envPath;
