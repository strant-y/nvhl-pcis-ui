import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 获取当前工作目录
  const root = process.cwd()
  // 获取环境变量
  const env = loadEnv(mode, root)
  // 端口
  const port = Number(env.port || env.npm_config_port || 8081)

    const getProxyTarget = () => {
    switch (mode) {
      case 'development':
        return 'http://10.12.118.37:8081/' // DEV环境
      case 'uat':
        return 'http://10.12.18.114:9000/' // UAT环境
      case 'pre':
        return 'http://10.12.18.114:9000/' // 预发布
      case 'pre':
        return 'http://10.12.18.114:9000/' // 预发布
      case 'pre':
        return 'http://10.12.18.114:9000/' // 预发布
      default:
        return 'http://10.12.118.37:8081/' // 默认DEV
    }
  }

  return {
    // 项目根目录
    root,
    // 项目部署的基础路径
    base: mode === 'production' ? '/' : '/',
    // 需要处理的静态资源位置
    assetsInclude: fileURLToPath(new URL('./src/assets', import.meta.url)),
    plugins: [
      vue(),
      vueDevTools(),
    ],
    server: {
      host: true,
      port: port,
      // 启动后是否自动打开浏览器
      open: false,
      cors: true,
      proxy: {
        [env.VITE_APP_API_BASEURL]: {
          target: getProxyTarget(),
          // 改变 Host Header
          changeOrigin: true,
          // rewrite: (path) => path.replace(new RegExp(`^${env.VITE_APP_API_BASEURL}`), ''),
        },
      },
    },
    esbuild: {
      tsconfigRaw: '{}',
    },
    // 配置别名
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
     css: {
    postcss: '', // 确保路径正确指向你的postcss配置文件
  },
  }
})
