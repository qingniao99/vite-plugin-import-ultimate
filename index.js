import path from 'node:path'
import crypto from 'node:crypto'

export default (options = {}) => {
  const cache = new Map()
  const cacheTTL = options.cacheTTL || 3600 * 1000

  const getFileHash = (code) => {
    return crypto.createHash('sha256').update(code).digest('hex')
  }

  const formatName = (name) => {
    if (options.camel2DashComponentName === false) return name
    return name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')
  }

  const cleanExpiredCache = () => {
    const now = Date.now()
    for (const [key, { timestamp }] of cache.entries()) {
      if (now - timestamp > cacheTTL) cache.delete(key)
    }
  }

  return {
    name: 'vite-plugin-ultimate-import',
    enforce: 'pre',

    handleHotUpdate(ctx) {
      // 删除所有以该文件路径开头的缓存项
      for (const key of cache.keys()) {
        if (key.startsWith(ctx.file + ':')) {
          cache.delete(key)
        }
      }
      if (options.debug) {
        console.log(`[vite-plugin-ultimate-import] Cleared cache for ${ctx.file}`)
      }
    },

    transform(code, id) {
      if (!/\.(js|ts|jsx|tsx|vue)$/.test(id) || 
          id.includes('node_modules')) {
        return null
      }

      if (!code.includes(options.libraryName)) {
        return null
      }

      const fileHash = getFileHash(code)
      const cacheKey = `${id}:${fileHash}`
      const cached = cache.get(cacheKey)

      if (cached) {
        if (options.debug) {
          console.log(`[vite-plugin-ultimate-import] Cache hit for ${id}`)
        }
        return cached.result
      }

      const isSetupScript = id.endsWith('.vue') && code.includes('<script setup>')
      if (isSetupScript && !code.includes('import {')) {
        return null
      }

      let transformed = false
      const result = code.replace(
        new RegExp(`import\\s*{([^}]+)}\\s*from\\s*(['"])${options.libraryName}\\2`, 'g'),
        (match, imports, quote) => {
          transformed = true
          return imports.split(',')
            .map(imp => {
              const [name, alias] = imp.trim().split(/\s+as\s+/)
              const finalName = alias || name
              const formattedName = formatName(name)
              const componentPath = options.customName
                ? options.customName(name, formattedName)
                : path.posix.join(options.libraryName, options.libraryDirectory, formattedName)

              // 样式处理
              let styleImport = ''
              if (options.style === 'css') {
                styleImport = `\nimport '${componentPath}/style/css';`
              } else if (options.style === true ) {
                styleImport = `\nimport '${componentPath}/style';`
              }

              return `import ${finalName} from ${quote}${componentPath}${quote}${styleImport}`
            })
            .join('\n')
        }
      )

      if (transformed) {
        cache.set(cacheKey, {
          result,
          timestamp: Date.now()
        })
        cleanExpiredCache()

        if (options.debug) {
          console.log(`[vite-plugin-ultimate-import] Transformed + Cached ${id}`)
          console.log(`  Cache size: ${cache.size}`)
        }
        return result
      }

      return null
    }
  }
}