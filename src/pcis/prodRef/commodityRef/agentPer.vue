<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  <app-table
          :tableConfig="tableconfig"
          v-model:pageresult="pageresult"
          ref="tableRef"
          @page-change="handleQuery(false)"
  />
</template>

<script setup lang="ts">
    import {
        AppFreeEditConfig,
        AppFreeEditMethod,
        createAppFreeEditConfig,
        createFromUiConfig,
    } from "@/shared/app-free-edit-config";
    import {
        AppTableConfig,
        AppTableMethod,
        createTableEditConfig,
    } from "@/shared/app-table-config";
    import { createFreeButtonBase } from "@/shared/button-config";
    import { useValidator } from "@/typings/useValidator";
    import { dataOpertaor } from "@/store/modules/data-opertaor";
    const opertaor = dataOpertaor();
    const { getRules } = useValidator();
    const props = defineProps({
        data: {
            type: Object,
            default: () => ({}),
        },
        method: {
            type: Object,
            default: () => ({}),
        },
    });
    const emits = defineEmits(["handleClose"]);
    const freeEditRef = ref<AppFreeEditMethod | null>(null);
    const tableRef = ref<AppTableMethod | null>(null);
    const pageresult = reactive<Pageresult>({
        result: "",
        /** 数据列表 */
        list: [],
        /** 总数 */
        total: 0,
    });
    const formconfig1 = reactive<AppFreeEditConfig>(
        createAppFreeEditConfig({
            title: "",
            endBtnsPosition: "right",
            endBtns: [
                createFreeButtonBase({
                    type: "primary",
                    label: "查询",
                    func: async () => {
                        freeEditRef.value?.validate().then((isValid) => {
                            if (isValid) {
                                handleQuery();
                            } else {
                                ElMessage.error("请填写必填项");
                            }
                        });
                    },
                }),
            ],
            fromSchema: [
                {
                    prop: "CDptCde",
                    inputtype: "rtinput",
                    title: "机构部门",
                },
                {
                    prop: "CChaMrk",
                    inputtype: "rtselect",
                    title: "业务类型",
                    // itemWidth: 2,
                    loadData: [{value: '0', label: '机构'}, {value: '1', label: '个人'}],
                },
                {
                    prop: "CBsnsTyp",
                    inputtype: "rtselect",
                    title: "业务来源大类",
                    loadData: [],
                    rules: [getRules("required", {})],
                },
                {
                    prop: "CChaType",
                    inputtype: "rtselect",
                    title: "业务来源中类",
                    loadData: [],
                    rules: [getRules("required", {})],
                },
                {
                    prop: "CChaSubtype",
                    inputtype: "rtselect",
                    title: "业务来源子类",
                    loadData: [],
                    rules: [getRules("required", {})],
                },
                {
                    prop: "CChaCde",
                    inputtype: "rtinput",
                    title: "编码",
                },
                {
                    prop: "CChaNme",
                    inputtype: "rtinput",
                    title: "代理(经纪)名称",
                },
            ],
            fromUi: createFromUiConfig({
                cols: 3,
            }),
        })
    );
    const tableconfig = reactive<AppTableConfig>(
        createTableEditConfig({
            fromSchema: [
                {
                    prop: "cClntMrk",
                    inputtype: "rttag",
                    title: "客户类型",
                    loadData: [
                        {
                            label: "法人",
                            value: "0",
                        },
                        {
                            label: "个人",
                            value: "1",
                        },
                    ],
                },
                {
                    prop: "cKindNme",
                    inputtype: "rtinput",
                    title: "客户名称",
                },
                {
                    prop: "cProdNo",
                    inputtype: "rtinput",
                    title: "客户层级",
                },
                {
                    prop: "cDispCde",
                    inputtype: "rtinput",
                    title: "证件类型",
                },
                {
                    prop: "cNmeCn",
                    inputtype: "rtinput",
                    title: "证件号码",
                },
                {
                    prop: "cAuditStatus",
                    inputtype: "rtinput",
                    title: "通讯地址",
                },
                {
                    prop: "cAuditStatus",
                    inputtype: "rtinput",
                    title: "邮编",
                },
            ],
        })
    );

    function getFromValue() {
        return freeEditRef?.value?.getFromValue();
    }

    function setFormValue(value: any) {
        freeEditRef?.value?.setFormValue(value);
    }

    function validate() {
        return freeEditRef?.value?.validate();
    }

    function setValue(key: string, value: any) {
        freeEditRef?.value?.setValue(key, value);
    }

    function getValue(key: string) {
        return freeEditRef?.value?.getValue(key);
    }
    function setDisa() {
    }

    /** 查询 */
    function handleQuery(flag?: boolean) {
        const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
        const s = freeEditRef.value?.getFromValue(); //获取表单数据
        const param = Object.assign(s, r);
        if(s['cAppNme']==null&&s['cCertfCde']==null){
            ElMessage.error("客户姓名或证件号码至少一个不为空！");
            return;
        }
        console.log(param)
        return;
        // getProFactoryList(param)
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

    onMounted(() => {
    });

    defineExpose({
        getFromValue,
        setFormValue,
        validate,
        setValue,
        getValue,
    });
</script>
