<!-- 工资总额信息 -->
<template>
    <el-dialog style="position: relative;" :close-on-click-modal="false" v-model="dialogVisible" @close="close"
        width="90%" title="工资总额信息">
        <app-grid-edit v-model:gridEditConfig="tableconfig" ref="freeEditRef" />
        <div style=" position: absolute; bottom: 41px; left: 30px; font-size: 18px; " v-if="totalSalary > 0"> 工资总额 ： {{
            totalSalary }}</div>
    </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";

import {
    AppGridEditConfig,
    AppGridEditMethod,
    createAppGridEditConfig,
} from "@/shared/app-grid-edit-config";
import {
    creatCardConfig,
} from "@/shared/mytemplate/card-config";


import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { dataOpertaor } from "@/store/modules/data-opertaor";

const route = useRoute();
const idxParam: IdxParamProps = {
  opertaorProps: { id: route.name },
  cdeListViewProps: { id: route.name },
};
provide(idxParamKey, idxParam);
const opertaor = dataOpertaor(idxParam.opertaorProps);
opertaor.init();


const props = defineProps({
    data: Object,
    type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
import { conforms, forEach } from "lodash";
import {useRoute} from "vue-router";
import {idxParamKey, IdxParamProps} from "@/views/pcis/support/useIdxParam";
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
            // ElMessage.info('数据未保存！');
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
        title: '投保雇员年工资总额',
        // editList:['CSeqNo','CCusLnme','CCusFnme','TCerftBgnTm','CCusAddr'],
        // showSelection: true,  // 是否显示多选框
        editFlag: true, //是否可以编辑
        // editList:['cOpgrpCnm','cName'],
        endBtnsPosition: 'right',
        titleBtns: [
            createFreeButtonBase({
                type: "primary",
                label: "新增",
                id: "add",
                size: "small",
                func: async () => {
                    freeEditRef.value?.addRowByData({ cGrpMrk: "0" });


                    // let seleObj = [
                    //     { cOpgrpCnm: '张', cName: '草人' },
                    //     { cOpgrpCnm: '张2', cName: '草人' },
                    //     { cOpgrpCnm: '张3', cName: '草人' },
                    // ]

                    // seleObj.forEach((item,index)=>{
                    // 	tableRef.value?.addRowByData({
                    // 		cOpgrpCnm: item.cOpgrpCnm,
                    // 		// cName: freeEditRef.value?.getValue("cUndrClsCde"),
                    // 	// cStatus: "0",
                    // 	});	
                    // })


                    // tableRef.value?.addRowByData(seleObj);

                    // tableRef.value?.setFormValue(seleObj)
                },
            }),
            createFreeButtonBase({
                type: "primary",
                label: "删除",
                id: "delete",
                size: "small",
                func: async () => {
                    const selData = freeEditRef?.value?.getSelectRow();
                    if (!selData) {
                        ElMessage.error("请选择要删除的数据!");
                        return;
                    }
                    const editIndex = selData["_dataId"];
                    freeEditRef?.value?.delRow(editIndex);


                },
            })


        ],
        endBtns: [
            createFreeButtonBase({
                "size": "default",
                "label": "保存",
                "type": "primary",
                func: async (v: any) => {
                    // 校验 必填项是否必填
                    if (checkAnnualSalaries(getFromValue())) {
                        ElMessage.error('年工资总额为必填项，请填写齐全！')
                        return false
                    }
                    saveProdDataFun()


                    // }else{
                    //     saveProdDataFun()
                    // }


                }
            }),
        ],
        fromSchema: [
            {
                prop: "DistSummary.cPlanNo",
                inputtype: "rtinput",
                title: "方案号",
            },
            {
                prop: "DistSummary.nInsuredHeadcount",
                inputtype: "rtinput",
                title: "投保雇员人数",
            },

            {
                prop: "DistSummary.nAnnualSalary",
                inputtype: "rtinput",
                title: "年工资总额（必填）元",
                // rules:[getRules("required", {})]
                // rules: [getRules("idCard", {})],
            },
            {
                prop: "DistSummary.cJobRole",
                inputtype: "rtinput",
                title: "岗位（非必填）",
            }
        ],
    })
);
onMounted(async () => {
    if (props.data?.cRegisteredLogo == 1) {
        tableconfig.titleBtns = []
        setFormItem('DistSummary.cPlanNo', {
            disabled: true,
        })
        setFormItem('DistSummary.nInsuredHeadcount', {
            disabled: true,
        })
        setFormItem('DistSummary.nAnnualSalary', {
            disabled: true,
        })
    } else {
        setFormItem('DistSummary.cPlanNo', {
            disabled: false,
        })
        setFormItem('DistSummary.nInsuredHeadcount', {
            disabled: false,
        })
        setFormItem('DistSummary.nAnnualSalary', {
            disabled: false,
        })
    }
    getTableFun();

    //     let CAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo'];   // 申请单号

    //     policyService.getAMLExtendInfoByAppNo(CAppNo,'Applicant').then((response) => {
    //         let {code, data} = response
    //     if (code === 200) {
    //       if (response.data) {

    //       }
    //     } else {
    //       ElMessage.error('根据申请单号获取发票信息出现异常！');
    //     }
    //   }).catch(() => {
    //     ElMessage.error('根据申请单号获取发票信息出现异常！');
    //   });


});


// 收益所有人table信息
const getTableFun = async (isSave=false) => {
    let cAppNo = props.data.cAppNo;  // 申请单号
    let cRegisteredLogo = props.data.cRegisteredLogo;   // 
    let param = {
        cRegisteredLogo
    };
    if(props.data?.pageName === 'priceInquiry'){
        param.cInquiryNo = props.data.cInquiryNo;  // 询价单号
    } else {
        param.cAppNo = cAppNo
    }
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
    let cAppNo = props.data.cAppNo;  // 申请单号
    let cRegisteredLogo = props.data.cRegisteredLogo;
    let param:any = Object.assign({
        cRegisteredLogo

    }, { data: getFromValue() });

    param.cAppNo = cAppNo
    if(props.data?.pageName === 'priceInquiry'){
        param.cInquiryNo = props.data.cInquiryNo;  // 询价单号
    }

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