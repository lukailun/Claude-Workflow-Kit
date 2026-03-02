import { LinearClient } from '@linear/sdk';

const apiKey = process.env.LINEAR_API_KEY;

if (!apiKey) {
  console.error(
    JSON.stringify({ error: 'LINEAR_API_KEY is not set in environment' })
  );
  process.exit(1);
}

export const linearClient = new LinearClient({ apiKey });
