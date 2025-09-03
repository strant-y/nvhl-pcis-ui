<template>
  <div class="">
    <el-form ref="freeEditRef" :model="formconfig1">
      <el-form-item :label="`选中${labelNm}`" prop="name"  class="custom-form-item">
        <!-- <el-input
          v-model="formconfig1.name"
          :placeholder="`请输入${labelNm}名称`"
          clearable=""
        >
          <template #append>
            <el-button icon="Search" @click="handleQuery(true)" />
          </template>
        </el-input> -->
      </el-form-item>
    </el-form>

    <div class="tableRecordingInfo">
      <app-table
        class="tableRecordingInfo"
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { ref, toRefs } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const freeEditRef = ref(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { userUnionTerm, unUserUnUntionTerm,qryUserCommonTerm} from "./custom-recording.service";
import { SysOpMgrService } from "@/views/sys-right-basic/service/sys-op-mgr.service";
import { max } from "lodash";
import func from "vue-temp/vue-editor-bridge";
const emits = defineEmits(["rowClick", "updateTerm"]);

const props = defineProps({
  datas: {
    type: Array,
    default: () => [],
  },
  pNode: {
    type: Array,
    default: () => [],
  },
  termList: {
    type: Array,
    default: () => [],
  },
  type: {
    type: Number,
    default: 1,
  },
  voType: {
    type: String,
    default: "",
  }
});
const { datas } = toRefs(props);
const sysOpMgrService = new SysOpMgrService();
const formconfig1 = reactive({
  name: "",
});
const labelNm = ref("条款")
const params = ref<any>({});
const checkedIcon = ref("rgb(170, 170, 170)");
const tableRef = ref<AppTableMethod | null>(null);
const countNum = ref(0);
const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    tableBtnType: "btn",
    isPage: false,
    tableBtnWidth: 80,
    tableBtnPosition: "left",
    tableBtnTitle: "常用",
    highlightCurrentRow: true,
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        disabled: false,
        type: "success",
        size: "large",
        icon: "StarFilled",
        iconSize: "20",
        iconColor: checkedIcon,
        tableClick: (row) => {
          checkedIcon.value =
            checkedIcon.value === "rgb(170, 170, 170)"
              ? "rgb(250, 219, 20)"
              : "rgb(170, 170, 170)";
          const isPlan = props.type === 5 ? "1" : "0";
          qryUserCommonTerm({
            pageNum: 1,
            pageSize: 9999,
            userId: JSON.parse(sessionStorage.getItem("user")).opCde,
            isPLan: isPlan,
            voType: props.voType,
          }).then((res: any) => {
              countNum.value = res.total;
              if(countNum.value >=9){
                ElMessage.error("最多只能收藏9条");
                checkedIcon.value = "rgb(170, 170, 170)";
                return false;
              }else{
                if (checkedIcon.value === "rgb(250, 219, 20)") {
                  const params = props.type === 5 ? {
                    planNo: row.code,
                    planCnm: row.value,
                    prodCnm: props.pNode.parent.data.value,
                    prodNo: props.pNode.parent.data.code,
                    isPlan: isPlan,
                    voType: props.voType,
                  } : {
                    termNo: row.code,
                    termCnm: row.value,
                    prodCnm: props.pNode.parent.data.value,
                    prodNo: props.pNode.parent.data.code,
                    isPlan: isPlan,
                    voType: props.voType,
                  };
                userUnionTerm(params).then((res:any) => {
                  if (res.code == "1") {
                    ElMessage.success(res.message);
                    emits("updateTerm", {});
                  } else {
                    ElMessage.error(res.msg);
                  }
                });
              } else {
                const param = props.type === 5 ? {
                  planNo: row.code,
                  isPlan: isPlan,
                  voType: props.voType,
                } : {
                  termNo: row.code,
                  isPlan: isPlan,
                  voType: props.voType,
                };
                unUserUnUntionTerm(param).then((res:any) => {
                  if (res.code == "1") {
                    ElMessage.success(res.message);
                    emits("updateTerm", {});
                  } else {
                    ElMessage.error(res.msg);
                  }
                });
              }
            }
            });
        },
      }),
    ],
    fromSchema: [
      {
        prop: "code",
        inputtype: "rtinput",
        title: `${labelNm.value}代码`,
      },
      {
        prop: "value",
        inputtype: "rtinput",
        title: `${labelNm.value}名称`,
      },
    ],
  })
);
onMounted(async () => {
  init();
  labelNm.value = props.type === 5 ? "方案" : "条款";
});

watch(
  () => props.datas,
  (newVal: any) => {
    if (newVal) {
      init();
    }
  }
);

function init() {
  formconfig1.name = "";
  pageresult.list = props.datas;

  checkedIcon.value = "rgb(170, 170, 170)";
  props.termList.forEach((item: any, index: any) => {
    if(props.type === 5) {
      if (datas.value.length && item.planNo == datas.value[0].code) {
        checkedIcon.value = "rgb(250, 219, 20)";
      }
    } else {
      if (datas.value.length && item.termNo == datas.value[0].code) {
        checkedIcon.value = "rgb(250, 219, 20)";
      }
    }
  });
  console.log("props.datas", checkedIcon.value);
}

// }
/** 查询 */
function handleQuery(flag = true) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = formconfig1; //获取表单数据
  const param = Object.assign(s, r);
  sysOpMgrService
    .qrySysOpList(param)
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
</script>

<style scoped>
.tableRecordingInfo >>> .el-table__body tr.current-row > td.el-table__cell {
  background-color: #ffaaa64d;
}
/* 添加自定义表单项目样式 */
.custom-form-item :deep(.el-form-item__label) {
  font-size: 18px;          /* 字体变大 */
  font-weight: bold;
}
</style>
