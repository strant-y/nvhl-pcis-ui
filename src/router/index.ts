import {createRouter, createWebHashHistory, RouteLocationRaw, RouteRecordRaw} from "vue-router";
import {base64encoder, encryptParameter, encryptParameterRouter} from "@/utils/encipher";
import {useTagsViewStore} from "@/store";
import {CommonConstants} from "@/constants/CommonConstants";

export const Layout = () => import("@/layout/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/prodconfiguration/prodFactory",
    children: [
      {
        path: "prodconfiguration/prodFactory",
        component: () => import("@/views/prodconfiguration/prodFactory.vue"),
        name: "ProdFactory", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
        // https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        meta: {
          title: "产品管理",
          icon: "homepage",
          affix: true,
          keepAlive: false,
          alwaysShow: false,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error-page/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error-page/404.vue"),
        meta: { hidden: true },
      },
    ],
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes as RouteRecordRaw[],
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 保存push replace原始方法
const originalPush = router.push;
const originalReplace = router.replace;
// 扩展 push 方法
router.push = async function (location: RouteLocationRaw) {
  if(!location || Object.keys(location).length == 0 || location === '') {
    return Promise.reject(new Error('Invalid route location'));
  }
  sessionStorage.setItem('switchType', 'push');
  const routeParams = formatLocation(location);
  routeParams.query = {
    ...routeParams.query,
    ...{componentKey: base64encoder(`page-key-${new Date().getTime()}`),}
  };
  encryptRouterParam(routeParams);
  return originalPush(routeParams);
};
// 扩展 replace 方法
router.replace = function (location: RouteLocationRaw) {
  sessionStorage.setItem('switchType', 'replace');
  const routeParams: any = formatLocation(location);
  const tagsViewStore = useTagsViewStore();
  const {visitedViews} = toRefs(tagsViewStore);
  const view = visitedViews.value.find((item: TagView) => item.path === routeParams.path);
  if(view && view.query) {
    routeParams.query = {
      ...routeParams.query,
      ...{componentKey: view.query.componentKey}
    };
  }
  encryptRouterParam(routeParams);
  return originalReplace(routeParams);
};

const formatLocation = (param: any) => {
  const location: RouteLocationRaw = {};
  if(typeof param === CommonConstants.TYPE_OF_STRING) {
    location.path = param;
  }else {
    Object.assign(location, param);
  }
  return location;
};

// 路由参数加密
export function encryptRouterParam(location: RouteLocationRaw) {
  if(!location.query) {
    return;
  }
  if(!location.query.encrypted) {
    location.query.encrypted = true;
    for (const key in location.query) {
      if (Object.prototype.hasOwnProperty.call(location.query, key)) {
        if (!['encrypted', 'componentKey'].includes(key) && location.query[key]) {
          location.query[key] = encryptParameterRouter(location.query[key]);
        }
      }
    }
  }
}

/**
 * 重置路由
 */
export function resetRouter() {
  router.replace({ path: "/login" });
}

export default router;
