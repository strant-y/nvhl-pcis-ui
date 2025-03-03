import en from "@/lang/package/en";
import path from "path";
import { defineStore } from "pinia";

export const dataOpertaor = defineStore(
  "dataOpertaor",
  () => {
    const tableConfig = reactive<Array<any>>([]);
    const tableRefs = reactive<Record<string, any>>({});
    const param = reactive<any>({});

    const setParam = (params: any) => {
      Object.assign(param, params);
    };

    const getParam = () => {
      return param;
    };
    const setTableConfig = (config: any) => {
      Object.assign(tableConfig, config);
    };

    const getTableConfig = () => {
      return tableConfig;
    };

    const setTableRefs = (tablerefs: any) => {
      Object.assign(tableRefs, tablerefs);
    };
    const getTableRefs = () => {
      return tableRefs;
    };
    const getTableRefByKey = (key: string) => {
      return tableRefs[key];
    };
    const init = () => {
      Object.assign(tableConfig, {});
      Object.assign(tableRefs, {});
    };
    const addTableRef = (key: string, tableref: any) => {
      tableRefs[key] = tableref;
    };

    const setDataAll = (alldata: any) => {
      Object.keys(alldata).forEach((key) => {
        if (tableRefs[key]) {
          tableRefs[key].setFormValue(alldata[key]);
        }
      });
    };

      const getDataAll = () => {
          const keys = Object.keys(tableRefs);
          const res = {};
          keys.forEach(key => {
              try {
                  res[key]=JSON.parse(JSON.stringify(tableRefs[key].getFromValue()));
              } catch (error) {
                  console.log('方法不存在或出现错误，跳过执行');
              }
          });
          return res;
      };
      /**
       * @Title: 转换数据
       */
      const convertData = (result) => {
          const res = {};
          if (!!result['res']['composition'] && !!tableConfig[0]) {
              const pageInfo=tableConfig[0]['pageInfo']
              pageInfo.forEach((k) => {
                  const voNme =k['pageCode']
                  let srcTab = voNme;
                  if(voNme=='webPlyBaseBasic' || voNme=='webPlyBase1' || voNme=='webPlyBase'){
                      srcTab='Base'
                  }else if(voNme =='webPlyApplicant'){
                      srcTab='Applicant'
                  }else if(voNme =='webPlyInsured'){
                      srcTab='Insured'
                  }else if(voNme =='plyTgt042001'){
                      srcTab='EngineeringTgt'
                  }else if(voNme =='webPlyCvrg04'){
                      srcTab='Term'
                  }
                  if (!!result['res']['composition'][srcTab] && result['res']['composition'][srcTab] instanceof Array && result['res']['composition'][srcTab].length > 0) { // 数组 并且很多行
                      const tab = k['pageType']; // 根据key获取tab 然后判断是否是GridEdit或FreeEdit
                      const dataObj = result['res']['composition'][srcTab];
                      const gridArr=[]
                      for (const d in dataObj) {
                          if (!!tab && 'free' === tab) {
                              res[voNme] = dtoListToListObj(srcTab, dataObj[d]);
                              return res;
                          }else  if (!!tab && 'grid' === tab){
                              gridArr.push(dtoListToListObj(srcTab, dataObj[d]))
                              res[voNme]=gridArr
                              // TODO vo名称对不上的,在此处加单独的逻辑
                          }else  if (!!tab&&'custom' === tab){
                              gridArr.push(dtoListToListObj(srcTab, dataObj[d]))
                              res[voNme]=gridArr
                              // TODO vo名称对不上的,在此处加单独的逻辑
                          }
                      }


                  }
              });
          }
          return res;
      }
      const dtoListToListObj = (key: string, map: any) => {
          if (map == null) {
              return null;
          }
          const listObj = [];
          if (map == null) {
              return null;
          }
          const data = {};
          for (const k in map) {
                      if (!!key) {
                          data[key + '.' + firstCharLower(k)] = map[k];
                      } else {
                          data[firstCharLower(k)] =map[k];
                      }
          }
          return data;
      }
      /**
       * 首字母转换小写
       */
      const firstCharLower = (str: string) => {
          return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
              return $1.toLowerCase() + $2;
          });
      }
    return {
      setTableConfig,
      getTableConfig,
      setTableRefs,
      getTableRefs,
      getTableRefByKey,
      init,
      addTableRef,
      setDataAll,
      getDataAll,
      setParam,
      getParam,
      convertData
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: ["tableConfig", "tableRefs", "param"],
        },
      ],
    },
  }
);
