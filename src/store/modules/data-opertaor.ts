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
      getParam
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
