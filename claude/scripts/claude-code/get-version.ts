export function getVersion(): string {
  return Bun.spawnSync(['claude', '--version']).stdout.toString().trim();
}
