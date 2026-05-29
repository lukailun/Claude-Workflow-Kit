export function getUserName(cwd?: string): string {
  const result = Bun.spawnSync(['git', 'config', 'user.name'], { cwd });
  return result.stdout.toString().trim();
}
