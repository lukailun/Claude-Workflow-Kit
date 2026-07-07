import { requireEnv } from '@/env/require-env';

interface FigmaFromEnv {
  baseUrl: string;
  fileId: string;
  pageId: string;
  token: string;
}

let _config: FigmaFromEnv | undefined;

export function getFigmaFromEnv(): FigmaFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('FIGMA_BASE_URL'),
      fileId: requireEnv('FIGMA_FILE_ID'),
      pageId: requireEnv('FIGMA_PAGE_ID'),
      token: requireEnv('FIGMA_TOKEN'),
    };
  }
  return _config;
}
