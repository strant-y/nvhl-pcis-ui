import {createRouter, createWebHashHistory, RouteLocationRaw, RouteRecordRaw} from "vue-router";
import {encryptParameter} from "@/utils/encipher";
import {useTagsViewStore} from "@/store";
import {CommonConstants} from "@/constants/CommonConstants";
import {descryptParameterToQuery} from "@/utils/common";

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
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard", // 用于 keep-alive, 必须与SFC自动推导或者显示声明的组件name一致
        // https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        meta: {
          title: "dashboard",
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
router.push = function (location: RouteLocationRaw) {
  if(!location || Object.keys(location).length == 0 || location === '') {
    return Promise.reject(new Error('Invalid route location'));
  }
  encryptRouterParam(location);
  return originalPush.call(this, location).then(() => {
    const tagsViewStore = useTagsViewStore();
    tagsViewStore.addTagView(this.currentRoute.value)
  }).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      // 可以在这里添加全局错误处理
      console.error('路由跳转错误:', err)
    }
    return Promise.reject(err)
  })
};
// 扩展 replace 方法
router.replace = function (location: RouteLocationRaw) {
  encryptRouterParam(location);
  return originalReplace.call(this, location).then(() => {
    const tagsViewStore = useTagsViewStore();
    tagsViewStore.updateViewParam(this.currentRoute.value);
  });
};

// 路由参数加密
export function encryptRouterParam(location: RouteLocationRaw) {
  if(typeof location === CommonConstants.TYPE_OF_STRING || !location.query) {
    return;
  }
  if(!location.query.encrypted) {
    location.query.encrypted = true;
    for (const key in location.query) {
      if (Object.prototype.hasOwnProperty.call(location.query, key)) {
        if (!['encrypted'].includes(key) && location.query[key]) {
          location.query[key] = encryptParameter(location.query[key]);
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
