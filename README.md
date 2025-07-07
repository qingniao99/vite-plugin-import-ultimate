## vite-plugin-ultimate-import

[![npm version](https://img.shields.io/npm/v/vite-plugin-ultimate-import)](https://www.npmjs.com/package/vite-plugin-ultimate-import)

按需导入插件 (带缓存优化)，风格极度类似babel-plugin-import

## 安装

```bash
npm install vite-plugin-ultimate-import -D
```

## options

```js
/**
 * 终极版按需导入插件 (带缓存优化)
 * @param {Object} options
 * @param {string} options.libraryName - 库名 (如 'antd')
 * @param {string} options.libraryDirectory - 组件目录 (如 'es' 或 'lib')
 * @param {boolean|string} [options.style] - 样式配置: true | 'css' | false
 * @param {boolean} [options.camel2DashComponentName=true] - 是否转换组件名大小写
 * @param {Function} [options.customName] - 自定义路径生成函数
 * @param {boolean} [options.debug] - 启用调试日志
 * @param {number} [options.cacheTTL=3600] - 缓存存活时间(秒)
 */
```

## 使用示例

```js
// vite.config.js
import ultimateImport from 'vite-plugin-ultimate-import'

export default {
  plugins: [
    ultimateImport({
      libraryName: 'antd',
      libraryDirectory: 'es',
      camel2DashComponentName: false,
      customName: (name, formattedName) => {
        return `antd/es/${formattedName}`
      },
      debug: true,
      cacheTTL: 3600
    })
  ]
}
```

