import { App, inject, Plugin, h, render } from "vue";
import { ComponentOptions } from "vue";
export const DzModalSymbol = Symbol();
export class DzModalResult {
  type: "ok" | "cancel" | "string" = "ok";
  body?: any = undefined;
}

export class DzModalService {
  private _app?: App = undefined;
  constructor(app: App) {
    this._app = app;
  }
  public open(modal: ComponentOptions, props?: any): Promise {
    return new Promise((reslove, reject) => {
      if (!this._app) {
        reject("_app is undefined");
        return;
      }

      const container = document.createElement("div");
      document.body.appendChild(container);

      // 这里需要合并props，传入到组件modal
      const vm = h(modal, {
        ...props,
        onOk: (data?: any) => {
          // 弹出框关闭时移除节点
          reslove(this.ok(data));
        },
        onCancel: (data?: any) => {
          reslove(this.cancel(data));
        },
      });
      // 这里很重要，关联app上下文
      vm.appContext = this._app._context;
      render(vm, container);
    });
  }

  public ok(data?: any): DzModalResult {
    const result = new DzModalResult();
    result.type = "ok";
    result.body = data;
    return result;
  }

  public cancel(data?: any): DzModalResult {
    const result = new DzModalResult();
    result.type = "cancel";
    result.body = data;
    return result;
  }
}

export function useDzModal(): DzModalService {
  const dzModal = inject(DzModalSymbol);
  if (!dzModal) {
    throw new Error("No DzModal provided!");
  }
  return dzModal;
}

const plugin: Plugin = {
  install(app: App, options?: { [key: string]: any }) {
    const dzModal = new DzModalService(app);
    app.config.globalProperties.$dzModal = dzModal;
    app.provide(DzModalSymbol, dzModal);
  },
};

export default plugin;
