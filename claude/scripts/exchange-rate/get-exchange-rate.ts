/**
 * 汇率查询（USD ↔ CNY）
 *
 * 数据源：open.er-api.com（免费，每日更新）
 */

const API_URL = 'https://open.er-api.com/v6/latest';

let _cachedRate: number | null = null;

/** 获取 USD → CNY 汇率（同一 session 只请求一次） */
async function fetchRate(): Promise<number | null> {
  if (_cachedRate !== null) return _cachedRate;
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    _cachedRate = data?.rates?.CNY ?? null;
    return _cachedRate;
  } catch {
    return null;
  }
}

/** USD → CNY */
export async function usdToCny(usd: number): Promise<number | null> {
  const rate = await fetchRate();
  return rate !== null ? usd * rate : null;
}

/** CNY → USD */
export async function cnyToUsd(cny: number): Promise<number | null> {
  const rate = await fetchRate();
  return rate !== null ? cny / rate : null;
}

/** 获取当前汇率 */
export async function getRate(): Promise<number | null> {
  return fetchRate();
}
