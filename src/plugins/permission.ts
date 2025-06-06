import router from "@/router";
import { useUserStore } from "@/store/modules/user";
import { usePermissionStore } from "@/store/modules/permission";
import NProgress from "@/utils/nprogress";
import { codeListViewStore, useTagsViewStore } from "@/store";
import { descryptParameter, encryptParameter } from "@/utils/encipher";
import { descryptParameterToQuery } from '@/utils/common'

export function setupPermission() {
  // 白名单路由
  const whiteList = ["/login"];
  // 加密标志位
  const isEncrypted = ref<Boolean>(false);

  const tagsViewStore = useTagsViewStore();

  const { visitedViews } = storeToRefs(tagsViewStore);

  router.beforeEach(async (to, from, next) => {
    NProgress.start();
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
            // Encrypt route parameters 路由参数加密
            const query = to.query;
            if (!isEncrypted.value && to.query && Object.keys(to.query).length > 0) {
              isEncrypted.value = true;
              if (!!query.encrypted && query.encrypted === '1') { // 页面刷新
                nextTick(() => {
                  router.push({ path: to.fullPath, query: query });
                });
              } else {
                for (const key in query) {
                  if (Object.prototype.hasOwnProperty.call(query, key)) {
                    if (!!query[key] && key !== 'encrypted') {
                      to.query[key] = encryptParameter(query[key]);
                    }
                  }
                }
                if (Object.keys(query).length > 0) {
                  query['encrypted'] = '1';
                  next({ path: to.path, query: query });
                }
              }
            } else {
              isEncrypted.value = false;
              if (to.meta.title) {
                const data = descryptParameterToQuery(query);
                tagsViewStore.addView({
                  name: to.name as string,
                  title: to.meta.title,
                  path: to.path,
                  fullPath: to.fullPath,
                  affix: to.meta?.affix,
                  keepAlive: to.meta?.keepAlive,
                  hidden: to.meta.hidden,
                  query: data.JSONquery,
                  params: data.ParseParams
                });
                tagsViewStore.moveToCurrentTag(to);
              }
              next();
            }
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
            codeListViewStore().queryOnce();
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

  router.afterEach((to) => {
    // Decrypt route parameters 路由参数解密
    if (to.query) {
      const {JMquery, ParseParams} = descryptParameterToQuery(to.query);
      to.query = JMquery
      to.params = ParseParams
    }
    NProgress.done();
  });

}
