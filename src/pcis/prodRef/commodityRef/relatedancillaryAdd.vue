<template>
    <el-dialog v-model="dialogVisible" title="关联附属信息" width="80%" @update:model-value="handleVisibleUpdate">
        <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />
        <!-- <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
        @selection-change="handleSelectionChange"
      /> -->
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSave">保存</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { saveCommodityAttached } from "@/api/prod";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);

import {
    AppTableConfig,
    AppTableMethod,
    createTableEditConfig,
} from "@/shared/app-table-config";
import { useRoute } from "vue-router";
import { createFreeButtonBase } from "@/shared/button-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";

import { useValidator } from "@/typings/useValidator";
import { descryptParameter, encryptParameter } from "@/utils/encipher";
const { getRules } = useValidator();

const dzmodal = useDzModal();
const opertaor = dataOpertaor();
const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
const tabProref = opertaor.getTableRefByKey("productBasicInfo");
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? descryptParameter(query.value.param) : "{}");
import {
    AppFreeEditConfig,
    AppFreeEditMethod,
    createAppFreeEditConfig,
    createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { ref, reactive } from "vue";
import { on } from "events";

const props = defineProps<{
    // visible: boolean;
    data: object;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const formconfig = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
        title: "新增",
        endBtnsPosition: "right",
        production: false,
        fromSchema: [
            {
                prop: "CCommodityNo",
                inputtype: "rtinput",
                title: "商品编号",
                disabled: true,
                rules: [getRules("required", {})], 
            },
            {
                prop: "CKindNo",
                inputtype: "rtselect",
                title: "险种大类",
                clearable: true,
                typeCode: "KIND_LIST_GRT",
                itemWidth: 1.5,
                codeParam: {
                    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                },
                rules: [getRules("required", {})], 
            },
            {
                prop: "CProdNo",
                inputtype: "rtselect",
                title: "险种名称",
                itemWidth: 1.5,
                typeCode: "PROD_LIST_GRT",
                codeParam: {
                    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                },
                rules: [getRules("required", {})], 
            },
            {
                prop: "NDpdDays",
                inputtype: "rtinput",
                title: "倒签单天数",
                max: 999999,
                min: 0,
            },
            {
                prop: "CPdfStyle",
                inputtype: "rtselect",
                title: "PDF电子保单样式",
                typeCode: 'BAS_COMM_CODE_OUT_CDE',
                codeParam: { 'cParCde': 'PdfStyle' },
            },
        ],
        fromUi: createFromUiConfig({
            cols: 3,
        }),
    })
);

const handleSave =  () => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    const formData = freeEditRef.value?.getFromValue();
    
    const obj = {  CCrtCde:user.opCde,
        CUpdCde:user.opCde,
    }
   
    let param = Object.assign({
        ...formData,...obj
        })

        console.log(param);



    saveCommodityAttached(param)
    .then((res) => {
      const { code, data, msg } = res;
      console.log(data)
      if (200 === code) {
       
        ElMessage.success("保存成功");
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
    // if (formData) {
    //     try {
    //         await saveRiskInfo(formData); //保存接口调用
    //         ElMessage.success("保存成功");
    //     } catch (error) {
    //         ElMessage.error("保存失败");
    //     }
    // }
};

const handleCancel = () => {
    dialogVisible.value = false;
};

const handleVisibleUpdate = (value: boolean) => {
    // emit("update:visible", value);
};
const tableRef = ref<AppTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
    result: "",
    list: [],
    total: 0,
});

const save = ()=> {
  const newparam = { cCommodityNo: param.cCommodityNo };
  saveCommodityAttached(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        // freeEditRef?.value?.setFormValue(data.data);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}

/** 查询 */
// function handleQuery() {
//     const r = tableRef.value?.getPartnerPage(); //获取分页数据
//     const s = freeEditRef.value?.getFromValue(); //获取表单数据
//     const dptCde = JSON.parse(sessionStorage.getItem("user"));
//     const c = tabref.getFromValue().cCommodityNo;
//     // CCommodityNo    companyId
//     const param = {
//         codeListName: "Commodity_PLAN_LIST",
//         codeListParam: {
//             cCommodityNo: props.data['cCommodityNo'] || 'S25000032',    // 商品编号
//             dptCde: dptCde.companyId,     // companyId
//             prodNo: props.data['cProdNo'],
//             status: "1",
//         },
//     };
//     queryPlan(param)
//         .then((res) => {
//             const { code, data, msg } = res;
//             if (200 === code) {
//                 pageresult.list = data;
//                 pageresult.total = data.length;
//             } else {
//                 ElMessage.error(msg);
//             }
//         })
//         .finally(() => { });
// }
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
onMounted(() => {
    // handleQuery(); cCommodityNo
   console.log( tabref.getFromValue(),tabref.getFromValue()['cCommodityNo'])
 
 
  nextTick(() => {
    setValue('CCommodityNo',tabref.getFromValue()['cCommodityNo'])
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

<style scoped>
/* 确保样式与现有组件一致 */
</style>