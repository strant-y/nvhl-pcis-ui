<template>
  <el-dialog :close-on-click-modal="false"  v-model="dialogVisible"  @close="close" width="90%" title="反洗钱扩展信息">
    <el-config-provider :locale="locale">
      <appExtendInfo  :idxParam="idxParam" :data="data" v-if="controlFlag=='1' || controlFlag == 3" ref="appExtendInfoRef"/>
      <insExtendInfo  :idxParam="idxParam" :data="data" :controlFlag="controlFlag" v-if="controlFlag=='2' || controlFlag == 3" ref="inextendRef" @hasSameInsured="hasSameInsured"/>
    </el-config-provider>
		<div v-if="!saveHidden" style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '保存',
            func: () => {
              save();
            },
          }"
        />
      </div> 
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType, position } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
const appExtendInfo = defineAsyncComponent(() => import("./app-extend-info/app-extend-info.vue"));
const insExtendInfo = defineAsyncComponent(() => import("./ins-extend-info/ins-extend-info.vue"));
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import {
  getButtonByFacKey,
  getFactorList,
  getInputGroupList,
  saveFactor,
  saveKindInfo,
} from "@/api/prod";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  creatCardConfig,
} from "@/shared/mytemplate/card-config";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { dataOpertaor } from "@/store/modules/data-opertaor";
// import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

// const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());


import { useAppStore } from "@/store";
const appStore = useAppStore();
const locale = computed(() => appStore.locale);

const props = defineProps({
  controlFlag:{
    type:String,
    required: true, 
  },
  data: Object,
  type:String,
  idxParam:Object,
  getNo:String,
});

const opertaor = dataOpertaor(props.idxParam?.opertaorProps);
console.log(opertaor)
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
 
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);
const appExtendInfoRef=ref(null);
const inextendRef=ref(null);
const saveHidden=ref(false);
const policyService = new PolicyService();

const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});
const cardConfig = reactive<CardConfig>(
	creatCardConfig({
		title: '投保人-法人扩展信息',
		showMyfromBtm: true
	})
);
onMounted(async () => {
	if (!!props.data?.pageType &&(props.data?.pageType == 'readonly' || props.data?.pageType == 'PLY_UW_PROCESS_SCENE' || props.data?.pageType == 'UW_READ_SCENE')) {
		saveHidden.value = true
		setTimeout(() => {
			appExtendInfoRef?.value?.setDisabledAll(true)
			inextendRef?.value?.setDisabledAll(true)
		},1000)
	}
	if (!!props.data?.cRsnCde && props.data?.cRsnCde == "BH" && !props.getNo) {
		saveHidden.value = true
	}
  if (props.type === "edit" && props.data) {
    setTimeout(() => {
      console.log(989,props.data)
      freeEditRef.value?.setFormValue(props.data);
    }, 50);
  }
});

const close = (type) => {
 
 emits('ok', type)
};

