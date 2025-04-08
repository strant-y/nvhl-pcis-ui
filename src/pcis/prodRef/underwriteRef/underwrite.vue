<template>
  <app-free-edit v-model:freeEditConfig="formconfig1" ref="underwriteEditRef" />
</template>

<script setup lang="ts">
    import {
        AppFreeEditConfig,
        AppFreeEditMethod,
        createAppFreeEditConfig,
        createFromUiConfig,
    } from "@/shared/app-free-edit-config";
    import { useValidator } from "@/typings/useValidator";
    import { dataOpertaor } from "@/store/modules/data-opertaor";
    import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
    const opertaor = dataOpertaor();
    const { getRules } = useValidator();
    const props = defineProps({
        param: {
            type: [Object],
        },
    });
    const {
        getCUndrMrk,
        getBackClsList,
    } = NewUdrListService();
    const underwriteEditRef = ref<AppFreeEditMethod | null>(null);
    const user=JSON.parse(sessionStorage.getItem("user"))
    const formconfig1 = reactive<AppFreeEditConfig>(
        createAppFreeEditConfig({
            title: "核保信息",
            endBtnsPosition: "right",
            fromSchema: [
                {
                    prop: "cUndrMrk",
                    inputtype: "rtselect",
                    title: "核保选项",
                    loadData: [
                        // {value: 'A', label: '同意'},
                        // {value: 'R', label: '上报'},
                        // {value: 'B', label: '退回给出单员'},
                        // {value: 'T', label: '退回至指定核保级别人员'}
                    ],
                    rules: [getRules("required", {})],
                    clearable: true,
                    func:(v)=>{
                        if ('A' === v) {
                            setValue('cUndrOpnList', '')
                            if ('E' === props.param['cAppTyp']){
                                setFormItem("cUndrOpnList", {
                                    loadData: [{label: '审核通过', value: '6'}]
                                })
                            }else{
                                setFormItem("cUndrOpnList", {
                                    loadData: [{label: '审核通过', value: '0'}]
                                })
                            }
                        }else if ('R' === v) {
                            setValue('cUndrOpnList', '')
                            setFormItem("cUndrOpnList", {
                                loadData: [{label: '提交上级', value: '5'}]
                            })
                        }else{
                            setValue('cUndrOpnList', '')
                            setFormItem("cUndrOpnList", {
                                loadData: [{label: '缺少必要信息', value: '1'},
                                    {label: '修改承保条件', value: '2'},
                                    {label: '费用超标', value: '3'},
                                    {label: '拒绝承保', value: '4'},
                                    {label: '录入错误', value: '7'},
                                    {label: '资料不全', value: '8'},
                                    {label: '其他', value: '9'},
                                ]
                            })
                        }
                        if ('T' === v) {
                            setValue('cBckOp', '')
                            setFormItem("cBckOp", {
                                hidden: false,
                                rules: [getRules("required", {})],
                            })
                            const param={
                                "usrDptCde": user['companyId'],
                                "operId": user['opCde'],
                                "prodNo": props.param.cProdNo,
                                "appNo": props.param.cAppNo,
                                "dptCde": props.param.cDptCde
                            }
                            console.log(param)
                            getBackClsListUrlFn(param)
                        }else {
                            setFormItem("cBckOp", {
                                hidden: true,
                                rules: '',
                            })
                            setValue('cBckOp', '')
                        }
                    }
                },
                {
                    prop: "cUndrOpnList",
                    inputtype: "rtselect",
                    title: "核保意见选项",
                    loadData: [
                    ],
                    rules: [getRules("required", {})],
                    itemWidth: 1,
                    valueSpan: 10,
                    clearable: true,
                },
                {
                    prop: "undrOpn",
                    inputtype: "rtinput",
                    type: "textarea",
                    title: "核保意见",
                    rows: 4,
                    itemWidth: 2,
                },
                {
                    prop: "cBckOp",
                    inputtype: "rtselect",
                    title: "退回核保级别",
                    loadData: [

                    ],
                    clearable: true,
                },
                {
                    prop: "cBckOp1",
                    inputtype: "rtselect",
                    title: "是否再保合约除外业务",
                    rules: [{ type: "required" }],
                    loadData: [
                        {value: '1', label: '是'},
                        {value: '2', label: '否'},
                    ],
                    clearable: true,
                },
                {
                    prop: "riFacMrk",
                    inputtype: "rtselect",
                    title: "是否临分",
                    rules: [{ type: "required" }],
                    loadData: [
                        {value: '1', label: '是'},
                        {value: '2', label: '否'},
                    ],
                    rules: [getRules("required", {})],
                    clearable: true,
                },
                {
                    prop: "riFacMrk1",
                    inputtype: "rtselect",
                    title: "再保退回",
                    rules: [{ type: "required" }],
                    loadData: [
                        {value: '1', label: '是'},
                        {value: '2', label: '否'},
                    ],
                    clearable: true,
                },
                {
                    prop: "riFacOpn",
                    inputtype: "rtinput",
                    type: "textarea",
                    title: "临分意见",
                    rows: 4,
                    itemWidth: 2,
                },
                {
                    prop: "cRiFacFbkOpn",
                    inputtype: "rtinput",
                    type: "textarea",
                    title: "临分反馈意见",
                    rows: 4,
                    itemWidth: 2,
                },
            ],
            fromUi: createFromUiConfig({
                cols: 2,
            }),

        })
    );

    function getFromValue() {
        return underwriteEditRef?.value?.getFromValue();
    }

    function setFormValue(value: any) {
        underwriteEditRef?.value?.setFormValue(value);
    }

    function validate() {
        return underwriteEditRef?.value?.validate();
    }

    function setValue(key: string, value: any) {
        underwriteEditRef?.value?.setValue(key, value);
    }

    function getValue(key: string) {
        return underwriteEditRef?.value?.getValue(key);
    }
    function getCUndrMrkUrlFn(prarm){
        getCUndrMrk(prarm).then((r: any) => {
            console.log(prarm)
            if (r.code !== 200) {
                // ElMessage.error({ message: r.msg, duration: 6000 });
            } else {

            }
        })
    }
    function getBackClsListUrlFn(prarm){
        getBackClsList(prarm).then((r: any) => {
            console.log(prarm)
            if (r.code !== 200) {
                ElMessage.error({ message: r.msg, duration: 6000 });
            } else {
                setFormItem("cBckOp", {
                    loadData: r['data']
                })
            }
        })
    }
    //给表单下拉项赋值
    function setFormItem(key, obj) {
        if (obj && Object.keys(obj).length) {
            formconfig1.fromSchema?.forEach(item => {
                if (item.prop === key) {
                    Object.assign(item, obj)
                }
            })
        }
    }
    onMounted(() => {
        nextTick(() => {
            setFormItem("cUndrMrk", {
                loadData: [{value: 'A', label: '同意'},
                    {value: 'R', label: '上报'},
                    {value: 'B', label: '退回给出单员'},
                    {value: 'T', label: '退回至指定核保级别人员'}]
            })
            const param={'cProdNo':props.param.cProdNo,'opCde':user.opCde,'companyId':user.companyId,'cAppNo':props.param.cAppNo,'cPlanNo':props.param.cPlanNo}
            getCUndrMrkUrlFn(param);
        });
    });

    defineExpose({
        getFromValue,
        setFormValue,
        validate,
        setValue,
        getValue,
    });
</script>
