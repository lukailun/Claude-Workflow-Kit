import { LinearClient } from '@linear/sdk';
import { getLinearFromEnv } from '@cwkit/shared/env/get-linear-from-env';

const linearClient = new LinearClient({
  apiKey: getLinearFromEnv().apiKey,
  headers: {
    'public-file-urls-expire-in': '3600',
  },
});

export { linearClient };
