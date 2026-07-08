# AI 集成

## 支持的 Provider

| Provider | 标识 | 默认模型 |
|----------|------|----------|
| Anthropic Claude | `claude` | `claude-sonnet-4-6` |
| DeepSeek | `deepseek` | — |
| Google Gemini | `gemini` | — |
| 智谱 GLM | `glm` | — |
| 腾讯 HY | `hy` | — |
| LongCat | `longcat` | — |
| 小米 Mimo | `mimo` | `mimo-v2.5` |
| MiniMax | `minimax` | — |
| 阿里通义千问 | `qwen` | — |
| OpenRouter | `openrouter` | — |

默认 Provider 为 `mimo`。

## 使用方式

在支持 `--ai` 参数的命令中指定：

```bash
bun run scripts/workflow/commit-and-push.ts --ai anthropic
bun run scripts/workflow/create-merge-request.ts --ai deepseek
bun run scripts/workflow/submit.ts --ai openrouter
```

## AI 应用场景

### Commit Message 生成

分析 `git diff --cached`，生成符合 Conventional Commits 规范的提交信息：

```bash
bun run scripts/workflow/commit-and-push.ts --ai mimo
```

AI 会输出结构化的 `{ type, subject }`：
- `type`：从 `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore` 中选择
- `subject`：中文描述，最长 72 字符

### Merge Request 生成

分析分支差异和提交历史，生成完整 MR 内容：

```bash
bun run scripts/workflow/create-merge-request.ts --ai anthropic
```

AI 生成的内容包含：
- **标题**：`type: subject` 格式
- **概览**：变更说明
- **变更列表**：具体改动项
- **影响分析**：影响的文件和功能
- **测试说明**：测试建议

### 代码审查

对 MR diff 逐规则运行 AI 审查：

```bash
bun run scripts/review/run.ts --ai mimo
```

详见 [AI 代码审查](code-review.md)。

## 扩展新 Provider

1. 在 `scripts/language-models/` 下创建目录和语言模型文件
2. 在 `scripts/env/` 下添加环境变量读取函数
3. 在 `.env.template` 中添加对应变量
4. 在 `scripts/ai/get-language-model.ts` 中注册 Provider 名称和 switch case
