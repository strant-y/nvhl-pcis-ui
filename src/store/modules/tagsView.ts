import { getIfCompViewByName, getCompByName } from '@/typings/views-component'
import { clearDataOpertaorByPageKey } from '@/store';
import {descryptParameterToQuery} from "@/utils/common";
import {RouteLocationNormalizedLoaded} from "vue-router";
import {base64encoder} from "@/utils/encipher";

export const useTagsViewStore = defineStore("tagsView", () => {
  const visitedViews = ref<TagView[]>([]);
  const cachedViews = ref<TagView[]>([]);
  /**
   * 添加已访问视图到已访问视图列表中
   */
  function addVisitedView(view: TagView) {
    // 如果已经存在于已访问的视图列表中，则不再添加 只更新视图中的路由参数
    // if (visitedViews.value.some((v) => v.path === view.path)) {
    const index = visitedViews.value.findIndex(item => item.path === view.path);
    if (index !== -1) {
      // visitedViews.value[index] = view;
      return;
    }
    // 如果视图是固定的（affix），则在已访问的视图列表的开头添加
    if (view.affix) {
      visitedViews.value.unshift(view);
    } else {
      // 如果视图不是固定的，则在已访问的视图列表的末尾添加
      visitedViews.value.push(view);
    }
  }

  /**
   * 添加缓存视图到缓存视图列表中
   */
  function addCachedView(view: TagView) {
    // 如果缓存视图名称已经存在于缓存视图列表中，则不再添加
    if (cachedViews.value.find(item => item.path === view.path)) {
      return;
    }
    // 如果视图需要缓存（keepAlive），则将其路由名称添加到缓存视图列表中
    if (view.keepAlive) {
      cachedViews.value.push(view);
    }
  }

  /**
   * 从已访问视图列表中删除指定的视图
   */
  function delVisitedView(view: TagView) {
    return new Promise((resolve) => {
      const index = visitedViews.value.findIndex(item => view.path === item.path);
      index > -1 && visitedViews.value.splice(index, 1);
      resolve([...visitedViews.value]);
    });
  }

  function delCachedView(view: TagView) {
    return new Promise((resolve) => {
      const index = cachedViews.value.findIndex(item => view.path === item.path);
      index > -1 && cachedViews.value.splice(index, 1);
      resolve([...cachedViews.value]);
    });
  }

  function delOtherVisitedViews(view: TagView) {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => {
        return v?.affix || v.path === view.path;
      });
      resolve([...visitedViews.value]);
    });
  }

  function delOtherCachedViews(view: TagView) {
    const viewName = view.name as string;
    return new Promise((resolve) => {
      const index = cachedViews.value.findIndex(item => view.path === item.path);
      if (index > -1) {
        cachedViews.value = cachedViews.value.slice(index, index + 1);
      } else {
        // if index = -1, there is no cached tags
        cachedViews.value = [];
      }
      resolve([...cachedViews.value]);
    });
  }

  function updateVisitedView(view: TagView) {
    for (let v of visitedViews.value) {
      if (v.path === view.path) {
        v = Object.assign(v, view);
        break;
      }
    }
  }
  function updateViewParam(route: RouteLocationNormalizedLoaded) {
    const data = descryptParameterToQuery(route.query);
    for (let v of visitedViews.value) {
      if (v.path === route.path) {
        const view = {
          query: data.JSONquery,
          params: data.ParseParams,
        }
        Object.assign(v, view);
        break;
      }
    }
    for (let v of cachedViews.value) {
      if (v.path === route.path) {
        const view = {
          query: data.JSONquery,
          params: data.ParseParams,
        }
        Object.assign(v, view);
        break;
      }
    }
  }

  async function addTagView(route: RouteLocationNormalizedLoaded) {
    const to = route;
    if (to.meta.title) {
      const data = descryptParameterToQuery(to.query);
      let dynamicTitle: any = to.meta.title;
      if (data.ParseParams && data.ParseParams.title) {
        dynamicTitle = data.ParseParams.title;
      } else if (to.query.title) {
        dynamicTitle = to.query.title;
      }
      const ifCompView = getIfCompViewByName(to.name as string);
      const view = {
        name: to.name as string,
        title: dynamicTitle,
        path: to.path,
        fullPath: to.fullPath,
        affix: to.meta?.affix,
        keepAlive: to.meta?.keepAlive || ifCompView,
        hidden: to.meta.hidden,
        query: data.JSONquery,
        params: data.ParseParams,
      };

      if(view.keepAlive) {
        clearDataOpertaorByPageKey(view.name);
        await delView(view); // 清理冲突视图
      }
      addView(view);
      moveToCurrentTag(to);
    }
  }

  function addView(view: TagView) {
    let viewData: TagView = view;
    if (view.keepAlive) {
      // 添加组件模式视图
      viewData = {
        ...view,
        ... {
          isActive: true,
          componentKey: base64encoder(view.path) + new Date().getTime(),
          component: getCompByName(view.name)
        }
      }
    }
    addVisitedView(viewData);
    addCachedView(viewData);
  }

  function delView(view: TagView) {
    return new Promise((resolve) => {
      delVisitedView(view);
      delCachedView(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delOtherViews(view: TagView) {
    return new Promise((resolve) => {
      delOtherVisitedViews(view);
      delOtherCachedViews(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delLeftViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex(
        (v) => v.path === view.path
      );
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index >= currIndex || item?.affix) {
          return true;
        }

        const cacheIndex = cachedViews.value.indexOf(item.name);
        if (cacheIndex > -1) {
          cachedViews.value.splice(cacheIndex, 1);
        }
        return false;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }
  function delRightViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex(
        (v) => v.path === view.path
      );
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index <= currIndex || item?.affix) {
          return true;
        }
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delAllViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      cachedViews.value = [];
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delAllVisitedViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      resolve([...visitedViews.value]);
    });
  }

  function delAllCachedViews() {
    return new Promise((resolve) => {
      cachedViews.value = [];
      resolve([...cachedViews.value]);
    });
  }


  function moveToCurrentTag(route) {
    // 使用 nextTick() 的目的是确保在更新 tagsView 组件之前，scrollPaneRef 对象已经滚动到了正确的位置。
    nextTick(() => {
      for (const tag of visitedViews.value) {
        if (tag.path === route.path) {
          // when query is different then update
          if (tag.fullPath !== route.fullPath) {
            updateVisitedView({
              name: route.name as string,
              title: route.meta.title || "",
              path: route.path,
              fullPath: route.fullPath,
              affix: route.meta?.affix,
              keepAlive: tag.keepAlive,
              hidden: route.meta.hidden,
              component: tag.component,
              query: tag.query,
              params: tag.params,
            });
          }
        }
      }
    });
  }

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOtherVisitedViews,
    delOtherCachedViews,
    updateVisitedView,
    updateViewParam,
    addTagView,
    delView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    delAllVisitedViews,
    delAllCachedViews,
    moveToCurrentTag,
  };
});
