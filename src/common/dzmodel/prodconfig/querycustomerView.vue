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
            title: "客户信息",
            endBtnsPosition: "right",
            endBtns: [
                createFreeButtonBase({
                    type: "primary",
                    label: "查询",
                    func: async () => {
                        // const data = freeEditRef.value?.getFromValue();
                        // console.log(data)
                        // return;
                        // props.method.isOk({'a':1});
                        // emits("handleClose");
                        freeEditRef.value?.validate().then((isValid) => {
                            if (isValid) {
                                handleQuery();
                            } else {
                                ElMessage.error("请填写必填项");
                            }
                        });
                    },
                }),
                createFreeButtonBase({
                    label: "重置",
                    icon: "RefreshRight",
                    func: () => {
                        freeEditRef.value?.setFormValue({
                            cClntMrk: "",
                            cAppNme: "",
                            cCertfCls: "",
                            cCertfCde: "",
                        });
                        handleQuery();
                    },
                }),
            ],
            fromSchema: [
                {
                    prop: "cClntMrk",
                    inputtype: "rtselect",
                    title: "客户类型",
                    rules: [{ type: "required" }],
                    loadData: [
                        { value: "0", label: "个人" },
                        { value: "1", label: "法人" },
                    ],
                    rules: [getRules("required", {})],
                },
                {
                    prop: "cAppNme",
                    inputtype: "rtinput",
                    title: "客户名称",
                },
                {
                    prop: "cCertfCls",
                    inputtype: "rtselect",
                    title: "证件类型",
                    typeCode: 'CERTIFICATE_TYPE_CACHE',
                },
                {
                    prop: "cCertfCde",
                    inputtype: "rtinput",
                    title: "证件号码",
                },
            ],
            fromUi: createFromUiConfig({
                cols: 2,
            }),
        })
    );
    const tableconfig = reactive<AppTableConfig>(
        createTableEditConfig({
            editList: ["cStatus"],
            tableBtnType: "btn",
            tableBtnWidth: 220,
            tableBtnPosition: "right",
            tableBtn: [
                createFreeButtonBase({
                    id: "submit",
                    tooltip: "确认",
                    link: true,
                    type: "danger",
                    icon: "Check",
                    tableClick: async (row) => {
                        // await auditSubmit({
                        //     cProdNo: row.cProdNo,
                        //     cStatus: row.cStatus,
                        //     cAuditStatus: "submit",
                        // }).then((res) => {
                        //     if (res.code === 200) {
                        //         ElMessage.success(res.data.message);
                        //         handleQuery();
                        //     }
                        // });
                    },
                }),
            ],

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
