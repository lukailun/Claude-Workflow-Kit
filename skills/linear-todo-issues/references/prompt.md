# Linear Issues Skill

从 Linear 获取指定用户的 issues 并生成摘要文件。

## 执行步骤

### 1. 生成时间戳
使用 timestamp skill 生成时间戳：
```bash
bun run .claude/skills/timestamp/scripts/timestamp.ts
```

### 2. 获取用户列表
运行 get-linear-user.ts 脚本获取所有用户（仅获取列表，不选择）：
```bash
bun run .claude/skills/linear-todo-issues/scripts/get-linear-user.ts
```

注意：这个命令会因为没有输入而失败，但会在错误输出中显示用户列表。从错误输出中提取用户列表。

### 3. 使用 AskUserQuestion 让用户选择
根据获取到的用户列表，使用 AskUserQuestion 工具让用户选择要查询的用户。

选项应该包括：
- 用户自己（如果能识别）
- 所有团队成员
- 特定用户

### 4. 获取选中用户的 issues
使用用户选择的编号运行 linear-todo-issues.ts：
```bash
bun run .claude/skills/linear-todo-issues/scripts/linear-todo-issues.ts <timestamp> <user_number>
```

### 5. 报告结果
告知用户摘要文件已生成，并提供文件路径。

## 重要提示

1. 不要使用命令行交互式输入，始终使用 AskUserQuestion
2. 从 get-linear-user.ts 的错误输出中提取用户列表
3. 用户编号从 1 开始（不是从 0 开始）
