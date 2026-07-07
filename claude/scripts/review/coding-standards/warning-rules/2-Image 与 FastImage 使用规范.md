---
ruleId: WARNING-2
title: Image 与 FastImage 使用规范
severity: warning
---

## [WARNING-2] Image 与 FastImage 使用规范

本地静态资源使用 `Image`（来自 `react-native`），网络图片使用 `FastImage`（来自 `@d11/react-native-fast-image`）。

### 错误示例

```tsx
// 网络图片使用 Image
import { Image } from 'react-native';

<Image source={{ uri: 'https://example.com/avatar.png' }} />
```

```tsx
// 本地图片使用 FastImage
import FastImage from '@d11/react-native-fast-image';

<FastImage source={require('@/Assets/logo.png')} />
```

### 正确示例

```tsx
// 本地图片使用 Image
import { Image } from 'react-native';

<Image source={require('@/Assets/no_data.png')} />
```

```tsx
// 网络图片使用 FastImage
import FastImage from '@d11/react-native-fast-image';

<FastImage
  source={{ uri: item.cloud_url }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### resizeMode 规范

使用 `FastImage` 或 `Image` 时，需根据图片用途指定 `resizeMode`。默认值为 `cover`。

- 头像、封面、背景图等需要填满容器的图片：可省略（默认即 `cover`），显式指定时使用 `resizeMode={FastImage.resizeMode.cover}` 或 `resizeMode="cover"`
- 图标、插图、空状态图等需要完整展示的图片：必须显式指定 `resizeMode={FastImage.resizeMode.contain}` 或 `resizeMode="contain"`

#### 错误示例

```tsx
// 头像错误使用 contain
<FastImage
  source={{ uri: user.avatar }}
  style={styles.avatar}
  resizeMode={FastImage.resizeMode.contain}
/>

// 图标缺少 resizeMode（默认使用 cover）
<Image
  source={require('@/Assets/icon_arrow.png')}
  style={styles.icon}
/>
```

#### 正确示例

```tsx
// 头像使用 cover
<FastImage
  source={{ uri: user.avatar }}
  style={styles.avatar}
  resizeMode={FastImage.resizeMode.cover}
/>

// 图标使用 contain
<Image
  source={require('@/Assets/icon_arrow.png')}
  style={styles.icon}
  resizeMode="contain"
/>
```
