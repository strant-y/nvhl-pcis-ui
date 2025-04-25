import {loginApi, logoutApi, resolveTokenApi, verifyCodeApi} from "@/api/auth";
import {getUserInfoApi} from "@/api/user";
import router, {resetRouter} from "@/router";
import {store} from "@/store";

import {LoginData} from "@/api/auth/types";
import {UserInfo} from "@/api/user/types";
import {LocationQuery, LocationQueryValue, useRoute} from "vue-router";

export const useUserStore = defineStore("user", () => {
  const user = ref<UserInfo>({
    roles: [],
    perms: [],
  });

  const route = useRoute();

  /**
   * 登录
   *
   * @param {LoginData}
   * @returns
   */
  function login(loginData: LoginData) {
    return loginApi(loginData);
  }

  /**
   * 校验验证码
   * 初始化机构、权限信息
   * @param params
   */
  function verifyCode(params :any) {
    return new Promise<void>((resolve, reject) => {
      verifyCodeApi(params)
        .then((res) => {
          const {msg, code, tokenType, token, inmsg} = res;
          if (200 === code) {
            if(inmsg){
              ElMessage.warning(inmsg);
            }
            if(res.user){
              const userData = res.user;
              sessionStorage.setItem("token", tokenType + token); // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
              sessionStorage.setItem("opOrg", userData.companyId);
              sessionStorage.setItem("user", JSON.stringify(userData));
              sessionStorage.setItem("returntime", res.returntime);

              const query: LocationQuery = route.query;

              const redirect = (query.redirect as LocationQueryValue) ?? "/";
              const otherQueryParams = Object.keys(query).reduce(
                (acc: any, cur: string) => {
                  if (cur !== "redirect") {
                    acc[cur] = query[cur];
                  }
                  return acc;
                },
                {}
              );
              ElMessage.success(msg);
              router.push({path: redirect, query: otherQueryParams});
            }
          } else {
            ElMessage.error(msg);
          }
          resolve(res);
      })
    .catch((error) => {
        reject(error);
      });
    });
  }

    function resolveToken(params: any) {
        return new Promise<void>((resolve, reject) => {
            resolveTokenApi(params)
                .then((res) => {
                    if (200 === res.code) {
                        if (res.data) {
                            const userData = res.data;
                            // sessionStorage.setItem("token", "Bearer " + params); // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
                            sessionStorage.setItem("user", JSON.stringify(userData));
                        } else {
                            ElMessage.error("token校验失败");
                        }
                    } else {
                        ElMessage.error(res.msg);
                    }
                    resolve(res);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getUserInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      const params = sessionStorage.getItem("user");
      getUserInfoApi(params? JSON.parse(params):{})
        .then(({data}) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          if (!data.roles || data.roles.length <= 0) {
            reject("getUserInfo: roles must be a non-null array!");
            return;
          }
          Object.assign(user.value, { ...data });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // user logout
  function logout() {
    return new Promise<void>((resolve, reject) => {
      logoutApi()
        .then(() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("returntime");
          location.reload(); // 清空路由
          localStorage.clear();
          sessionStorage.clear();
          document.cookie = '';
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // remove token
  function resetToken() {
    console.log("resetToken");
    return new Promise<void>((resolve) => {
      sessionStorage.removeItem("token");
      resetRouter();
      resolve();
    });
  }

  return {
    user,
    login,
    getUserInfo,
    logout,
    resetToken,
      verifyCode,
      resolveToken
  };
});

// 非setup
export function useUserStoreHook() {
  return useUserStore(store);
}
