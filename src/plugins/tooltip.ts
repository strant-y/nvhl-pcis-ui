// plugins/tooltip.ts
import { App } from 'vue'
import { Tooltip } from '@/common/dztooltip/tooltipOptions'

export default {
    install: (app: App) => {
        // 挂载到全局属性
        app.config.globalProperties.$tooltip = Tooltip
    }
}

// 类型声明（修正版）
declare module 'vue' {
    interface ComponentCustomProperties {
        $tooltip: typeof Tooltip
    }
}