const showDialog = ()=>{
 
  dialogVisible.value = true
}

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
/** 保存 */
const save = async () => {
	let CAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo'];   // 申请单号
	let cPlyNo = opertaor.getDataAll()['applicant']['Applicant.cPlyNo'];   // 保单号
  let CAppTyp = props.data?.cRsnCde == 'BH' ?  'E': 'A'; // CAppTyp：投保单是A,批单是E
  let opCde = JSON.parse(sessionStorage.getItem("user")).opCde;
  let controlFlag = props.controlFlag;
  let params = {
    CAppNo,
    CAppTyp,
    opCde,
    controlFlag,
    appInfo:{
    //   "appFreeEdit ":appfromData,
    //   "appGridEdit ":{
    //     items:[]
    //   }
    },
    insInfo:{
      // "insFreeEdit ":{},
      // "insGridEdit ":{
      //   items:[]
      // }
    }
 
  }
	if (CAppTyp == "E") {
		params.CPlyNo = cPlyNo
	}
  
  // 投保人  获取投保人参数和数据
  let appInfo = null
  if ('1' === controlFlag || '3' === controlFlag) {
    appInfo = await appExtendInfoRef?.value?.getFrom()
    params.appInfo = appInfo
    if(!appInfo || appInfo.appGridEdit.items.length < 1){
      ElMessage.error('请完善投保人必填项信息');
      return false
    }
    
    // 验证投保人表格中的关键字段
    if (appInfo.appGridEdit && appInfo.appGridEdit.items) {
      const requiredFields = [
        { prop: 'cCusLnme', label: '姓' },
        { prop: 'cCusFnme', label: '名' },
        { prop: 'cCerftCls', label: '证件类型' },
        { prop: 'cCerftCde', label: '证件号码' },
        { prop: 'cCerftSex', label: '性别' },
        { prop: 'cCerftBirthday', label: '出生日期' },
        { prop: 'cCerftNation', label: '国籍' },
        { prop: 'tCerftBgnTm', label: '证件有效起期' },
        { prop: 'tCerftEndTm', label: '证件有效止期' },
        // { prop: 'cCusAddr', label: '地址' }
      ];
      
      for (let i = 0; i < appInfo.appGridEdit.items.length; i++) {
        const item = appInfo.appGridEdit.items[i];
        const emptyFields = requiredFields.filter(field => {
          const value = item[field.prop];
          return value === undefined || value === null || value === '';
        });
        
        if (emptyFields.length > 0) {
          const emptyFieldLabels = emptyFields.map(field => field.label).join('、');
          ElMessage.error(`投保人表格第${i + 1}行中以下字段不能为空: ${emptyFieldLabels}`);
          return false;
        }
      }
    }
  }

 // 投保人 被保人
  let insInfo = null
  if(controlFlag  ==='2' ||controlFlag === '3'){
    insInfo = await inextendRef?.value?.getFrom()
    params.insInfo = insInfo
    if(!insInfo || insInfo.insGridEdit.items.length < 1){
      ElMessage.error('请完善被保人必填项信息');
      return false
    }
    
    // 验证被保险人表格中的关键字段
    if (insInfo.insGridEdit && insInfo.insGridEdit.items) {
      // const requiredFields = [
      //   { prop: 'cSurname', label: '姓' },
      //   { prop: 'cName', label: '名' },
      //   { prop: 'cDocumentType', label: '证件类型' },
      //   { prop: 'cIdentificationNumber', label: '证件号码' },
      //   { prop: 'tDocumentValidStart', label: '证件有效起期' },
      //   { prop: 'tDocumentValidEnd', label: '证件有效止期' },
      //   { prop: 'cAddr', label: '地址' }
      // ];
      const requiredFields = [
        { prop: 'cCusLnme', label: '姓' },
        { prop: 'cCusFnme', label: '名' },
        { prop: 'cCerftCls', label: '证件类型' },
        { prop: 'cCerftCde', label: '证件号码' },
        { prop: 'cCerftSex', label: '性别' },
        { prop: 'cCerftBirthday', label: '出生日期' },
        { prop: 'cCerftNation', label: '国籍' },
        { prop: 'tCerftBgnTm', label: '证件有效起期' },
        { prop: 'tCerftEndTm', label: '证件有效止期' },
        // { prop: 'cCusAddr', label: '地址' }
      ];
      
      for (let i = 0; i < insInfo.insGridEdit.items.length; i++) {
        const item = insInfo.insGridEdit.items[i];
        const emptyFields = requiredFields.filter(field => {
          const value = item[field.prop];
          return value === undefined || value === null || value === '';
        });
        
        if (emptyFields.length > 0) {
          const emptyFieldLabels = emptyFields.map(field => field.label).join('、');
          ElMessage.error(`被保险人表格第${i + 1}行中以下字段不能为空: ${emptyFieldLabels}`);
          return false;
        }
      }
    }
  }

  console.log('保存参数',params)


  policyService.saveAMLExtendInfo(params).then((res) => {
    const { code, data, msg } = res;
        if (200 === code) {
            emits("ok", {});
            ElMessage.success("保存成功");
            dialogVisible.value = false;
          } else {
            ElMessage.error(msg);
          }
  })
}

// 同投保人
const hasSameInsured = () => {
	let appInfo = appExtendInfoRef?.value?.getdData()
	const allowedKeys = ["cCusLnme", "cCusFnme", "cCerftCls", "cCerftCde", "cCerftSex", "cCerftBirthday", "cCerftNation", "tCerftBgnTm", "tCerftEndTm", "cCusAddr", "cGrpMrk", "nSeqNo"];
	// 1. 映射出清理后的新数组（深拷贝每个对象的所需字段）
  const cleanedArray = appInfo.appGridEdit.map(item => {
    const cleanedItem = {}
    for (const key of allowedKeys) {
      if (key in item) {
        // 深拷贝：使用 structuredClone（支持嵌套对象/数组）
        cleanedItem[key] = typeof item[key] === 'object' && item[key] !== null
          ? structuredClone(item[key])
          : item[key]
      }
    }
    return cleanedItem
  })
	
	inextendRef?.value?.setData(appInfo, cleanedArray)
}

/* 获取全量表单数据 */
function getFrom() {
  let s = freeEditRef.value?.getFromValue(); //获取表单数据
  if (showBtnConfig.value) {
    s["showExBtn"] = "1";
  } else {
    s["showExBtn"] = "0";
  }
  if (s) {
    const param = Object.assign(s);
    if (props.type === "edit") {
      param["cPkId"] = props.data.cPkId;
    }
    if (freeEditRefBtn.value) {
      let btnjson = freeEditRefBtn.value?.getFromValue();
      btnjson.initid = uuidv4().replace(/-/g, "");
      param["btn"] = btnjson;
    }
    if (tableRef.value) {
      const tabjson = tableRef.value?.getFromValue();
      let selectList = tabjson.filter((item: any) => item.isChecked === "1");
      param["tabjson"] = selectList;
    }
    return param;
  }
}
/** 查询 */
function handleQuery(flag?: boolean) {
	//模拟数据
	pageresult.list = [{
		cOpgrpCnm: '角色名称',
		cName: '图表名称',
		cType: '1',
		cCode: '1',
	}];
	const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
	const s = freeEditRef.value?.getFromValue(); //获取表单数据
	const param = Object.assign(s, r);	
	sysRolechatsMgrService.searchPlan(param)
		.then((res) => {
			const { code, data, msg } = res;
			if (200 === code) {
				pageresult.list = [];
				pageresult.list = data.result;
				pageresult.total = data.total;
			} else {
				//ElMessage.error(msg);
			}
		})
		.finally(() => {});
}

defineExpose({ showDialog });
</script>

<style scoped></style>
