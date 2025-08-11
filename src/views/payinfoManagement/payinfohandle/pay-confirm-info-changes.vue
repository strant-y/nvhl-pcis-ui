<!-- 缴费类型转换-多条 -->
<template>
    <el-dialog style="position: relative;" :close-on-click-modal="false" v-model="dialogVisible" @close="close"
        width="90%" title="缴费类型转换">
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
    AppFreeEditConfig,
    AppFreeEditMethod,
    createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
    creatCardConfig,
} from "@/shared/mytemplate/card-config";

import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref(userStore.user);


import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { PcisQueryService } from '../service/pcis-query-service';
const pcisQueryService = new PcisQueryService();

const opertaor = dataOpertaor();
opertaor.init();

const props = defineProps({
    data: Object,
    type: String,
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


    // let ss = getFromValue()
    // let numS = 0;

    //     for(let i=0;i<ss.length;i++){
    //         numS += ss[i]['DistSummary.nAnnualSalary']
    //     }

    //     if(totalSalary.value !== numS){
    //         ElMessage.info('数据未保存！');
    //     }

};

// 校验必填项
const checkAnnualSalaries = (data: any) => {

    for (let i = 0; i < data.length; i++) {
        if (data[i]["DistSummary.nAnnualSalary"] === undefined || data[i]["DistSummary.nAnnualSalary"] === null || data[i]["DistSummary.nAnnualSalary"] === '') {
            return true
        }
    }
    return false;
}

const tableconfig = reactive<AppGridEditConfig>(
    createAppGridEditConfig({
        // title: '投保人-客户受益所有人',
        // editList:['CSeqNo','CCusLnme','CCusFnme','TCerftBgnTm','CCusAddr'],
        // showSelection: true,  // 是否显示多选框
        // editFlag: true, //是否可以编辑
        editList: ['cPayTyp',],
        endBtnsPosition: 'right',
        showExpand: true,
        // titleBtns: [
        //     createFreeButtonBase({
        //         type: "primary",
        //         label: "新增",
        //         func: async () => {
        //             freeEditRef.value?.addRowByData({ cGrpMrk: "0" });


        //             // let seleObj = [
        //             //     { cOpgrpCnm: '张', cName: '草人' },
        //             //     { cOpgrpCnm: '张2', cName: '草人' },
        //             //     { cOpgrpCnm: '张3', cName: '草人' },
        //             // ]

        //             // seleObj.forEach((item,index)=>{
        //             // 	tableRef.value?.addRowByData({
        //             // 		cOpgrpCnm: item.cOpgrpCnm,
        //             // 		// cName: freeEditRef.value?.getValue("cUndrClsCde"),
        //             // 	// cStatus: "0",
        //             // 	});	
        //             // })


        //             // tableRef.value?.addRowByData(seleObj);

        //             // tableRef.value?.setFormValue(seleObj)
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
                    saveProdDataFun()
                }
            }),
        ],
        fromSchema: [
            {
                prop: "cPayTyp",
                inputtype: "rtselect",
                title: "缴费类型",
                rules: [getRules("required", {})],
                typeCode: "CHARGE_TYPE_CACHE",
                // loadData: [{"label": "刷卡缴费", "value": "1"},{ "label": "在线支付","value": "18"},{"label": "支票缴费","value": "2"}]
                //   showExpand: true,
                //  fromSchema:[
                //      {
                //             prop: "cPlanDesc",
                //             inputtype: "rtinput",
                //             title: "计划描述",
                //             // rules: [{ required: true, message: "请输入计划描述", trigger: "blur" }]
                //         },
                // ]
                // showExpand: true,
                //         fromSchema: [
                // {
                //     prop: "name",
                //     inputtype: "rtinput",
                //     title: "这是input",
                //     // rules: [{ validator: checkgroup11input, trigger: "blur" }],
                // },]
            },
            {
                prop: "cRegDptCde",
                inputtype: "rtselect",
                title: "机构",
                typeCode: "PLYDPT_LIST",
            },

            {
                prop: "cProdNo",
                inputtype: "rtselect",
                title: "产品",
                typeCode: "PROD_LIST_IN_GUIDE",
                // rules:[getRules("required", {})]
                // rules: [getRules("idCard", {})],
            },
            {
                prop: "cUniqueNo",
                inputtype: "rtinput",
                title: "收据流水号",
            },
            // 折叠-----------
            {
                prop: "cAppTyp",
                expand: true,
                inputtype: "rtselect",
                title: "申请类型：",

                loadData: [
                    { label: '投保', value: "A" },
                    { label: '批改', value: "E" },
                ]
                // type: 'text',
            },
            {
                prop: "cAppNo",
                expand: true,
                inputtype: "rtinput",
                title: "申请单号",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "cPlyNo",
                expand: true,
                inputtype: "rtinput",
                title: "生成保批单号：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "cCardNo",
                expand: true,
                inputtype: "rtinput",
                title: "卡号：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "cChqueNo",
                expand: true,
                inputtype: "rtinput",
                title: "支票号：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "tCrtTm",
                expand: true,
                inputtype: "rtinput",
                title: "保险起期：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "tEndTm",
                expand: true,
                inputtype: "rtinput",
                title: "保险止期：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "tEndTm",
                expand: true,
                inputtype: "rtinput",
                title: "核保时间：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "tChargeTm",
                expand: true,
                inputtype: "rtinput",
                title: "保批单生成时间：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "tPlyedrPrnTm",
                expand: true,
                inputtype: "rtinput",
                title: "打印时间：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "nTax",
                expand: true,
                inputtype: "rtinput",
                title: "车船税：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "tPayConfTm",
                expand: true,
                inputtype: "rtinput",
                title: "缴费确认时间：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "cBankcode",
                expand: true,
                inputtype: "rtinput",
                title: "开户行：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "cProvinces",
                expand: true,
                inputtype: "rtinput",
                title: "省：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },
            {
                prop: "cCity",
                expand: true,
                inputtype: "rtinput",
                title: "市：",
                readOnly: true,
                disabled: true,
                // type: 'text',
            },


        ],
    })
);
onMounted(async () => {
    handleQuery();

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
    // getTableFun();

    let datas = [
        { CUniqueNo: '张三', age: 18, aaa: 'hahahahah' },
        { CUniqueNo: '李四', age: 18, aaa: 'hahahahah' }
    ]

    nextTick(() => {
        // setFormValue(datas)

        // //  opertaor.setDisabledAll();
        // //  freeEditRef.value?.setDisabledAll();
        // setFormItem('type', {
        //     disabled: false,
        // })

    })
    // pageresult.total  =2;
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
const getTableFun = async (isSave = false) => {
    let cAppNo = props.data.cAppNo;  // 申请单号
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
                if (isSave) {
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

function saveProdDataFun() {
    freeEditRef.value?.validate().then((isValid) => {
        if (isValid) {
            // if (this.CRelAppNos) {
            //   ElMessage.warning('所选单据包含联合单，必须联合进行缴费类型转换，是否合并转换？')
            //   return;
            // }
            let s = freeEditRef.value?.getFromValue(); //获取表单数据
            //const param = Object.assign({ type: props.type }, s);
       
            // const data = getFormData().items;
            let typeandno = [];
            s.forEach(item => {
                typeandno.push({ CPayTyp: item['cPayTyp'], CUniqueNo: item['cUniqueNo'] });
            });
            const params = {
                typeandno: typeandno,
                UserId:user.value['opCde']
            };


            // const typeandno = [
            //     {
            //         CPayTyp: s.CPayTyp,
            //         CUniqueNo: props.data.CUniqueNos
            //     }
            // ];

            // const param = {
            //     typeandno: typeandno,
            //     UserId: user.value['opCde']
            // };
            pcisQueryService.changePayType(params)
                .then((res) => {
                    const { code, data, msg } = res;
                    if (200 === code) {
                        emits("ok", {});
                        ElMessage.success("保存成功");
                        dialogVisible.value = false;
                    } else {
                        ElMessage.error(msg);
                    }
                })
                .finally(() => { });
        } else {
            ElMessage.error("请填写必填项");
        }
    });
}


function handleQuery(flag?: boolean) {
    const r = freeEditRef.value//获取分页数据
    const param = {
        CUniqueNo: props.data?.CUniqueNos,
        'CurrentUser': user.value['opCde'],
        'CurrentUserOrg': user.value['companyId'],
        "pageNum": 1, "pageSize": 10
    }
    pcisQueryService.getPayConfirmInfoList(param)
        .then((res) => {
            const { code, data, msg } = res;
            if (200 === code) {
                // pageresult.list = [];
                // pageresult.list = data.result;
                // pageresult.total = data.total;
                let datas = [
                    { name: '张三', age: 18, aaa: 'hahahahah' },
                    { name: '李四', age: 18, aaa: 'hahahahah' }
                ]
                if (data['result']) {
                    setFormValue(data['result'])
                }


            } else {
                ElMessage.error(msg);
            }
        })
        .finally(() => { });
    // }});
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