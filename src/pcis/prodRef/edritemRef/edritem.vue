<template>
  <app-table
          :tableConfig="tableconfig"
          v-model:pageresult="pageresult"
          ref="edritemEditRef"
          @page-change="handleQuery(false)"
  />
</template>

<script setup lang="ts">
    import {
        AppTableConfig,
        AppTableMethod,
        createTableEditConfig,
    } from "@/shared/app-table-config";
    import { createFreeButtonBase } from "@/shared/button-config";
    import { useValidator } from "@/typings/useValidator";
    import { dataOpertaor } from "@/store/modules/data-opertaor";
    const props = defineProps({
        // data: {
        //     type: Object,
        //     default: () => ({}),
        // },
        // method: {
        //     type: Object,
        //     default: () => ({}),
        // },
        param: {
            type: [Object],
        },
    });
    const edritemEditRef = ref<AppTableMethod | null>(null);
    const pageresult = reactive<Pageresult>({
        result: "",
        /** 数据列表 */
        list: [],
        /** 总数 */
        total: 0,
    });
    const user = JSON.parse(sessionStorage.getItem("user"));
    const tableconfig = reactive<AppTableConfig>(
        createTableEditConfig({
            title: "批改比较项",
            editList: ["cStatus"],
            tableBtnType: "btn",
            tableBtnWidth: 220,
            // tableBtnPosition: "right",
            tableBtn: [
            ],
            fromSchema: [
                {
                    prop: "EdrCmpItem.NSeqNo",
                    inputtype: "rtinput",
                    title: "序号",
                },
                {
                    prop: "EdrCmpItem.CTabNme",
                    inputtype: "rtinput",
                    title: "批改对象",
                },
                {
                    prop: "EdrCmpItem.CFldNme",
                    inputtype: "rtinput",
                    title: "批改项目",
                },
                {
                    prop: "EdrCmpItem.COldVal",
                    inputtype: "rtinput",
                    title: "原值",
                },
                {
                    prop: "EdrCmpItem.CChgVal",
                    inputtype: "rtinput",
                    title: "变化值",
                },
                {
                    prop: "EdrCmpItem.CNewVal",
                    inputtype: "rtinput",
                    title: "新值",
                },
            ],
        })
    );
    //给表格表单项赋值
    function setTableFormItem(key, obj) {
        if (obj && Object.keys(obj).length) {
            tableconfig.fromSchema?.forEach((item) => {
                if (item.prop === key) {
                    Object.assign(item, obj);
                }
            });
        }
    }
    function setDisa() {}

    /** 查询 */
    function handleQuery(flag?: boolean) {
        // const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
        // genCusConInfoBusinessList(param)
        //     .then((res) => {
        //         const { code, data, msg } = res;
        //         if (200 === code) {
        //             pageresult.list = data.result;
        //             pageresult.total = data.total;
        //         } else {
        //             ElMessage.error(msg);
        //         }
        //     })
        //     .finally(() => {});
    }

    onMounted(() => {});

    defineExpose({

    });
</script>
