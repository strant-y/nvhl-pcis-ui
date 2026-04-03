import {useUserStore} from "@/store";
import {getDictOptions, getDictOptionsUnAuthor, findDropDownBoxList, codelistQuery} from "@/api/dict";
import {getDeptOptions, listDepts} from "@/api/dept";
import { getProdInfoList } from "@/api/query/index";
import {defineStore} from "pinia";


export interface CodeListViewProps {
  id?: string;
}

type StoreCache = Map<string, ReturnType<typeof defineStore>>
const codeListViewMap: StoreCache = new Map();

export const codeListViewStore = (props?: CodeListViewProps) => {
  const {id} = props ? props : {id: 'default'};
  return storeFactory(id, defineStore(`codeListView-${id ? id : 'default'}`, () => {

    const userStore = useUserStore();
    // codeList 集合
    const codeListMap = ref({});
    // 需要初始化codeType列表
    const codeTypeList = ref<string[]>([
      'CProdMap',
      'CProdList',
    ]);

    /**
     * 系统初始化成功后执行
     * 将需要缓存的优先查询
     * @param typeList typeCode列表
     */
    function queryOnce(typeList: string[] = undefined) {
      if (!!typeList) {
        codeTypeList.value = codeTypeList.value.concat(typeList);
      }
      // codeList 初始化
      if (codeTypeList.value && 0 < codeTypeList.value.length) {
        findDropDownBoxList({
          dictTypeList: codeTypeList.value,
        }).then(({data}) => {
          if (!!data) {
            const keys = Object.keys(data);
            keys.forEach(key => {
              codeListMap.value[key] = data[key];
            })
          }
        });
      }
      // 其它需要缓存的codeList
      queryOtherOptions();
    }

    /**
     * 根绝code查询options数据
     * @param typeCode code类型
     * @param unAuthor 权限
     * @param cache 是否缓存 默认false
     */
    function queryCodeListByCode(typeCode: string, unAuthor: boolean, cache: boolean = false): Promise<OptionType[]> {
      return new Promise<OptionType[]>(async (resolve, reject) => {
        const result = ref<OptionType[]>([]);
        const cacheData = codeListMap.value[typeCode];
        if (!!cacheData) {
          // 缓存有数据就返回
          resolve(cacheData);
          return;
        } else if (!unAuthor) {
          await getDictOptions(typeCode).then((response) => {
            if (response.code === 200) {
              result.value = response.data;
            } else {
              ElMessage.error(response.msg);
              reject('getDictOptions() -> codeList查询失败！typeCode: ' + typeCode + 'msg: ' + response.msg);
            }
          });
        } else {
          await getDictOptionsUnAuthor(typeCode).then((response) => {
            if (response.code === 200) {
              result.value = response.data;
            } else {
              ElMessage.error(response.msg);
              reject('getDictOptionsUnAuthor() -> codeList查询失败！typeCode: ' + typeCode + 'msg: ' + response.msg);
            }
          });
        }
        // 插入缓存
        if (!!result.value && cache) {
          // setOptionsToCacheMap(typeCode, result.value);
        }
        resolve(result.value);
      });
    }

    
  /**
   * 根绝code查询options数据
   * @param param code类型 包含codeListName codelist参数以及codeListParam参数
   * @param unAuthor 是否无权获取
   * @param cache 是否缓存 默认false
   */
  function queryCodeList(param: any, unAuthor: boolean = false, cache: boolean = false): Promise<OptionType[]>{
    return new Promise<OptionType[]> (async (resolve, reject) => {
      const result = ref<OptionType[]>([]);
      const k = param.codeListName + ((param.codeListParam && Object.keys(param.codeListParam).length > 0) ? JSON.stringify(param.codeListParam):'');
      const v = codeListMap.value[k];
      if(codeListMap.value[k]){
        resolve(codeListMap.value[k]);
        return ;
      }
      const cacheData = codeListMap.value[param.codeListName];
      if (!!cacheData) {
        // 缓存有数据就返回
        resolve(cacheData);
        return;
      } else if (!unAuthor) {
        await codelistQuery(param).then((response) => {
          if (response.code === 200) {
            result.value = response.data;
          } else {
            ElMessage.error(response.msg);
            reject('queryCodeList() -> codeList查询失败！typeCode: ' + param.codeListName + 'msg: '+response.msg);
          }
        });
      } else {  //无权获取,一般用于登录时,提供一些无权下拉选获取,暂时无用,预留
        await getDictOptionsUnAuthor(param).then((response) => {
          if (response.code === 200) {
            result.value = response.data;
          } else {
            ElMessage.error(response.msg);
            reject('getDictOptionsUnAuthor() -> codeList查询失败！typeCode: ' + param.codeListName + 'msg: '+response.msg);
          }
        });
      }
      // 插入缓存
      if (!!result.value && cache) {
        // setOptionsToCacheMap(param.codeListName, result.value);
      }
      codeListMap.value[k] = result.value;  // 将数据加入缓存,方便下次直接缓存获取不需要再数据库交互
      resolve(result.value);
    });
  }

    /**
     * 获取缓存中的codeList
     * @param typeCode code类型
     */
    function getCacheCodeListByCode(typeCode: string) {
      if (!typeCode) new Error('###[' + id + ']getCodeListByCode() -> typeCode is undefined!')
      return !!codeListMap.value[typeCode] ? codeListMap.value[typeCode] : [];
    }

  /**
   * 将数据存入缓存
   * @param typeCode
   * @param list
   */
  function setOptionsToCacheMap(typeCode: string, list: OptionType[]){
    if(list){
      codeListMap.value[typeCode] = Object.assign(list);
    }
  }
      /**
   * 根据code类型和value值查询label
   * @param typeCode code类型 必填
   * @param value 必填
   * @param options codeList数据 默认undefined 填了就用
   */
  function getLabelByValue(typeCode: string, value: any, options: OptionType[] = undefined): any {
    const codeList = ref<OptionType[]>(options);
    if(!options){
      codeList.value = codeListMap.value[typeCode];
    }
    if(!codeList.value){
      console.error('没有查询到和 typeCode: '+typeCode+' 匹配的codeList！');
      return value;
    }
    const option = codeList.value.find((option) => option.value === value);
    return option ? option.label : value;
  }


    /**
     * 其它需要缓存的数据
     */
    function queryOtherOptions() {
      // 员工管理-树形机构数据
      getDeptOptions(userStore.user.companyId).then((response) => {
        setOptionsToCacheMap('TreeFormDeptType', response.data);
      });

      // 查询表单 机构选择 一级机构数据
      listDepts({}).then((res) => {
        if (res.code == 200) {
          const options = res.data.list.map(item => ({
            value: item.cDptCde,
            label: item.cDptCde + item.cDptCnm,
            children: [], // 初始时，所有项都没有子项
          }));
          setOptionsToCacheMap('QueryFormDeptType', options);
        } else {
          ElMessage.error(res.msg);
        }
      })

      // 产品列表
      getProdInfoList({}).then(res => {
        if (res.data) {
          setOptionsToCacheMap('CProdMap', res.data.groupMap);
          setOptionsToCacheMap('CProdList', res.data.list);
        }
      })
    }


    // 清除所有数据
    function clear() {
      codeListMap.value = {};
    }


    return {
      queryOnce,
      queryCodeList,
      queryCodeListByCode,
      getCacheCodeListByCode,
      setOptionsToCacheMap,
      codeTypeList,
      getLabelByValue,
      clear,
    };
  }))
}


/**
 * 缓存管理
 */
function storeFactory(
    storeId?: string,
    newStore?: ReturnType<typeof defineStore>
) {
  const pageKey = storeId;
  const storeRef = ref();
  if(!pageKey) {
    storeRef.value = {};
  }else if (codeListViewMap.has(pageKey)) {
    storeRef.value = codeListViewMap.get(pageKey)
  }else if (newStore) {
    storeRef.value = newStore();
    codeListViewMap.set(pageKey, storeRef.value);
  }
  return storeRef.value;
}

/**
 * 缓存清理
 * @param pageKey
 */
export function clearCodeListViewByPageKey(pageKey: string) {
  if(!pageKey) pageKey = 'default';
  const del = (key: string) => {
    const store = codeListViewMap.get(key);
    store?.$dispose?.();
    codeListViewMap.delete(key);
  }
  if(pageKey === 'posite-page') {
    codeListViewMap.keys().forEach(key => {
      if(key.startsWith('group-')) {
        del(key)
      }
    })
  }else if (codeListViewMap.has(pageKey)) {
    del(pageKey)
  }
}