import router from "@/router";
import { useUserStore } from "@/store/modules/user";
import { usePermissionStore } from "@/store/modules/permission";
import NProgress from "@/utils/nprogress";
import {clearCodeListViewByPageKey, clearDataOpertaorByPageKey, codeListViewStore, useTagsViewStore} from "@/store";
import { descryptParameterToQuery } from '@/utils/common'

export function setupPermission() {
  // 白名单路由
  const whiteList = ["/login"];

  router.beforeEach(async (to, from, next) => {
    NProgress.start();
       // 设置页面标题
    // setPageTitle(to);

    const hasToken = sessionStorage.getItem("token");
    if (hasToken) {
      if (to.path === "/login") {
        // 如果已登录，跳转首页
        next({ path: "/" });
        NProgress.done();
      } else {
        const userStore = useUserStore();
        const hasRoles = userStore.user.roles && userStore.user.roles.length > 0;
        if (hasRoles) {
          // 未匹配到任何路由，跳转404
          if (to.matched.length === 0) {
            if (to.href) {
              next(from);
            } else if (from.name) {
              ElMessage.error('无权限访问！');
              next({ name: from.name })
            } else {
              next("/404");
            }
          } else {
            const switchType = sessionStorage.getItem('switchType');
            if(!switchType || switchType === 'push') {
              clearDataOpertaorByPageKey(to.name);
              clearCodeListViewByPageKey(to.name);
            }
            next();
          }
        } else {
          const permissionStore = usePermissionStore();
          try {
            const { roles } = await userStore.getUserInfo();
            const accessRoutes = await permissionStore.generateRoutes(roles);
            accessRoutes.forEach((route) => {
              router.addRoute(route);
            });
            // 初始化需要查询codeList
            codeListViewStore({id: 'default'}).queryOnce();
            next({ ...to, replace: true });
          } catch (error) {
            // 移除 token 并跳转登录页
            await userStore.resetToken();
            next(`/login`);
            NProgress.done();
          }
        }
      }
    } else {
      const query = to.query;

      if (!!query['token']) {
        sessionStorage.setItem("token", "Bearer " + query['token']); // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx

        const userStore = useUserStore();
        const getCaptchaParam = ref({});
        Object.assign(getCaptchaParam.value, { token: query['token'] });
        await userStore.resolveToken(getCaptchaParam.value);
        next({ ...to, replace: true });
      }
      // 未登录可以访问白名单页面
      else if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        next(`/login`);
        NProgress.done();
      }
    }
  });

  // 独立的标题设置函数
  const setPageTitle = (to) => {
    let title = "";
    // 1. 优先从query参数中获取动态标题
    if (to.query && to.query.title) {
      title = to.query.title;
    }
    // 2. 其次使用路由配置中的meta.title
    else if (to.meta && to.meta.title) {
      title = to.meta.title;
    }
    // 3. 使用默认标题
    else {
      title = "默认标题";
    }

    // 设置浏览器标题
    // document.title = title;

    // 如果需要更新标签页标题，在这里处理
    const tagsViewStore = useTagsViewStore();
    if (to.meta.title && tagsViewStore.currentTag && tagsViewStore.currentTag.path === to.path) {
      tagsViewStore.updateTagTitle(to.path, title);
    }
  };


  router.afterEach((to) => {
    // Decrypt route parameters 路由参数解密
    if (to.query) {
      const {JMquery, ParseParams} = descryptParameterToQuery(to.query);
      to.query = JMquery
      to.params = ParseParams
    }
    sessionStorage.removeItem('switchType');
    NProgress.done();
  });

}
