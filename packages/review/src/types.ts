/**
 * Claude MR 代码审查脚本 — 类型定义
 */

export type ViolationSeverity = 'error' | 'warning';

export interface Violation {
  path: string;
  line: number;
  rule: string;
  severity: ViolationSeverity;
  body: string;
}

export interface ReviewResult {
  violations: Violation[];
}
