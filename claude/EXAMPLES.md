# 使用示例

## 场景 1：开始新功能开发

```bash
# 1. 创建 feature 分支
bun run .claude/scripts/workflow/create-feature.ts user-authentication

# 2. 开发功能...
# 编辑代码文件

# 3. 提交并推送
bun run .claude/scripts/workflow/commit-and-push.ts

# 4. 创建 MR
bun run .claude/scripts/workflow/create-merge-request.ts
```

## 场景 2：版本发布

```bash
# 1. 创建 release 分支
bun run .claude/scripts/workflow/create-release.ts
# 输入版本号：1.2.0

# 2. 在 release 分支上进行最后调整...

# 3. 发布到 main
bun run .claude/scripts/workflow/publish-release.ts
```

## 场景 3：紧急修复

```bash
# 1. 创建 hotfix 分支
bun run .claude/scripts/workflow/create-hotfix.ts
# 输入版本号：1.2.1

# 2. 修复 bug...

# 3. 提交并推送
bun run .claude/scripts/workflow/commit-and-push.ts

# 4. 发布到 main
bun run .claude/scripts/workflow/publish-hotfix.ts
```

## 场景 4：实验性功能

```bash
# 1. 创建 experimental 分支
bun run .claude/scripts/workflow/create-experimental.ts new-ui-framework

# 2. 尝试新功能...

# 3. 如果成功，可以合并到 main 或创建正式的 feature 分支
```

## 场景 5：完整提交流程

```bash
# 一键完成：add → commit → push → create MR
bun run .claude/scripts/workflow/submit.ts
```

## 常见问题

### Q: 如何取消操作？
A: 在任何确认提示时输入 `n` 即可取消。

### Q: 如何指定 GitLab 项目？
A: 在 `.claude/.env` 中配置 `GITLAB_HOST` 和 `GITLAB_TOKEN`，脚本会自动检测当前 Git 仓库对应的 GitLab 项目。

### Q: 如何使用自定义 commit message？
A: 在 `commit-and-push.ts` 的提示中直接输入自定义 message，而不是按 `y` 确认。

### Q: 分支名称有什么限制？
A: 分支名称应该简洁明了，使用小写字母和连字符，避免使用特殊字符。
