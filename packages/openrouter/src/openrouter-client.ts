/**
 * OpenRouter SDK 共享客户端（单例）
 *
 * 使用环境变量 OPENROUTER_API_KEY 进行认证。
 * 如果未设置 API Key，客户端仍可访问公开端点。
 */

import { OpenRouter } from '@openrouter/sdk';
import { getOpenRouterFromEnv } from '@cwkit/shared/env/get-openrouter-from-env';

let _client: OpenRouter | null = null;

export function getOpenRouterClient(): OpenRouter {
  if (!_client) {
    const { baseUrl, apiKey } = getOpenRouterFromEnv();
    _client = new OpenRouter({ serverURL: baseUrl, apiKey });
  }
  return _client;
}
