# UserPromptSubmit Hook

用于增强提示词功能，支持命令快捷方式、Linear 集成和多方案生成。

## 配置步骤

### 1. 安装依赖

在项目的 .claude 目录中安装依赖：

```bash
cd .claude
bun install
```

### 2. 配置环境变量

如果你需要使用 Linear 集成功能，请配置环境变量：

1. 将 `.claude/.env.template` 复制为 `.claude/.env`
2. 编辑 `.claude/.env` 文件，填入你的 Linear API Key：

   ```
   LINEAR_API_KEY=your_linear_api_key_here
   ```

   > [获取 Linear Personal API Keys](https://linear.app/developers/graphql#personal-api-keys)

### 3. 配置 Claude Code Settings

确保项目中的 `.claude/settings.json` 文件包含以下 hooks 配置：

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "bun run .claude/hooks/UserPromptSubmit.ts"
      }]
    }]
  }
}
```

> **提示**: 如果你的 `settings.json` 中已有其他配置，请将 `hooks` 部分合并到现有配置中。

### 4. 开始使用

配置完成后，该 hook 会在你使用 Claude Code 提交提示词时自动运行。

## 功能特性

### 1. Linear 集成

快速引用 Linear issue 数据，自动获取完整的 issue 信息。

> **注意**: 此功能只在配置了 `LINEAR_API_KEY` 环境变量时启用。如果没有配置，Linear 引用将保持原样，不会进行处理。

**使用方法**:

支持两种格式：

* 完整格式：`linear(4t-1111)`
* 简写格式：`4t(1111)`

**示例**:

```
修复 linear(4t-1111) 中描述的 bug
```

```
优化 4t(1111) 的性能问题
```

会自动将 `linear(4t-1111)` 和 `4t(1111)` 替换为对应 issue 的完整 JSON 数据，包括标题、描述、状态等信息。

> **提示**: 需要在 `.claude/.env` 中设置 `LINEAR_API_KEY`。

### 2. 多方案生成

生成多个不同的解决方案，用于探索不同的实现思路。

**使用方法**: `任务描述 v(数量)`

**示例**:
```
实现用户认证 v(3)
```

会生成 3 个不同的用户认证实现方案。

## 组合使用

以上功能可以组合使用：

**示例**:

```
@src/UI/pages/Settings.tsx 4t(7781) :debug
```

这个命令会：
1. 读取 `@src/UI/pages/Settings.tsx` 文件
2. 获取 Linear issue `4t-7781` 的详细信息
3. 使用调试分析的提示词模板

**处理顺序**:

1. **Linear 引用处理** - 替换 `linear(issueId)` 或 `4t(1111)` 为实际数据
2. **多方案处理** - 处理 `v(n)` 生成多个方案

## 技术实现

UserPromptSubmit hook 的实现包含以下处理器：

- **linearProcessor.ts** - 处理 Linear issue 引用
- **variantProcessor.ts** - 处理多方案生成

所有处理器按顺序执行，将用户输入的提示词转换为最终提交给 Claude 的内容。
