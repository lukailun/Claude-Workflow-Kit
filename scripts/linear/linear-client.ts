import { LinearClient } from '@linear/sdk';
import linearFromEnv from '../env/linear-from-env';

const linearClient = new LinearClient({ apiKey: linearFromEnv.apiKey });

export default linearClient;
