---
ruleId: WARNING-1
title: 无需显式导入 React
severity: warning
---

## [WARNING-1] 无需显式导入 React

项目使用 `module:@react-native/babel-preset`，已启用新版 JSX Transform（`runtime: 'automatic'`）。
编译器会自动从 `react/jsx-runtime` 导入 JSX 辅助函数，不再需要 `import React from 'react'` 来支持 JSX 语法。

### 不需要导入 React 的情况

仅使用 JSX 语法时，无需任何 React 导入：

```tsx
// 正确 — 编译器自动处理
function Greeting() {
  return <Text>Hello</Text>
}
```

```tsx
// 多余 — 不需要这行
import React from 'react'

function Greeting() {
  return <Text>Hello</Text>
}
```

### 需要导入的情况

使用 React 提供的 API 时，必须导入对应的具名导出：

```tsx
// 正确 — 按需具名导入
import { useState, useEffect } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  useEffect(() => { /* ... */ }, [])
  return <Text>{count}</Text>
}
```

```tsx
// 正确 — 使用 React 命名空间 API
import React from 'react'

const LazyPage = React.lazy(() => import('./Page'))
const MemoComp = React.memo(Component)
const ctx = React.createContext(null)
```

### 需要导入 React 的 API 清单

| API | 导入方式 |
|-----|---------|
| `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `useContext`, `useReducer` 等 Hooks | `import { useState, useEffect } from 'react'` |
| `createContext` | `import { createContext } from 'react'` 或 `React.createContext` |
| `lazy` | `import { lazy } from 'react'` 或 `React.lazy` |
| `memo` | `import { memo } from 'react'` 或 `React.memo` |
| `forwardRef` | `import { forwardRef } from 'react'` 或 `React.forwardRef` |
| `createElement` | `import { createElement } from 'react'` 或 `React.createElement` |
| `Fragment` | `import { Fragment } from 'react'` 或 `<>...</>` |