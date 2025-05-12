<template>
  <div class="">
    <el-form ref="freeEditRef" :model="formconfig1">
      <el-form-item :label="`${labelNm}列表`" prop="name">
        <el-input
          v-model="formconfig1.name"
          :placeholder="`请输入${labelNm}名称`"
          clearable=""
        >
          <template #append>
            <el-button icon="Search" @click="handleQuery(true)" />
          </template>
        </el-input>
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
import { userUnionTerm, unUserUnUntionTerm } from "./custom-recording.service";
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
    isPage: true,
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
          const isPlan = props.type === 2 ? "1" : "0";
          if (checkedIcon.value === "rgb(250, 219, 20)") {
            const params = props.type === 2 ? {
              planNo: row.code,
              planCnm: row.value,
              prodCnm: props.pNode.parent.data.value,
              prodNo: props.pNode.parent.data.code,
              isPlan: isPlan,
            } : {
              termNo: row.code,
              termCnm: row.value,
              prodCnm: props.pNode.parent.data.value,
              prodNo: props.pNode.parent.data.code,
              isPlan: isPlan,
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
            const param = props.type === 2 ? {
              planNo: row.code,
              isPlan: isPlan,
            } : {
              termNo: row.code,
              isPlan: isPlan
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
  console.log("props.datas", props.termList);
  init();
  labelNm.value = props.type === 2 ? "方案" : "条款";
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
    if (datas.value.length && item.termNo == datas.value[0].code) {
      checkedIcon.value = "rgb(250, 219, 20)";
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
</style>
