import { AxiosPromise } from "axios";
import {MenuQuery, MenuVO, MenuForm, MenuOptionsVO} from "./types";
import {post,get} from "@/utils/http";
import {LocalBaseApi} from "@/api/config";

const MENUS_INTERFACE = '/menus-interface';


/**
 * 添加菜单
 * @param data
 */
export function addMenu(data: MenuForm) {
  return post(MENUS_INTERFACE+'/addMenus',data);
}

/**
 * 修改菜单
 * @param id
 * @param data
 */
export function updateMenu(data: MenuForm) {
  return post(MENUS_INTERFACE+'/updateMenus',data);
}

/**
 * 删除菜单
 * @param id 菜单ID
 */
export function deleteMenu(cOpCde: string) {
  return post(MENUS_INTERFACE+'/deleteMenus',{cOpCde: cOpCde});
}

/**
 * 获取菜单树形列表
 * @param queryParams
 */
export function listMenusApi(queryParams: MenuQuery): AxiosPromise<MenuVO[]> {
  return post(MENUS_INTERFACE+'/menusList',queryParams);
}

/**
 * 获取菜单树形列表 options
 */
export function listMenusOptionsApi(queryParams: MenuQuery): AxiosPromise<MenuOptionsVO[]> {
  return post(MENUS_INTERFACE+'/menusOptionsList',queryParams);
}

/**
 * 获取路由列表
 */
export function getMenuRoutesList() {
  return get(MENUS_INTERFACE+'/menuRoutesList');
}

/**
 * 获取快捷访问菜单列表
 */
export function getShortcutDataList() {
  return get( MENUS_INTERFACE+'/getShortcutDataList');
}

/**
 * 更新快捷访问菜单列表
 */
export function updateShortRoute(queryParams: any) {
  return post( MENUS_INTERFACE+'/updateShortRoute',queryParams);
}
