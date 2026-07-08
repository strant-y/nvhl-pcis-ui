<template>
  <el-dialog v-model="dialogVisible" width="90%" :title="title" class="system-dialog-scroll">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
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
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useUserStore } from "@/store/modules/user";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { SysOrgDptMgrService } from '@/views/sys-right-basic/service/sys-org-dpt-mgr.service';
const sysOrgDptMgrService = new SysOrgDptMgrService();

const props = defineProps({
  data: Object,
  type: String,
  getDptCde: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const userStore = useUserStore();
import { v4 as uuidv4 } from "uuid";
const showBtnConfig = ref(false);
const dialogVisible = ref(true);
const showView = ref(false);
const title = ref('');
let id = 0;
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const freeLookRef = ref<AppFreeEditMethod | null>(null);
const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const appTableShow = ref(false);
let cProvinceParams = reactive({'cParCde': '', 'cType': '1'});
let cCityParams = reactive({'cParCde': '', 'cType': '2'});
let cCountyParams = reactive({'cParCde': '', 'cType': '3'});
let address = reactive({
  country: '',
  province: '',
  city: '',
  county: '',
  addr:''
})
const user = ref(userStore.user);
const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '',
    fromSchema: [
      {
        prop: 'cDptCde',
        title: '机构代码',
        inputtype: "rtinput",
        rules: [getRules("required", {}), getRules("signlessInt", {}), getRules("specifyLength", {len: 9})],
        func: (val)=>{
          freeEditRef.value?.setValue('cDptSerno', val)      
        }
      },
      {
        prop: 'cDptDispCde',
        title: '机构显示代码',
        inputtype: "rtinput",
        rules: [getRules("required", {})]
      },
      {
        prop: 'cDptAbr',
        title: '机构名称简称',
        inputtype: "rtinput",
        rules: [getRules("required", {})]
      },
      {
        prop: 'cDptOutCde',
        title: '机构外部码',
        inputtype: "rtinput"
      },
      {
        prop: 'cDptFnm',
        title: '机构名称全称',
        inputtype: "rtinput",
        rules: [getRules("required", {})]
      },
      {
        prop: 'cDptEnm',
        title: '英文名称',
        inputtype: "rtinput"
      },
      {
        prop: 'nDptLevl',
        title: '机构级别',
        inputtype: "rtinput",
        rules: [getRules("required", {})]
      },
      {
        prop: 'cSnrDpt',
        title: '上级机构',
        inputtype: "rtselect",
        typeCode: "EMP_DPT_LIST_CACHE",
        disabled: true
      },
      {
        prop: 'cCtctPrsn',
        title: '联系人',
        inputtype: "rtinput"
      },
      {
        prop: 'cBoss',
        title: '负责人',
        inputtype: "rtinput"
      },
      {
        prop: 'cDptXzqh',
        title: '行政区划',
        inputtype: "rtinput"
      },
      {
        prop: 'cBassSerno',
        title: '基础流水号',
        inputtype: "rtinput"
      },
      {
        prop: 'cTel',
        title: '联系人电话',
        inputtype: "rtinput",
        rules: [getRules("phone", {})]
      },
      {
        prop: 'cRptTel',
        title: '报案咨询电话',
        inputtype: "rtinput",
        rules: [getRules("phone", {})]
      },
      {
        prop: 'cZipCde',
        title: '邮编',
        inputtype: "rtinput",
        rules: [getRules("required", {}), getRules("signlessInt", {}), getRules("specifyLength", {len: 6})]
      },
      {
        prop: 'cConsTel',
        title: '业务咨询电话',
        inputtype: "rtinput"
      },
      {
        prop: 'tFndTm',
        title: '成立时间',
        inputtype: "rtdatepicker",
        type: "date",
      },
      {
        prop: 'cVchDptMrk',
        title: '单证管理机构标志',
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        params: {'cParCde': 'yes_no'}
      },
      {
        prop: 'cSrvyDptMrk',
        title: '理赔查勘机构标志',
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        params: {'cParCde': 'yes_no'}
      },
      {
        prop: 'cSignDptMrk',
        title: '承保出单机构标志',
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        params: {'cParCde': 'yes_no'}
      },
      {
        prop: 'cAcctDptMrk',
        title: '财务做账机构标志',
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        params: {'cParCde': 'yes_no'}
      },
      {
        prop: 'cDptCls',
        title: '机构类型',
        inputtype: "rtselect",
        loadData: [{ value: '1', label: '机构' }, { value: '2', label: '部门' }, { value: '3', label: '室' }],
        rules: [getRules("required", {
          trigger: 'change'
        })]
      },
      {
        prop: 'cLcnAbr',
        title: '车牌号简称',
        inputtype: "rtinput"
      },
      {
        prop: 'cDptSerno',
        title: '机构流水号',
        inputtype: "rtinput",
        disabled: true,
        rules: [getRules("required", {
          trigger: 'change'
        }), getRules("signlessInt", {})]
      },
      {
        prop: 'cDptaccCde',
        title: '做账机构',
        inputtype: "rtinput"
      },
      {
        prop: 'cClmDptCde',
        title: '理赔机构',
        inputtype: "rtinput"
      },
      {
        prop: 'cDptAttr',
        title: '部门属性',
        inputtype: "rtselect",
        typeCode: 'DPT_ATTR_LIST_CACHE',
        rules: [getRules("required", {
          trigger: 'change'
        })]
      },
      {
        prop: 'cBnsrgstNo',
        title: '工登记号',
        inputtype: "rtinput",
        rules: [getRules("signlessInt", {})]
      },
      {
        prop: 'cPlyPrnInsr',
        title: '保单打印保险人',
        inputtype: "rtinput"
      },
      {
        prop: 'cInsprmtNo',
        title: '保险许可证号',
        inputtype: "rtinput",
        rules: [getRules("signlessInt", {})]
      },
      {
        prop: 'cTaxrgstNo',
        title: '税务登记号',
        inputtype: "rtinput",
        rules: [getRules("signlessInt", {})]
      },
      {
        prop: 'cAlarmMrk',
        title: '风险标识',
        inputtype: "rtselect",
        typeCode: 'WEB_SYS_STA_DICT',
        params: {'cParCde': 'yes_no'},
        rules: [getRules("required", {
          trigger: 'change'
        })]
      },
      {
        prop: 'cDptPrnnme',
        title: '机构打印名称',
        inputtype: "rtinput"
      },
      {
        prop: 'cRptAddr',
        title: '报案地址',
        itemWidth: 3,
        inputtype: "rtinput"
      },
      {
        prop: 'cRptAddr',
        title: '中文地址',
        inputtype: "rtinputgroup",
        itemWidth: 3,
        groupList:[
          {
            prop: 'cCountry',
            title: '国家',
            inputtype: "rtselect",
            persent: 4,
            typeCode: "AREA_COUNTRY_CACHE",
            func: (val, option)=> {
              cCityParams.cParCde = ''
              cCountyParams.cParCde = ''
              cProvinceParams.cParCde = ''
              address.country = ''
              address.province = ''
              address.city = ''
              address.county = ''
              //address.addr = ''
              if(val) {
                cProvinceParams.cParCde = val 
                address.country = option.label
              }
              freeEditRef.value?.setValue('cProvince', '')            
              freeEditRef.value?.setValue('cCity', '')            
              freeEditRef.value?.setValue('cCounty', '')          
            }
          },
          {
            prop: 'cProvince',
            title: '省',
            inputtype: "rtselect",
            persent: 4,
            typeCode: "WEB_BAS_AREA",
            params: cProvinceParams,
            func: (val, option)=> {
              cCityParams.cParCde = ''
              cCountyParams.cParCde = ''
              address.province = ''
              address.city = ''
              address.county = ''
              //address.addr = ''
              if(val) {
                cCityParams.cParCde = val     
                address.province = option.label   
              }
              freeEditRef.value?.setValue('cCity', '')            
              freeEditRef.value?.setValue('cCounty', '')     
            }
          },
          {
            prop: 'cCity',
            title: '市',
            inputtype: "rtselect",
            persent: 4,
            typeCode: "WEB_BAS_AREA",
            params: cCityParams,
            func: (val, option)=> {
              cCountyParams.cParCde = ''
              address.city = ''
              address.county = ''
              //address.addr = ''
              if(val) {
                cCountyParams.cParCde = val
                address.city = option.label
              }
              freeEditRef.value?.setValue('cCounty', '')
            }
          },
          {
            prop: 'cCounty',
            title: '县/区',
            inputtype: "rtselect",
            persent: 4,
            typeCode: "WEB_BAS_AREA",
            params: cCountyParams,
            func: (val, option)=>{
              address.county = ''
              //address.addr = ''
              if(val){
                address.county = option.label
              }              
            }
          },
          {
            prop: 'cSuffixAddr',
            title: '街道',
            inputtype: "rtinput",
            persent: 8,
            func: (val)=>{
              address.addr = val
            }
          },
        ]
      },
      {
        prop: 'cDptCaddr',
        title: '中文地址',
        itemWidth: 3,
        disabled: true,
        inputtype: "rtinput",
        rules: [getRules("required", {
          trigger: 'change'
        })]
      },
      {
        prop: 'cDptEaddr',
        title: '英文地址',
        itemWidth: 3,
        inputtype: "rtinput"
      },
    ]
  })
);
watch(address, (newV) => {
  freeEditRef.value?.setValue('cDptCaddr', Object.values(newV).join("")) 
});
onMounted(async () => {
  if (props.type === "update" && props.data) {
    title.value = '修改机构部门信息'
    nextTick(()=>{
      let s = freeEditRef.value?.getFromSchemaItem('cDptCde')
      s['disabled'] = true;
      freeEditRef.value?.setFormValue(props.data);
      freeEditRef.value?.setValue('cDptSerno', props.data.cDptCde)
    })
  }else if (props.type === "add") {
    title.value = '新增机构部门信息'
    const param = {
      cDptCde: props.getDptCde
    };
    const getDptData = sysOrgDptMgrService.loadOrgDptInfo(param);
    getDptData.then((res: any) => {
        if (res && null != res['code']) {
            if (res['code'] === 200) {
                const data = res['data'];
                freeEditRef.value?.setValue('cSnrDpt', data.data.cSnrDpt)  
                freeEditRef.value?.setValue('nDptLevl', data.data.nDptLevl + 1)  
            } else {
              ElMessage.error(res['message']);
            }
        }
    });
    // nextTick(()=>{
    //   freeEditRef.value?.setValue('cDptCde', props.getDptCde)  
    //   freeEditRef.value?.setValue('cDptSerno', props.getDptCde)          
    // })
  }
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
/** 查询 */
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formParam = getFrom();
      const param = Object.assign({ 
        cCrtCde: user.opCde,
        cUpdCde: user.opCde,
        type:  props.type      
       }, formParam);
      sysOrgDptMgrService.saveOrgDptInfo(param)
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
