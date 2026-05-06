export default function getVersion(): string {
  return Bun.spawnSync(['claude', '--version']).stdout.toString().trim();
}
