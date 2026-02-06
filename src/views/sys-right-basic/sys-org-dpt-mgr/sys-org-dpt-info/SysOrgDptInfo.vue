<!-- 配置 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
      @page-change="handleQuery(false)" />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
  getDptCde: {
    type: String,
    required: true
  }
});

import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { SysOrgDptMgrService } from '@/views/sys-right-basic/service/sys-org-dpt-mgr.service';
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { log } from "console";
import { cloneDeep, filter } from "lodash-es";
import {getListByCode} from '@/api/code-list-service';
import { codeListViewStore } from "@/store";
const emits = defineEmits(['ok', 'refreshDptTree', 'cleanCheck'])
const sysOrgDptMgrService = new SysOrgDptMgrService();
const dzmodal = useDzModal();
const SysOrgDptEdit = defineAsyncComponent(() => import("./sys-org-dpt-edit/SysOrgDptEdit.vue"));
const amlExtendInfo = defineAsyncComponent(() => import("@/views/pcis-main/prodDef/common/aml-extend-info/index.vue"));
const tableRef = ref<AppTableMethod | null>(null);
let CSnrDptOption = []
let CDptClsOption = [{ value: '1', label: '机构' }, { value: '2', label: '部门' }, { value: '3', label: '室' }]
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "机构部门",
    endBtnsPosition: "right",
    endBtns: [
      //测试按钮 反洗钱扩展信息
      createFreeButtonBase({
        type: "primary",
        label: "反洗钱扩展信息（测试按钮）",
        func: async () => {
          dzmodal.open(amlExtendInfo, {}).then((res) => {
            if (res.type === "ok") {
              console.log("qqqq", '反洗钱扩展信息')
            }
          });
        },
      }),
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields()
          emits('cleanCheck')
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        rules: [getRules("required", {})],
        title: "机构代码",
        readOnly: true,
        disabled: true
      },
      {
        prop: "cLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        defaultValue: 0,
        keymap: {
          y: 1,
          n: 0,
        },
      },
      {
        prop: "cDptDispCde",
        inputtype: "rtinput",
        title: "机构显示码"
      },
      {
        prop: "cDptAbr",
        inputtype: "rtinput",
        title: "机构简称"
      },
      {
        prop: "cDptFnm",
        inputtype: "rtinput",
        title: "机构全称"
      },
      {
        prop: "nDptLevl",
        inputtype: "rtinput",
        title: "机构级别"
      }
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cIsValid"],
    //showSelection:true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        func: function () {
          if(props.getDptCde) {
            dzmodal.open(SysOrgDptEdit, { type: "add", getDptCde: props.getDptCde}).then((res) => {
              if (res.type === "ok") {
                emits('refreshDptTree', 1);
                handleQuery();
              }
            });
          } else {
            ElMessage.warning('请先选定上级机构,再进行操作！');
          }
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 150,
    tableBtnPosition: "right",
    tableBtnFixed: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          dzmodal.open(SysOrgDptEdit, { type: "update", data: row }).then((res) => {
            if (res.type === "ok") {
              emits('refreshDptTree', 1);
              handleQuery();
            }
          });
        },
      })
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "机构代码"
      },
      {
        prop: "cDptDispCde",
        inputtype: "rtinput",
        title: "机构显示代码",
      },
      {
        prop: "cDptAbr",
        inputtype: "rtinput",
        title: "机构简称",
      },
      {
        prop: "cDptFnm",
        inputtype: "rtinput",
        title: "机构全称",
      },
      {
        prop: "nDptLevl",
        inputtype: "rtinput",
        title: "机构级别",
      },
      {
        prop: "cDptCls",
        inputtype: "rtinput",
        title: "机构类型",
        formatter: (val)=>{
          const CDptClsOptionArr = filter(CDptClsOption, (item )=>{
            return val === item.value
          })
          return CDptClsOptionArr.length ? CDptClsOptionArr[0].label : val
        }
      },
      {
        prop: "cSnrDpt",
        inputtype: "rtinput",
        title: "上级机构",
        formatter: (val)=>{
          if(CSnrDptOption && CSnrDptOption.length> 0) {
            const CSnrDptOptionArr = filter(CSnrDptOption, (item )=>{
              return val === item.value
            })
            return CSnrDptOptionArr.length ? CSnrDptOptionArr[0].label : val
          }
        }
      },
      {
        prop: "tFndTm",
        inputtype: "rtinput",
        title: "成立时间",
      },
      {
        prop: "cIsValid",
        inputtype: "rtswitch",
        title: "有效标识",
        keymap: {
          y: "1",
          n: "0",
        },
        activeText: '启用',
        inactiveText: '撤销',
        inlinePrompt: true,
        func: (val, row) => {
          const newStatus = val === '1' ? '1' : '0';
          const param = {
            CDptCde: row.cDptCde ? row.cDptCde : '',
            CIsValid: newStatus
          };
          sysOrgDptMgrService.changeOrgDptStatus(param).then((res: any) => {
            if (res.code === 200) {
              const data = res.data;
              if (data.code === '1') { // 保存成功
                console.log(data.message);
                emits('refreshDptTree', 1);
                handleQuery();
              } else {
                console.error(data.message);
              }
            }
          });
        },
      }
    ],
  })
);
onMounted(async () => { 
  // const codeListStore =  codeListViewStore(idxParam.cdeListViewProps);
  // codeListStore.queryCodeListByCode('EMP_DPT_LIST_CACHE',false,true)
  // .then((res) => {
  //   //console.log("qqqqqqqqqqqqq", res)
  // })
  // .finally(() => { });


  getListByCode('EMP_DPT_LIST_CACHE').then(res => {
      if (!!res && !!res['data']) {
          CSnrDptOption = res['data'];
      }
  }, error => {
      console.log('出错了', error);
      ElMessage.error('后台服务异常,请联系管理员');
  });



});
watch(() => props.getDptCde, (newVal) => {
  if (newVal) {
    freeEditRef.value?.setValue('cDptCde', newVal)
    handleQuery(true);
  }
})
// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    const r = freeEditRef.value?.getFromValue();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};
/** 查询 */
function handleQuery(flag = true) {
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      return false;
    } else {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = cloneDeep(freeEditRef.value?.getFromValue()); //获取表单数据
      const param = Object.assign(s, r);
      sysOrgDptMgrService.qryOrgDptList(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            pageresult.list = [];
            pageresult.list = data.data;
            pageresult.total = data.total;
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => { });
        }
  });
}
</script>

<style scoped></style>
