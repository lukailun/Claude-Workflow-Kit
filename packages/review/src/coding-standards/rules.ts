import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { ViolationSeverity } from '../types';

interface RuleMetadata {
  ruleId: string;
  title: string;
  severity: ViolationSeverity;
  path: string;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const frontmatter: Record<string, string> = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    frontmatter[key] = value;
  }
  return frontmatter;
}

function loadRulesFromDir(dirPath: string): RuleMetadata[] {
  const rules: RuleMetadata[] = [];
  if (!existsSync(dirPath)) return rules;
  const files = readdirSync(dirPath).filter(
    (file) => file.endsWith('.md') && !file.startsWith('0-')
  );
  for (const file of files) {
    const filePath = join(dirPath, file);
    const content = readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    if (frontmatter.ruleId && frontmatter.title && frontmatter.severity) {
      rules.push({
        ruleId: frontmatter.ruleId,
        title: frontmatter.title,
        severity: frontmatter.severity as 'error' | 'warning',
        path: filePath,
      });
    }
  }
  rules.sort((a, b) => a.ruleId.localeCompare(b.ruleId));
  return rules;
}

const baseDir = resolve(__dirname);

const errorRules = loadRulesFromDir(join(baseDir, 'error-rules'));
const warningRules = loadRulesFromDir(join(baseDir, 'warning-rules'));

export const codingRules = {
  error: errorRules,
  warning: warningRules,
} as const;

export type CodingRule = (typeof codingRules)[keyof typeof codingRules][number];
