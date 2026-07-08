<template>
  <el-dialog v-model="dialogVisible" width="90%" :title="props.title" class="system-dialog-scroll">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }" v-if=" !(props.type === 'view')">
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
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted, computed  } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { SysOrgEmpMgrService } from '@/views/sys-right-basic/service/sys-org-emp-mgr.service';

const props = defineProps({
  data: Object,
  type: String,
  title: String,
  cDptCde: String, //机构代码
  cEmpCde: String, //员工代码

});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
import { v4 as uuidv4 } from "uuid";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const sysOrgEmpMgrService = new SysOrgEmpMgrService();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);
// 定义一个计算属性
const isDisabled = computed(() => {
  return props.type === "view" ? true : false
});
const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    fromSchema: [
      {
        prop: 'cEmpCde',
        title: '员工编码',
        inputtype: "rtinput",
        rules: [getRules("required", {})],
        disabled: isDisabled,
      },
      {
        prop: 'cHrCde',
        title: '人事员工编码',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cEmpCnm',
        title: '员工名称',
        inputtype: "rtinput",
        rules: [getRules("required", {})],
        disabled: isDisabled,
      },
      {
        prop: 'cEmpEnm',
        title: '英文名称',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cDptCde',
        title: '机构名称',
        inputtype: "rtselect",
        typeCode: "EMP_DPT_LIST_NOCACHE",
        disabled: true,
        rules: [getRules("required", {
          trigger: 'change'
        })]
      },
      {
        prop: 'cSex',
        title: '性别',
        inputtype: "rtselect",
        typeCode: "Sex_List",
        disabled: isDisabled,
      },
      {
        prop: 'tBirthday',
        title: '出生日期',
        inputtype: "rtdatepicker",
        type: "date",
        disabled: isDisabled,
      },
      {
        prop: 'cPrtyTyp',
        title: '党派',
        inputtype: "rtselect",
        typeCode: "PARTISAN_LIST_CACHE",
        disabled: isDisabled,
      },
      {
        prop: 'cMajorCde',
        title: '专业',
        inputtype: "rtselect",
        typeCode: "MAJOR_LIST_CACHE",
        disabled: isDisabled,
      },
      {
        prop: 'cMrgCde',
        title: '婚姻状况',
        inputtype: "rtselect",
        typeCode: "MARITAL_STATUS_LIST_CACHE",
        disabled: isDisabled,
      },
      {
        prop: 'cNtnCde',
        title: '民族',
        inputtype: "rtselect",
        typeCode: "NATION_LIST_CACHE",
        disabled: isDisabled,
      },
      {
        prop: 'cTitleCde',
        title: '职称',
        inputtype: "rtselect",
        typeCode: "TITLE_LIST_CACHE",
        disabled: isDisabled,
      },
      {
        prop: 'cEduCde',
        title: '学历',
        inputtype: "rtselect",
        typeCode: "Eduback",
        disabled: isDisabled,
      },
      {
        prop: 'cDreCde',
        title: '学位',
        inputtype: "rtselect",
        typeCode: "DEGREE_LIST_CACHE",
        disabled: isDisabled,
      },
      {
        prop: 'cCtfctTyp',
        title: '证件类型',
        inputtype: "rtselect",
        typeCode: "NATURAL_CERTIFICATE_CACHE",
        disabled: isDisabled,
   
      },
      {
        prop: 'cCtfctNo',
        title: '证件号码',
        inputtype: "rtinput",
        rules: [getRules("required", {})],
        disabled: isDisabled,
      },
      {
        prop: 'cHobby',
        title: '爱好特长',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cTel',
        title: '联系电话',
        inputtype: "rtinput",
        rules: [getRules("phone", {})],
        disabled: isDisabled,
      },
      {
        prop: 'cMobile',
        title: '手机',
        inputtype: "rtinput",
        rules: [getRules("phoneNo", {})],
        disabled: isDisabled,
      },
      {
        prop: 'cEmail',
        title: '邮箱',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cZipCde',
        title: '邮编',
        inputtype: "rtinput",
        rules: [getRules("required", {}), getRules("signlessInt", {}), getRules("specifyLength", {len: 6})],
        disabled: isDisabled,
      },
      {
        prop: 'tEntTm',
        title: '入司时间',
        inputtype: "rtdatepicker",
        type: "date",
        disabled: isDisabled,
      },
      {
        prop: 'tRegTm',
        title: '转正时间',
        inputtype: "rtdatepicker",
        type: "date",
        disabled: isDisabled,
      },
      {
        prop: 'tLevTm',
        title: '离司时间',
        inputtype: "rtdatepicker",
        type: "date",
        disabled: isDisabled,
      },
      {
        prop: 'cEmpDoc',
        title: '个人档案',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cGrntCde1',
        title: '担保人代码',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cGrntCde2',
        title: '工作经历',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cRegist',
        title: '户口所在地',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cHomeAddr',
        title: '住址',
        inputtype: "rtinput",
        disabled: isDisabled,
      },
      {
        prop: 'cRemark',
        title: '备注',
        inputtype: "rtinput",
        type: 'textarea',
        rows: '3',
        disabled: isDisabled,
      },
      // {
      //   prop: 'cIsValid',
      //   inputtype: "rtinput",
      //   type: "hidden",
      //   defaultValue: '1'
      // },
    ]
  })
);

onMounted(async () => {
  if (props.type === "update" || props.type === "view") {
		// 获取IE员工详情
		const paramss = {
      CEmpCde: props.cEmpCde
		};
		const getEmpDatas = sysOrgEmpMgrService.loadOrgEmpInfo(paramss);
		getEmpDatas.then((res: any) => {
				if (null != res && null != res['code']) {
						if (res['code'] === 200) {
								const usermsg = res['data'];
								nextTick(()=>{
									freeEditRef.value?.setFormValue(usermsg);
								})
						}
				}
		});
  }
  if(props.type === "add"){
    nextTick(()=>{
      freeEditRef.value?.setValue('cDptCde', props.cDptCde);
    })
  }
});

// 绑定方法
const method = {
  func1: () => {
  },
};
/** 查询 */
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      //const formParam = getFrom();
      let s = freeEditRef.value?.getFromValue(); 
      const param = Object.assign({ type: props.type, cIsValid: '1' }, s);
      sysOrgEmpMgrService.saveOrgEmpInfo(param)
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
        .finally(() => {});
    } else {
      ElMessage.error("请填写必填项");
    }
  });
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
    if (props.type === "update") {
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

</script>

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}
</style>
