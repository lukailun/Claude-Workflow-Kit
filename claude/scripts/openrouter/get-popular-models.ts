/**
 * 获取 OpenRouter 平台热门模型排行
 *
 * 基于全平台用户每日 token 使用量，返回 Top N 热门模型。
 * 数据来源：openrouter.ai/rankings
 */

import { OpenRouter } from '@openrouter/sdk'

export interface PopularModel {
  model: string
  totalTokens: number
}

let _cachedPopularModels: PopularModel[] | null = null

/**
 * 获取最近一天的热门模型排行
 *
 * @param count - 需要返回的模型数量，默认为 1
 * @returns 按 token 用量降序排列的热门模型列表
 */
export async function getPopularModels(count?: number): Promise<PopularModel[]> {
  if (_cachedPopularModels) return _cachedPopularModels.slice(0, count ?? 1)

  try {
    const client = new OpenRouter()
    const response = await client.datasets.getRankingsDaily()

    const dates = [...new Set(response.data.map(item => item.date))].sort().reverse()
    const latestDate = dates[0]

    if (!latestDate) return []

    const dailyModels = response.data
      .filter(item => item.date === latestDate && item.modelPermaslug !== 'other')
      .map(item => ({
        model: item.modelPermaslug,
        totalTokens: Number(item.totalTokens),
      }))
      .sort((a, b) => b.totalTokens - a.totalTokens)

    _cachedPopularModels = dailyModels
    return _cachedPopularModels.slice(0, count)
  } catch {
    return []
  }
}
