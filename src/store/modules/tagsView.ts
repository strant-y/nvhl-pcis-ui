import {getCompName} from '@/typings/views-component'
import {clearDataOpertaorByPageKey} from '@/store';
import {descryptParameterToQuery} from "@/utils/common";
import {RouteLocationNormalizedLoaded} from "vue-router";
import {eventBus} from "@/utils/event-bus";

export const useTagsViewStore = defineStore("tagsView", () => {
  const visitedViews = ref<TagView[]>([]);
  const cachedViews = ref<string[]>([]);
  const selectedView = ref<TagView>();

  function addTagView(route: RouteLocationNormalizedLoaded) {
    const to = route;
    if (to.meta) {
      const view = buildView(to);
      if (view.keepAlive) {
        // 缓存模式
        addCachedView(view.cachedKey);
      }
      addVisitedView(view);
      moveToCurrentTag(to);
    }
  }

  // 组建视图参数
  function buildView(to: any): TagView {
    const data = descryptParameterToQuery(to.query);
    let dynamicTitle: any = to.meta.title;
    if (data.ParseParams && data.ParseParams.title) {
      dynamicTitle = data.ParseParams.title;
    } else if (to.query.title) {
      dynamicTitle = to.query.title;
    }
    const cachedKey = getCompName(to.name as string);
    return {
      name: to.name as string,
      title: dynamicTitle,
      path: to.path,
      fullPath: to.fullPath,
      affix: to.meta?.affix,
      keepAlive: to.meta?.keepAlive || !!cachedKey,
      hidden: to.meta.hidden,
      query: data.JSONquery,
      cachedKey: cachedKey,
    };
  }

  /**
   * 添加已访问视图到已访问视图列表中
   */
  function addVisitedView(view: TagView) {
    // 如果已经存在于已访问的视图列表中，则不再添加 只更新视图中的路由参数
    if (visitedViews.value.some((v) => v.name === view.name && v.path === view.path)) {
      return;
    }
    // 如果视图是固定的（affix），则在已访问的视图列表的开头添加
    if (view.affix) {
      visitedViews.value.unshift(view);
    }else {
      // 如果视图不是固定的，则在已访问的视图列表的末尾添加
      visitedViews.value.push(view);
    }
  }

  /**
   * 添加缓存视图到缓存视图列表中
   */
  function addCachedView(key?: string) {
    // 如果缓存视图名称已经存在于缓存视图列表中，则不再添加
    if (cachedViews.value.includes(key)) {
      return;
    }
    // 如果视图需要缓存（keepAlive），则将其路由名称添加到缓存视图列表中
    cachedViews.value.push(key);
  }


  /** 从已访问视图列表中删除指定的视图 */
  function delVisitedView(view: TagView) {
    return new Promise<void>((resolve) => {
      // 添加空值检查
      if (!view) {
        resolve()
        return
      }

      const idx = visitedViews.value.findIndex((v) => v.path === view.path)
      if(idx != -1) {
        visitedViews.value.splice(idx, 1);
      }
      resolve()
    })
  }

  function delCachedView(view: TagView) {
    return new Promise<void>((resolve) => {
      // 添加空值检查
      if (!view || !view.name) {
        resolve()
        return
      }
      // 安全地操作 cachedViews
      const idx = cachedViews.value.findIndex(item => view.path === item.path)
      if (idx != -1) {
        cachedViews.value.splice(idx, 1)
      }
      resolve()
    })
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
    return new Promise((resolve) => {
      const finView = visitedViews.value.find((item: TagView) => view.path === item.path);
      const index = cachedViews.value.indexOf(finView?.cachedKey);
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


  async function delView(view: TagView) {
    // 添加空值检查
    if (!view) {
      return {
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      }
    }
    try {
      await delVisitedView(view);
      await delCachedView(view);
    } catch (error) {
      console.error('删除视图时出错:', error)
    }

    return {
      visitedViews: [...visitedViews.value],
      cachedViews: [...cachedViews.value],
    }
  }

  function delLeftViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex((v) => v.path === view.path);
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index >= currIndex || item?.affix) {
          return true;
        }
        const cacheIndex = cachedViews.value.indexOf(item.cachedKey);
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


  function moveToCurrentTag(route: RouteLocationNormalizedLoaded) {
    // 使用 nextTick() 的目的是确保在更新 tagsView 组件之前，scrollPaneRef 对象已经滚动到了正确的位置。
    // nextTick(() => {
      for (const tag of visitedViews.value) {
        if (tag.path === route.path && route.name === tag.name) {
          // when query is different then update
          const newView: TagView = {
            name: route.name as string,
            title: tag.title || route.meta.title || "",
            path: route.path,
            fullPath: route.fullPath,
            affix: route.meta?.affix,
            keepAlive: tag.keepAlive,
            hidden: route.meta.hidden,
            query: route.query,
            cachedKey: tag.cachedKey,
          };
          updateVisitedView(newView);
          selectedView.value = newView;
        }
      }
    // });
  }

  function back() {
    eventBus.emit('closeSelectedTag', selectedView.value);
  }
  return {
    visitedViews,
    cachedViews,
    selectedView,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOtherVisitedViews,
    delOtherCachedViews,
    updateVisitedView,
    addTagView,
    delView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    delAllVisitedViews,
    delAllCachedViews,
    moveToCurrentTag,
    back
  };
});
