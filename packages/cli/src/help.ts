/**
 * CLI 帮助文本
 */

export function printHelp(): void {
  const lines = [
    'Claude Workflow Kit — AI 驱动的 Git 工作流工具箱',
    '',
    '用法:',
    '  cwkit <command> [options]',
    '',
    '命令:',
    '  feature [branch-name]       创建 feature 分支（从 Linear 选择或指定名称）',
    '  experimental [branch-name]  创建 experimental 分支',
    '  hotfix                      创建 hotfix 分支（基于 main，交互式版本号）',
    '  release                     创建 release 分支（基于 main，交互式版本号）',
    '  commit [--ai <provider>]    暂存、AI 生成提交信息、推送',
    '  mr [--ai <provider>]        创建/更新合并请求',
    '       [--receipt] [--auto-merge]',
    '  submit [--ai <provider>]    一键流程：commit → push → MR',
    '       [--receipt] [--auto-merge]',
    '  publish-release             发布 release 分支（MR → tag → 删除分支）',
    '  publish-hotfix              发布 hotfix 分支（MR → tag → 同步 release）',
    '  receipt [branch] [index]    生成分支 AI 用量收据',
    '  yolo                        从分支名解析 Linear 工单并复制 prompt',
    '  config list                 查看环境变量配置状态',
    '  config init                 初始化环境变量模板文件',
    '  help                        显示此帮助信息',
    '',
    '选项:',
    '  --ai <provider>             指定 AI 服务（如 claude, deepseek, gemini 等）',
    '  --receipt                   创建 MR 时附加分支用量收据',
    '  --auto-merge                创建 MR 时开启 pipeline 通过后自动合并',
    '  -h, --help                  显示帮助信息',
    '',
    '环境变量:',
    '  用户级 ~/.cwkit/.env         个人凭据（API keys、tokens），跨项目共享',
    '  项目级 .claude/.env          项目配置（base URLs、project IDs）',
    '  优先级: Shell export > 项目级 > 用户级',
    '',
    '示例:',
    '  cwkit feature               # 从 Linear issues 中选择创建 feature 分支',
    '  cwkit feat 4t-9192          # 指定分支名创建 feature 分支',
    '  cwkit commit --ai claude    # 使用 Claude 生成提交信息',
    '  cwkit submit --auto-merge   # 一键提交并创建自动合并 MR',
    '  cwkit receipt               # 查看当前分支的 AI 用量收据',
    '  cwkit config list           # 查看环境变量配置状态',
    '',
  ];

  console.log(lines.join('\n'));
}
