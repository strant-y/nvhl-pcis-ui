import en from "@/lang/package/en";
import path from "path";
import { defineStore } from "pinia";

export const dataOpertaor = defineStore(
  "dataOpertaor",
  () => {
    const tableConfig = reactive<Array<any>>([]);
    const tableRefs = reactive<Record<string, any>>({});
    const param = reactive<any>({});
    const fatherPage = reactive<any>({});

    const setFatherPage = (page: any) => {
      Object.assign(fatherPage, page);
    };

    const getFatherPage = () => {
      return fatherPage;
    };
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
        if (tableRefs[key] && tableRefs[key].setFormValue && Object.keys(alldata[key]).length!=0) {
          tableRefs[key].setFormValue(alldata[key]);
        }
      });
    };

    const getDataAll = () => {
      const keys = Object.keys(tableRefs);
      const res = {};
      keys.forEach(key => {
        try {
          res[key] = JSON.parse(JSON.stringify(tableRefs[key].getFromValue()));
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
      const data = result['res']['composition'];
      const res1 = {};  //临时存放抽离数据
      const pageInfo = tableConfig[0]['pageInfo'];
      const schema = {};
      pageInfo.forEach((k) => {
        const pageKey = k['pageKey'];
        if (!data[pageKey]) {
          res1[pageKey] = {};
          schema[pageKey] = k['pageSchema'];
        }
      });
      Object.keys(res1)?.forEach(k => {
        const sc = schema[k];
        if (sc['fromSchema'] && sc['fromSchema'].length > 0) {
          const fromSchema = sc['fromSchema'];
          fromSchema.forEach(f => {
            const prop = f['prop']; // 抽离需要的数据
            const d = getDataByKey(prop, data);
            if (d) {
              res1[k][prop] = d;
            }
          });
        }
      });
      pageInfo.forEach((k) => {
        const tab = k['pageType']; // 根据key获取tab 然后判断是否是GridEdit或FreeEdit
        const voNme = k['pageKey'];
        let da = {};
        if (res1[voNme]) {
          da = res1[voNme];
        } else {
          if (!!tab && 'free' === tab) {
            da = (data[voNme] instanceof Array && data[voNme].length > 0) ? data[voNme][0] : data[voNme];
          } else
            if (!!tab && 'grid' === tab) {
              da = data[voNme];
            } else
              if (!!tab && 'custom' === tab) {
                da = data[voNme];
              }
        }
        res[voNme] = da;
      });
      return res;
    }
    const getDataByKey = (key: string, data: any) => {
      let r = null;
      Object.keys(data).forEach((k) => {
        if (data[k] && data[k].length > 0) {
          Object.keys(data[k][0]).forEach((d) => {
            if (d === key) {
              r = data[k][0][d];
              delete data[k][0][d];
            }
          });
        }
      });
      return r;
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
      convertData,
      setFatherPage,
      getFatherPage,
      firstCharLower,
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: ["tableConfig", "tableRefs", "param", "fatherPage"],
        },
      ],
    },
  }
);
