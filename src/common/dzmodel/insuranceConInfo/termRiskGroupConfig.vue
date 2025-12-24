<template>
  <div>
    <el-row>
      <el-col :span="24">
        <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
      </el-col>
      
    </el-row>
    <el-row v-show="showtype === 'table'">
      <el-col :span="14">
        <rt-mytable
          :tableConfig="groupconfig"
          ref="groupRef"
          @rowselect="groupSelect"
        />
      </el-col>
      <el-col :span="10">
        <rt-mytable :tableConfig="titleconfig" ref="titleRef" />
      </el-col>
    </el-row>
    <el-row v-show="showtype !== 'table'">
      <el-col :span="24">
          <rt-mytable :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRiskRef"  @pageChange="getDictFormData(false)"/>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="21"> </el-col>
      <el-col :span="3">
        <el-button @click="savegroupinfo" type="primary">保存</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { VueDraggable } from "vue-draggable-plus";
import {
  getGroupInfo,
  getTermFactorInfo,
  getTitleInfoByGroup,
  getTRFactorList,
  querySelectorList,
  saveGroupInfo,
  saveTermColByTerm,
  saveTRFactorList,
} from "@/api/prod";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import { iconPropType } from "element-plus/es/utils";
import { styleType } from "element-plus/es/components/table-v2/src/common";
import { createFreeButtonBase } from "@/shared/button-config";
import { AppFreeEditConfig, AppFreeEditMethod, createAppFreeEditConfig } from "@/shared/app-free-edit-config";
import { inputtype } from "@/utils/utilKey";
const tableRef = ref<MyTableMethod | null>(null);
const tableRiskRef = ref<MyTableMethod | null>(null);
const pageresult = reactive<Pageresult>({
  result: "",
  list: [],
  total: 0,
});

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
function getuuid() {
  return uuidv4().replace(/-/g, "");
}
const emits = defineEmits(["handleClose"]);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const showtype = ref("table");

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    fromUi:{
      cols:2
    },
    fromSchema: [
      {
        prop: "cRiskType",
        inputtype: "rtselect",
        title: "责任样式",
        placeholder:"标题关联",
        loadData: [
          {
            label: "平铺表格",
            value: "grid",
          },
          {
            label: "标题关联",
            value: "table",
          },
        ],
        func: (val: any) => {
          showtype.value = val;
          if(val === 'grid'){
          }else{
            selectData();
          }
        },
      },
    ],
  })
);
const groupRef = ref<MyTableMethod | null>(null);
const titleRef = ref<MyTableMethod | null>(null);

const groupData = ref<any[]>([]);

function groupSelect(row: any) {
  getTitleInfoByGroup({ groupId: row.cPkId }).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      titleRef.value?.setFormValue(data);
    } else {
      ElMessage.error(msg);
    }
  });
}

function savegroupinfo() {
  const freetrye = freeEditRef.value?.getFromValue();
  const cRiskType = freetrye['cRiskType'];
  let rowall ;
  if(cRiskType !== 'grid'){
    rowall = groupRef.value?.getFromValue();
  }else{
    rowall = tableRiskRef.value?.getFromValue();
  }
  const selectata = rowall.filter((item: any) => item.isChecked === '1');
  saveTermColByTerm({ cTermNo: props.data.data.cTermNo, selectata: selectata ,cRiskType:cRiskType }).then(
    (res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        ElMessage.success("保存成功");
        selectData();
          if(cRiskType === 'grid'){
            getDictFormData(true);
          }else{
            selectData();
          }
      } else {
        ElMessage.error(msg);
      }
    }
  );
}

onMounted(() => {
  getDictFormData(true);
});

function selectData(){
  getGroupInfo({ cTermNo: props.data.data.cTermNo }).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      groupData.value = data;
    } else {
      ElMessage.error(msg);
    }
    groupRef.value?.setFormValue(groupData.value);
  });
}

