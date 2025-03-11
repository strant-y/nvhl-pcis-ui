/**
 * 用于存储产品相关的数据
 */
import { defineStore } from "pinia";
export const useProductStore = defineStore('product', {
    state: () => ({
      cIsSingle: '1', //是否单项工程，默认值：是
    }),
    actions: {
        setCIsSingle(newVal) {
            this.cIsSingle = newVal
        }
    }
})