<template>
    <el-dialog v-model="dialogVisible" title="修改别名" width="80%" @update:model-value="handleVisibleUpdate">
        <app-free-edit v-model:freeEditConfig="formconfig" ref="freeEditRef" />

        <app-grid-edit v-model:gridEditConfig="tableconfig2" ref="freeEditRef2" />
        <!-- <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
    
      /> -->
      <!-- @page-change="handleQuery(false)"
      @selection-change="handleSelectionChange" -->
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
import { saveCommodityAttached,queryPlanCvrgByCommodityNo } from "@/api/prod";
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
const { getRules } = useValidator();

const dzmodal = useDzModal();
const opertaor = dataOpertaor();
const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
const tabProref = opertaor.getTableRefByKey("productBasicInfo");
const route = useRoute();
const query = ref(route.query);
const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
const emits = defineEmits(["ok", "cancel"]);
import {
    AppFreeEditConfig,
    AppFreeEditMethod,
    createAppFreeEditConfig,
    createFromUiConfig,
} from "@/shared/app-free-edit-config";

import {
    AppGridEditConfig,
    AppGridEditMethod,
    createAppGridEditConfig,
    createGridFromUiConfig,
} from "@/shared/app-grid-edit-config";
import { ref, reactive } from "vue";
import { on } from "events";

const props = defineProps<{
    // visible: boolean;
    data: object;
}>();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
    const freeEditRef2 = ref<AppGridEditMethod | null>(null);
const formconfig = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
        title: "修改方案别名",
        endBtnsPosition: "right",
        production: false,
        fromSchema: [
            {
                prop: "CCommodityNo",
                inputtype: "rtinput",
                title: "商品编号",
                disabled: true,
                itemWidth: 1.5,
                rules: [getRules("required", {})], 
            },

            {
                prop: "CCommodityCn",
                inputtype: "rtinput",
                title: "商品名称",
                itemWidth: 1.5,
                disabled: true,
                rules: [getRules("required", {})], 
            },

            {
                prop: "CPlanNo",
                inputtype: "rtinput",
                itemWidth: 1.5,
                title: "方案编号",
                disabled: true,
                rules: [getRules("required", {})], 
            },

            {
                prop: "CPlanCn",
                inputtype: "rtinput",
                itemWidth: 1.5,
                title: "方案名称",
                disabled: true,
                rules: [getRules("required", {})], 
            },

            {
                prop: "CDispNme",
                inputtype: "rtinput",
                itemWidth: 1.5,
                title: "方案别名",
                rules: [getRules("required", {})], 
            },

            {
                prop: "NMaxPieces",
                inputtype: "rtinput",
                title: "份数上限（含）",
                itemWidth: 1.5,
                rules: [getRules("required", {})], 
            },

            {
                prop: "COldPlanNo",
                inputtype: "rtinput",
                title: "原短意险系统方案号",
                itemWidth: 1.5,
                rules: [getRules("required", {})], 
            },

            {
                prop: "CIsGroup",
                inputtype: "rtselect",
                title: "可出团/个单",
                itemWidth: 1.5,
                loadData: [
                        {value: '1', label: '个单'},
                        {value: '2', label: '团单'},
                        {value: '3', label: '通用'}
                    ],
                rules: [getRules("required", {})], 

            },
            {
                prop: "CSaleName",
                inputtype: "rtinput",
                itemWidth: 1.5,
                title: "销售名称",
                rules: [getRules("required", {})], 
            },
        ],
        fromUi: createFromUiConfig({
            cols: 3,
        }),
    })
);

const tableconfig2 = reactive<AppGridEditConfig>(
    createAppGridEditConfig({
        title: '修改险别别名',
        // editList:['CSeqNo','CCusLnme','CCusFnme','TCerftBgnTm','CCusAddr'],
        // showSelection: true,  // 是否显示多选框
        editFlag: true, //是否可以编辑
        // editList:['cOpgrpCnm','cName'],
        endBtnsPosition: 'right',
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

      emits('ok',)
      if (200 === code) {
       
        ElMessage.success("保存成功");
        
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });

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
  console.log("param", sessionStorage.getItem("user"));
  const newparam = { cCommodityNo: param.cCommodityNo };
  saveCommodityAttached(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      console.log('--数据---',data)
      if (200 === code) {
        // freeEditRef?.value?.setFormValue(data.data);
      } else {
        ElMessage.error(msg);
      }
    }).finally(() => { });
}

/** 查询 */
function handleQuery() {

    let param = {
        commodityNo: tabref.getFromValue().cCommodityNo,
        planNo: props.data['CPlanNo']
    }

    queryPlanCvrgByCommodityNo(param)
        .then((res) => {
            const { code, data, msg } = res;
            console.log('查询数据反显',res);
            setValue('CCommodityNo','123123')
            if(code == 200){
             
                // CCommodityNo
            }else{
                ElMessage.error(msg);
            }
        })

}
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
    handleQuery(); 
//    console.log( tabref.getFromValue(),tabref.getFromValue()['cCommodityNo']) cCommodityNo
// console.log('----',props.data)
 
 
//   nextTick(() => {
//     // setValue('CCommodityNo',tabref.getFromValue()['cCommodityNo'])
//   });
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