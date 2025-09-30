import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { setupStore } from "@/store";
import { setupDirective } from "@/directive";
import { setupElIcons, setupI18n, setupPermission } from "@/plugins";

// 本地SVG图标
import "virtual:svg-icons-register";

// 样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";
import "animate.css";
import DzModal from "./common/dzmodel/DzModalService";
import shareds from "./shared/shared"; //公共组件引用
import prodRef from "./pcis/prodRef/prodRef"; //产品组件引用
import cargoRef from "./pcis/cargoRef/cargoRef"; //产品组件引用
import popover from "./common/dzpopover/popover"; //弹出框组件引用
import dzmodel from "./common/dzmodel/dzmodel";  //弹窗公共组件
// import zhCn from 'element-plus/es/locale/lang/zh-cn';
import './assets/iconfont/iconfont.css'
import tooltipPlugin from './plugins/tooltip'

const app = createApp(App);
// 全局注册 自定义指令(directive)
setupDirective(app);
// 全局注册 状态管理(store)
setupStore(app);
// 全局注册Element-plus图标
setupElIcons(app);
// 国际化
setupI18n(app);
// 注册动态路由
setupPermission();
app.use(router).mount("#app");
app.use(DzModal);
app.use(dzmodel);
app.use(shareds);
app.use(prodRef);
app.use(popover);
app.use(cargoRef);
app.use(tooltipPlugin);
// app.use(zhCn);
