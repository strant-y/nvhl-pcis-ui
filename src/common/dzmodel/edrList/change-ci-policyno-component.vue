<!-- 变更联共保保单编号 -->
<template>
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef" />
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
import { PcisEdrQueryService } from "../../../views/edr-qry-endorse-list/service/pcis-edr-query-service";
import {
    AppTableConfig,
    AppTableMethod,
    createTableEditConfig,
} from "@/shared/app-table-config";

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

const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel","handleClose"]);
import { conforms, forEach } from "lodash";
const freeEditRef = ref<AppGridEditMethod | null>(null);
const pcisEdrQueryService = new PcisEdrQueryService();

const tableRef = ref<AppTableMethod | null>(null);

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
const tableconfig = reactive<AppTableConfig>(
    createTableEditConfig({
        title: "联共保信息",
        editFlag: true,
        isPage: 'true',
        editList: ["cPolicyNo"],
        endBtnsPosition: 'right',
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
                prop: "nSeqNo",
                inputtype: "rtinput",
                title: "序号",
                minWidth: 180,
            },
            {
                prop: "cCoinsurerCde",
                inputtype: "rtselect",
                typeCode: 'Comm_Code_LIST',
                //   codeParam: {'CParCde': 'subdpt'},
                codeParam: { 'CParCde': '327' },
                title: "共保公司",
                minWidth: 180,
                func: (v: any, row: any) => {
                },
            },
            {
                prop: "cCiSubComp",
                inputtype: "rtselect",
                typeCode: "Comm_Code_LIST",
                codeParam: { "CParCde": "subdpt" },
                title: "分公司",
                minWidth: 180,
                disabled: true,
            },
            {
                prop: "cPolicyNo",
                inputtype: "rtinput",
                title: "保单编号",
                clearable: true,
                minWidth: 260,
                func: (val: string, row: any) => {
                    if (val) {
                        // 检查是否只包含数字
                        // if (!/^\d+$/.test(val)) {
                        if (!/^[A-Z0-9]+$/.test(val))
                            ElMessage.warning('保单编号只能包含数字和大写字母');
                            // 清空当前输入值
                            if (row && row._dataId) {
                                tableRef.value?.setValueByRowKey("cPolicyNo", row._dataId, "");
                            }
                            return;
                        }
                        // 检查长度是否超过20位
                        if (val.length > 30) {
                            ElMessage.warning('保单编号不能超过30位');
                            // 清空当前输入值
                            if (row && row._dataId) {
                                tableRef.value?.setValueByRowKey("cPolicyNo", row._dataId, "");
                            }
                            return;
                        }
                    }
                },
            },
        ],
    })
);
onMounted(async () => {
    getTableFun();
});

// 收益所有人table信息
const getTableFun = async (isSave = false) => {
    let cAppNo = props.data.cAppNo;  // 申请单号
    let cPlyNo = props.data.cPlyNo;  // 保单号
    let param = {
        cAppNo,
        cPlyNo
    };
    pcisEdrQueryService.getEdrCiRel(param).then((response: any) => {
        let { code, data, msg, res } = response;
        if (200 === code) {
            if (res['result']) {
                pageresult.list = res['result'];
                pageresult.total = res['total'];
                nextTick(() => {
                    for (let i = 0; i < pageresult.list.length; i++) {
                        const newCodeParam = pageresult.list[i].cCoinsurerCde === '327001' 
                            ? { "CParCde": "subdpt" } 
                            : { "CParCde": "66" };
                        
                        tableRef.value?.setFormSchema(
                            pageresult.list[i]._dataId, 
                            "cCiSubComp", 
                            "codeParam", 
                            newCodeParam
                        );
                        if (pageresult.list[i].cCoinsurerCde == '327001') {
                            tableRef.value?.setFormSchema(pageresult.list[i]._dataId, "cPolicyNo", 'disabled', true);

                        } else {
                            tableRef.value?.setFormSchema(pageresult.list[i]._dataId, "cPolicyNo", 'disabled', false);
                        }
                    }

                })
            }
        }
    });
}


// 保存
const saveProdDataFun = () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    let cAppNo = props.data.cAppNo;  // 申请单号
    let cPlyNo = props.data.cPlyNo;  // 保单号
    let listS = pageresult.list;

    listS.forEach((item) => {
        item.cAppNo = cAppNo;
        item.cPlyNo = cPlyNo;
        item.cUpdCde = user.opCde;
    })
    let param = {
        items: listS
    };
    pcisEdrQueryService.updateEdrCiInfoByPkId(param).then((response) => {
        let { code, data, msg } = response
        if (code === 200) {
            ElMessage.success('保存成功！')
            emits("handleClose");
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