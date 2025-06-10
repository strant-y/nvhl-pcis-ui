<!-- 变更联共保保单编号 -->
<template>
    <el-dialog style="position: relative;" :close-on-click-modal="false" v-model="dialogVisible" @close="close"
        width="90%" title="变更联共保保单编号">
        <app-grid-edit v-model:gridEditConfig="tableconfig" ref="freeEditRef" />
    </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";

import {
    AppGridEditConfig,
    AppGridEditMethod,
    createAppGridEditConfig,
    createGridFromUiConfig,
} from "@/shared/app-grid-edit-config";

import {
    creatCardConfig,
} from "@/shared/mytemplate/card-config";
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
opertaor.init();
const props = defineProps({
    cAppNo:String
    // data: Object,
    // type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
import { conforms, forEach } from "lodash";
const showBtnConfig = ref(false);
const showView = ref(false);
const freeEditRef = ref<AppGridEditMethod | null>(null);
const appTableShow = ref(false);
const policyService = new PolicyService();
const dialogVisible = ref(true);
let totalSalary = ref(0);    // 总金额
const schemaMap = reactive<Record<string, any>>({
    rtinputgroup: [],
});
const cardConfig = reactive<CardConfig>(
    creatCardConfig({
        // title: '投保人-法人扩展信息',
        showMyfromBtm: true
    })
)
const pageresult = reactive<Pageresult>({
    result: "",
    /** 数据列表 */
    list: [
            ],
    /** 总数 */
    total: 0,
});

const close = (type) => {
    let ss = getFromValue()
    let numS = 0;
 
        for(let i=0;i<ss.length;i++){
            numS += ss[i]['DistSummary.nAnnualSalary']
        }
        if(totalSalary.value !== numS){
            ElMessage.info('数据未保存！');
        }

};

// 校验必填项
const checkAnnualSalaries = (data: any) => {
    for (let i = 0; i < data.length; i++) {
        if (  data[i]["DistSummary.nAnnualSalary"] === undefined || data[i]["DistSummary.nAnnualSalary"] === null || data[i]["DistSummary.nAnnualSalary"] === '') {
            return true
        }
    }
    return false;
}

const tableconfig = reactive<AppGridEditConfig>(
    createAppGridEditConfig({
        title: '联共保信息',
        // editList:['CSeqNo','CCusLnme','CCusFnme','TCerftBgnTm','CCusAddr'],
        // showSelection: true,  // 是否显示多选框
        editFlag: true, //是否可以编辑
        // editList:['cOpgrpCnm','cName'],
        endBtnsPosition: 'right',
        // titleBtns: [
        //     createFreeButtonBase({
        //         type: "primary",
        //         label: "新增",
        //         func: async () => {
        //             freeEditRef.value?.addRowByData({ cGrpMrk: "0" });
        //         },
        //     }),
        //     createFreeButtonBase({
        //         type: "primary",
        //         label: "删除",
        //         func: async () => {
        //             const selData = freeEditRef?.value?.getSelectRow();
        //             if (!selData) {
        //                 ElMessage.error("请选择要删除的数据!");
        //                 return;
        //             }
        //             const editIndex = selData["_dataId"];
        //             freeEditRef?.value?.delRow(editIndex);
        //         },
        //     })
        // ],
        endBtns: [
            createFreeButtonBase({
                "size": "default",
                "label": "保存",
                "type": "primary",
                func: async (v: any) => {
                    // 校验 必填项是否必填
                    // if (checkAnnualSalaries(getFromValue())) {
                    //     ElMessage.error('年工资总额为必填项，请填写齐全！')
                    //     return false
                    // }
                    saveProdDataFun()
                }
            }),
        ],
        fromSchema: [
        // 			
            {
                prop: "DistSummary.cPlanNo",
                inputtype: "rtinput",
                title: "序号",
            },
            {
                prop: "DistSummary.nInsuredHeadcount",
                inputtype: "rtinput",
                title: "共保公司",
            },

            {
                prop: "DistSummary.nAnnualSalary",
                inputtype: "rtinput",
                title: "分公司",
            },
            {
                prop: "DistSummary.cJobRole",
                inputtype: "rtinput",
                title: "保单编号",
            }
        ],
    })
);
onMounted(async () => {
    // if (props.data.cRegisteredLogo == 1) {
    //     tableconfig.titleBtns = []
    //     setFormItem('DistSummary.cPlanNo', {
    //         disabled: true,
    //     })
    //     setFormItem('DistSummary.nInsuredHeadcount', {
    //         disabled: true,
    //     })
    //     setFormItem('DistSummary.nAnnualSalary', {
    //         disabled: true,
    //     })
    // } else {
    //     setFormItem('DistSummary.cPlanNo', {
    //         disabled: false,
    //     })
    //     setFormItem('DistSummary.nInsuredHeadcount', {
    //         disabled: false,
    //     })
    //     setFormItem('DistSummary.nAnnualSalary', {
    //         disabled: false,
    //     })
    // }
    getTableFun();
});

// 收益所有人table信息
const getTableFun = async (isSave=false) => {
    let cAppNo = props.data.cAppNo;  // 投保单号
    let cRegisteredLogo = props.data.cRegisteredLogo;   // 
    let param = {
        cAppNo,
        cRegisteredLogo

    };
    policyService.selectTotalSalary(param).then((response) => {
        let { code, data, msg } = response
        if (code === 200) {
            if (data['data']) {
                totalSalary.value = data.totalSalary;
                setFormValue(data['data'])
                // 如果保存成功就进行关闭 并且传值
                if(isSave){
                    dialogVisible.value = false;
                    emits("ok", data.totalSalary)
                }
            }
        } else {
            ElMessage.error(msg);
        }
    }).catch(() => {
        // ElMessage.error('根据申请单号获取发票信息出现异常！1');
    });
}


// 保存
const saveProdDataFun = () => {

    console.log('保存')
    return  false;
    let cAppNo = props.data.cAppNo;  // 投保单号
    let cRegisteredLogo = props.data.cRegisteredLogo;
    let param = Object.assign({
        cAppNo,
        cRegisteredLogo

    }, { data: getFromValue() });

    policyService.saveTotalSalary(param).then((response) => {
        let { code, data, msg } = response
        if (code === 200) {
            ElMessage.success('保存成功！')
            getTableFun(true)
        } else {
            ElMessage.error(msg);
        }
    }).catch(() => {
        // ElMessage.error('根据申请单号获取发票信息出现异常！');
    });
}


// 绑定方法
const method = {
    func1: () => {
    },
};
function getFromValue() {
    return freeEditRef?.value?.getFromValue();
}
//给表单下拉项赋值
function setFormItem(prop: string, config: any) {
    tableconfig.fromSchema?.forEach((item) => {
        if (item.prop === prop) {
            Object.assign(item, config);
        }
    });
}
function setFormValue(value: any) {
    freeEditRef?.value?.setFormValue(value);
}

function validate() {
    return freeEditRef?.value?.validate();
}

function getTableValue(rowId: number, key: string) {
    freeEditRef?.value?.getTableValue(rowId, key);
}
defineExpose({
    getFromValue,
    setFormValue,
    validate,
    getTableValue,
});
</script>
<style scoped></style>