import { defineStore } from "pinia";

export const dataParam = defineStore(
    "dataParam",
    () => {
        const param = reactive<any>({});

        const setParam = (params: any) => {
            Object.assign(param, {});
            Object.assign(param, params);
        };

        const getParam = () => {
            return param;
        };
        return {
            setParam,
            getParam,
        };
    },
    {
        persist: {
            enabled: true,
            strategies: [
                {
                    storage: localStorage,
                    paths: ["param"],
                },
            ],
        },
    }
);
