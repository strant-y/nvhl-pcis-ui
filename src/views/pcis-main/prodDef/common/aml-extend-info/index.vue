<template>
  <el-dialog :close-on-click-modal="false"  v-model="dialogVisible"  @close="close" width="90%" title="反洗钱扩展信息">
		<appExtendInfo  v-if="controlFlag=='1' || controlFlag == 3" ref="appExtendInfoRef"/>
		<insExtendInfo  v-if="controlFlag=='2' || controlFlag == 3" ref="inextendRef"/>
		<div style="margin-top: 20px" :style="{ textAlign: 'right' }">
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
const opertaor = dataOpertaor();

const props = defineProps({
  controlFlag:{
    type:String,
    required: true, 
  },
  data: Object,
  type:String
});

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
  let CAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo'];   // 投保单号
  let CAppTyp =  props.data?.CAppTyp ?  props.data.CAppTyp: 'A'; // CAppTyp：投保单是A,批单是E
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

  
  // 投保人  获取投保人参数和数据
  let appInfo = null
  if ('1' === controlFlag || '3' === controlFlag) {
    appInfo = await appExtendInfoRef?.value?.getFrom()
    params.appInfo = appInfo
    if(!appInfo){
      return false
    }
  }

 // 投保人 被保人
  let insInfo = null
  if(controlFlag  ==='2' ||controlFlag === '3'){
    insInfo = await inextendRef?.value?.getFrom()  
    params.insInfo = insInfo
    if(!insInfo){
      return false
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
