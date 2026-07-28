/**
 * 调试用 fetch 包装器
 * 打印 curl 格式的请求信息，方便调试
 */
const IS_DEBUGGING = false;
const originalFetch = fetch;

async function debugFetchImpl(input: RequestInfo | URL, init?: RequestInit) {
  if (!IS_DEBUGGING) {
    return originalFetch(input, init);
  }
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  const headerEntries: [string, string][] =
    init?.headers instanceof Headers
      ? Array.from(init.headers.entries())
      : Array.isArray(init?.headers)
        ? init.headers
        : Object.entries(init?.headers ?? {});

  const parts: string[] = [`curl -X ${init?.method} '${url}'`];
  for (const [k, v] of headerEntries) {
    parts.push(`  -H '${k}: ${v}'`);
  }
  if (init?.body) {
    const bodyStr =
      typeof init.body === 'string' ? init.body : JSON.stringify(init.body);
    parts.push(`  -d '${bodyStr}'`);
  }

  console.log('🌐 [HTTP REQUEST — curl]');
  console.log(parts.join(' \\\n'));

  return originalFetch(input, init);
}

export const debugFetch: typeof fetch = Object.assign(
  debugFetchImpl,
  originalFetch
);
