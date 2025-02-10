import en from "@/lang/package/en";
import path from "path";
import { defineStore } from "pinia";

export const dataOpertaor = defineStore(
  "dataOpertaor",
  () => {
    const tableConfig = reactive<Array<any>>([]);
    const tableRefs = reactive<Record<string, any>>({});
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

    return {
      setTableConfig,
      getTableConfig,
      setTableRefs,
      getTableRefs,
      getTableRefByKey,
      init,
      addTableRef,
      setDataAll,
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: ["tableConfig", "tableRefs"],
        },
      ],
    },
  }
);