function getDictFormData(fl = true) {
  const paraParam = tableRiskRef.value?.getPartnerPage(fl);
  const fromp = tableRiskRef.value?.getFormData();
  const p = Object.assign({ termNo: props.data.data.cTermNo, tabKey: "TermRisktgt" }, paraParam, fromp );
  getTermFactorInfo(p).then(
    (res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if (data.datalist) {
          data.datalist.forEach((e: any) => {
            if (e.cPkId) {
              e.isChecked = "1";
            }
          });
        }
        tableRiskRef.value?.setFormValue(data.datalist);
        pageresult.total = data.total;
        if (data.confs) {
          const conf = data.confs;
          freeEditRef.value?.setValue('cRiskType',conf.CCnm);
        }else{
          freeEditRef.value?.setValue('cRiskType','table');
        }
      } else {
        ElMessage.error(msg);
      }
    }
  );
}

const groupconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title:"分组选择",
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        title: "排序",
        dragFlag: true,
        width: 40,
      },
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "0",
        },
        width: 40,
        func: (v: any) => {},
      },
      {
        prop: "cGroupType",
        inputtype: "rtselect",
        title: "分组类型",
        width: 80,
        loadData: [
          {
            label: "表格",
            value: "grid",
          },
          {
            label: "表单",
            value: "free",
          },
        ],
        func: (v: any) => {},
      },
      {
        prop: "cGroupName",
        inputtype: "rtinput",
        title: "分组名",
        width: 80,
        func: (v: any) => {},
      },
      {
        prop: "cGroupTitle",
        inputtype: "rtinput",
        title: "分组标题",
        func: (v: any) => {},
      },
    ],
  })
);

const titleconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title:"列信息预览",
    fromSchema: [
      {
        prop: "cColTitle",
        inputtype: "rtinput",
        title: "标题",
        func: (v: any) => {},
      },
      {
        prop: "cColWidth",
        inputtype: "rtnumber",
        title: "宽度",
        func: (v: any) => {},
      },
    ],
  })
);

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cPorpRequired","cPorpShowtitle","cPorpDisabled","cPropHeight","cPropIndent","cFatherKey","cPorpExtend"],
    showEdit: true,
    formconfig: {
      fromSchema: [
        {
          prop: "cFactorKey",
          inputtype: "rtinput",
          title: "要素key",
        },
        {
          prop: "cFactorTitle",
          inputtype: "rtinput",
          title: "要素名称",
        },
      ],
    },
    titleBtns:[
      createFreeButtonBase({
        link:true,
        type: "primary",
        label:"查询", 
        icon: "Search",
        func: () => {
          getDictFormData(true);
        },
      }),
    ],
    fromSchema: [
      {
        prop: "icon",
        inputtype: "rtIcon",
        icon: "Rank",
        iconSize: "16",
        title: "排序",
        dragFlag: true,
        width: 40,
      },
      {
        prop: "isChecked",
        inputtype: "rtcheckbox",
        title: "选中",
        keymap: {
          y: "1",
          n: "0",
        },
        width: 40,
        func: (v: any,row: any) => {
          if (v !== "1") {
            if(row.cPorpShowtitle === '1'){
              tableRef.value?.setValueByRowKey("cPorpShowtitle", row._dataId, '0');
            }
         }
        },
      },
      {
        prop: "cFactorInputtype",
        inputtype: "rtselect",
        title: "要素类型",
        loadData: inputtype,
      },
      {
        prop: "cPorpRequired",
        inputtype: "rtswitch",
        title: "是否必填",
        keymap: {
          y: "1",
          n: "0",
        },
        func: (v: any) => {},
      },
      {
        prop: "cPorpDisabled",
        inputtype: "rtswitch",
        title: "是否只读",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cFactorProp",
        inputtype: "rtinput",
        title: "要素key",
      },
      {
        prop: "cFactorTitle",
        inputtype: "rtinput",
        title: "要素名称",
      },
      {
        prop: "cPorpExtend",
        inputtype: "rtswitch",
        title: "是否折叠项",
        keymap: {
          y: "1",
          n: "0",
        },
      },
      {
        prop: "cSysConfig",
        inputtype: "rtmultiple",
        title: "可操作域",
        multipleshow:"select",
        placeholder:"有效",
        nullValue:"0",
        loadData: [
          {
            label: "有效",
            value: "0",
          },
          {
            label: "无验证",
            value: "1",
          },
          {
            label: "无效",
            value: "2",
          },
        ],
        multipletitle:[
          {
            title:'核心',
            width:80
          },{
            title:'询价',
            width:80
          },{
            title:'移动',
            width:80
          }
        ]
      },
    ],
  })
);
</script>

<style scoped></style>
