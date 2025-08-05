import en from "@/lang/package/en";
import path from "path";
import { defineStore } from "pinia";

export const terConfig = defineStore(
  "termConfig",
  () => {
    const config = reactive<Record<string, any>>({});
    const selectedRow = ref<any>({
        index: undefined,
        data: undefined
    });

    const getConfig = (key: string) => {
      return config[key];
    };
    const addConfig = (key: string, value: any) => {
      config[key] = value;
    };
    const configInit = () => {
      Object.assign(config, {});
    };
    return {
      getConfig,
      addConfig,
      configInit,
      selectedRow
    };
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: ["tableConfig"],
        },
      ],
    },
  }
);
