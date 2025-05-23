import { defineStore } from "pinia";



/**
 * 用于存储产品相关的数据
 */
export const useProductStore = defineStore('product', () => {

    const cIsSingle = ref('1'); //是否单项工程，默认值：是
    const cClntMrk = ref('1'); //投保人性质
    const cCiMrk = ref('0'); //联共保业务

    const isCiJiMrk = computed(()=> cCiMrk.value !== '0');

    function setCIsSingle(newVal) {
        cIsSingle.value = newVal
    }
    function setcClntMrk(newVal){
        cClntMrk.value = newVal
    }
    function setcCiMrk(newVal){
        cCiMrk.value = newVal
    }

    function checkCiMrk(){
        return cCiMrk.value !== '0';
    }

    return {
        isCiJiMrk,
        setCIsSingle,
        setcClntMrk,
        setcCiMrk,
        checkCiMrk
    }
})
