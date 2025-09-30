interface TooltipOptions {
    content: string // 提示的内容
    placement?: 'top' | 'bottom' | 'left' | 'right' // 提示框位置
    effect?: 'dark' | 'light' // 提示框主题
    duration?: number // 提示持续时间
    showArrow?: boolean // 箭头
    closeOnClick?: boolean // 点击外部关闭
    offset?: number // 提示框相对点击位置的偏移量
}

interface TooltipInstance {
    close: () => void
}

const injectStyles = () => {
    if (document.getElementById('tooltip-final-styles')) return;

    const style = document.createElement('style');
    style.id = 'tooltip-final-styles';
    style.lang = 'scss';
    style.textContent = `
        .global-tooltip-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            pointer-events: none !important;
            z-index: 99999 !important;
            overflow: visible !important;
        }

        .global-tooltip {
            position: absolute !important;
            padding: 10px 12px !important; /* 略微增大提示框，与大箭头协调 */
            border-radius: 4px !important;
            max-width: 300px !important;
            box-sizing: border-box !important;
            pointer-events: auto !important;
            opacity: 0;
            animation: tooltipShow 0.2s ease-out forwards !important;
            font-size: 12px !important;
            font-family: var(--font-family) !important;
        }

        @keyframes tooltipShow {
            to { opacity: 1; }
        }

        .global-tooltip.theme-dark {
            background-color: #494c4c; !important;
            color: white !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }

        .global-tooltip.theme-light {
            background-color: white !important;
            color: #333 !important;
            border: 1px solid #ddd !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }

        /* 箭头容器 */
        .tooltip-arrow-container {
            position: absolute !important;
            width: 24px !important; /* 从16px放大到24px */
            height: 24px !important; /* 从16px放大到24px */
            overflow: visible !important;
            z-index: 10000 !important;
        }

        /* 纯色箭头（放大尺寸） */
        .tooltip-arrow {
            position: absolute !important;
            width: 12px !important; /* 从8px放大到12px */
            height: 12px !important; /* 从8px放大到12px */
            transform-origin: center !important;
        }
    `;
    document.head.appendChild(style);
};

class TooltipManager {
    private static instance: TooltipManager
    private container: HTMLElement | null = null
    private currentTooltip: HTMLElement | null = null
    private isHovered: boolean = false;

    private constructor() {
        injectStyles();
    }

    public static getInstance(): TooltipManager {
        if (!TooltipManager.instance) {
            TooltipManager.instance = new TooltipManager()
        }
        return TooltipManager.instance
    }

    private createContainer(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'global-tooltip-container';
        document.body.appendChild(container);
        return container;
    }

    private calculatePosition(event: MouseEvent, placement: string, offset: number = 12): { top: string; left: string; transform: string } {
        const { clientX, clientY } = event;
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        const x = clientX  //+ scrollX;
        const y = clientY // + scrollY;

        // 偏移量从10px调整为12px，适应更大的箭头
        switch (placement) {
            case 'top':
                return { left: `${x}px`, top: `${y - offset}px`, transform: 'translateX(-50%) translateY(-100%)' };
            case 'bottom':
                return { left: `${x}px`, top: `${y + offset}px`, transform: 'translateX(-50%)' };
            case 'left':
                return { left: `${x - offset}px`, top: `${y}px`, transform: 'translateX(-100%) translateY(-50%)' };
            case 'right':
                return { left: `${x + offset}px`, top: `${y}px`, transform: 'translateY(-50%)' };
            default:
                return { left: `${x}px`, top: `${y + offset}px`, transform: 'translateX(-50%)' };
        }
    }

