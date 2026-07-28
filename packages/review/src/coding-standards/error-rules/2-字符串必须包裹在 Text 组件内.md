---
ruleId: ERROR-2
title: 字符串必须包裹在 Text 组件内
severity: error
---

## [ERROR-2] 字符串必须包裹在 Text 组件内

字符串必须在 `<Text>` 组件内部渲染。
如果字符串是 `<View>` 的直接子元素，React Native 会崩溃。

### 错误示例

```tsx
import { View } from 'react-native'

function Greeting({ name }: { name: string }) {
  return <View>Hello, {name}!</View>
}
// Error: Text strings must be rendered within a <Text> component.
```

### 正确示例

```tsx
import { View, Text } from 'react-native'

function Greeting({ name }: { name: string }) {
  return (
    <View>
      <Text>Hello, {name}!</Text>
    </View>
  )
}
```