    public show(options: TooltipOptions | string, event?: MouseEvent): TooltipInstance {
        if (!event) {
            console.warn('需要鼠标事件定位');
            const mockEvent = { clientX: 200, clientY: 200 } as MouseEvent;
            return this.show(options, mockEvent);
        }
        const config: TooltipOptions = typeof options === 'string'
            ? { content: options, showArrow: true }
            : { showArrow: true, closeOnClick: true, offset: 12, ...options }; // 默认偏移量调整为12px

        const { placement = 'top', effect = 'dark' } = config;
        this.close();

        if (!this.container) {
            this.container = this.createContainer();
        }

        // 创建提示框主体
        const tooltipElement = document.createElement('div');
        const position = this.calculatePosition(event, placement, config.offset);
        tooltipElement.className = `global-tooltip theme-${effect}`;
        Object.assign(tooltipElement.style, {
            left: position.left,
            top: position.top,
            transform: position.transform
        });
        tooltipElement.textContent = config.content;

        // 鼠标悬浮提示框时不自动关闭
        tooltipElement.addEventListener('mouseenter', event => {
            this.isHovered = true;
        });
        // 鼠标离开提示框后自动关闭
        tooltipElement.addEventListener('mouseleave', event => {
            this.isHovered = false;
            setTimeout(() => {
                close();
            }, 700)
        });

        // 创建箭头
        if (config.showArrow !== false) {
            const arrowContainer = document.createElement('div');
            arrowContainer.className = 'tooltip-arrow-container';

            const arrow = document.createElement('div');
            arrow.className = 'tooltip-arrow';

            // 箭头颜色
            const arrowColor = effect === 'dark' ? '#494c4c' : 'white';
            arrow.style.backgroundColor = arrowColor;

            // 箭头位置与旋转（根据方向调整，适配放大后的尺寸）
            switch (placement) {
                case 'top':
                    arrowContainer.style.left = '50%';
                    arrowContainer.style.bottom = '-18px'; // 位置微调，确保与主体无缝连接
                    arrowContainer.style.transform = 'translateX(-50%)';
                    arrow.style.transform = 'rotate(45deg)';
                    break;
                case 'bottom':
                    arrowContainer.style.left = '50%';
                    arrowContainer.style.top = '-18px'; // 位置微调
                    arrowContainer.style.transform = 'translateX(-50%)';
                    arrow.style.transform = 'rotate(45deg)';
                    break;
                case 'left':
                    arrowContainer.style.top = '50%';
                    arrowContainer.style.right = '-18px'; // 位置微调
                    arrowContainer.style.transform = 'translateY(-50%)';
                    arrow.style.transform = 'rotate(45deg)';
                    break;
                case 'right':
                    arrowContainer.style.top = '50%';
                    arrowContainer.style.left = '-18px'; // 位置微调
                    arrowContainer.style.transform = 'translateY(-50%)';
                    arrow.style.transform = 'rotate(45deg)';
                    break;
            }

            // 浅色主题箭头加边框（适配放大后的尺寸）
            if (effect === 'light') {
                arrow.style.boxShadow = '1px 1px 0 0 #ddd';
            }

            arrowContainer.appendChild(arrow);
            tooltipElement.appendChild(arrowContainer);
        }

        this.container.appendChild(tooltipElement);
        this.currentTooltip = tooltipElement;

        const close = () => {
            if(!this.isHovered) {
                tooltipElement.remove();
                this.currentTooltip = null;
            }
        };

        // 点击外部关闭
        if (config.closeOnClick !== false) {
            const handler = (e: MouseEvent) => {
                if (!tooltipElement.contains(e.target as Node)) {
                    close();
                    document.removeEventListener('click', handler);
                }
            };
            setTimeout(() => document.addEventListener('click', handler), 100);
        }

        // 自动关闭
        if (config.duration) {
            setTimeout(close, config.duration);
        }

        return { close };
    }

    public close(): void {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
}

const tooltipManager = TooltipManager.getInstance();

export const Tooltip = {
    show: (options: TooltipOptions | string, event?: MouseEvent) => tooltipManager.show(options, event),
    close: () => tooltipManager.close()
};

export type { TooltipInstance, TooltipOptions };
    