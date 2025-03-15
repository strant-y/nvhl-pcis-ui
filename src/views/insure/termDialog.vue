<!-- 配置 -->
<template>
  <el-dialog v-model="dialogVisible" width="75%" title="选择条款">
    <el-row gutter="10">
      <el-col :span="12" class="col-md-12">
        <el-card :bordered="false" class="index-blk">
          <div
            style="
              height: 20rem;
              width: 100%;
              overflow: scroll;
              overflow-x: scroll;
            "
          >
            <el-input
              v-model="filterText"
              style="width: 500px"
              placeholder="请输入条款名称"
            />
            <el-tree
              ref="treeRef"
              class="custom-re-tree"
              :data="nodes"
              :props="defaultProps"
              @current-change="getCurrentNode"
              :show-line="true"
              :highlight-current="true"
              :filter-node-method="filterNode"
              @node-click="onEvent"
            >
              <template #default="{ node, data }">
                <span>
                  <el-icon><icon-name /></el-icon>
                  {{ data.value }} ( {{ data.code }} )
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="col-md-12">
        <CustomRecordingInfo
          v-if="listShow"
          :datas="datas"
          :pNode="pNode"
          @updateTerm="updateTermlist"
        />
      </el-col>
    </el-row>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '确认',
          func: () => {
            confirm();
          },
        }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
const filterText = ref("");
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
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { getProdEnableList } from "./custom-recording.service";
const emits = defineEmits(["ok", "cancel"]);
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const dialogVisible = ref(true);
const treeRef = ref<InstanceType<typeof ElTree>>();
const formconfig1 = ref({
  name: "",
});
// 条款树
const nodes = ref<Array<any>>([]);
const defaultProps = {
  children: "list",
  isLeaf: "leaf",
  label: "value",
};
const datas = ref<any>([]);
const pNode = ref<any>([]);
const listShow = ref(false);
const CustomRecordingInfo = defineAsyncComponent(
  () => import("./CustomRecordingInfo.vue")
);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  termList: {
    type: Array,
    required: true,
  },
});

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: "false",
    showSelection: true,
    maxHeight: 350,
    fromSchema: [
      {
        prop: "cNmeCn",
        inputtype: "rtinput",
        title: "选择项",
        minWidth: 180,
      },
    ],
  })
);

onMounted(async () => {
  loadTree();
});

watch(
  () => props.data,
  (newTableConfig) => {},
  { deep: true }
);

watch(filterText, (val) => {
  treeRef.value.filter(val);
});
const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.value?.includes(value);
};
// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 获取条款列表
function loadTree() {
  nodes.value = [];
  const param = {
    name: formconfig1.value.name,
  };
  getProdEnableList(param).then((res: any) => {
    if (res.code === 200) {
      nodes.value = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
}
const getCurrentNode = (data: any) => {
  if (data.list.length !== 0) {
    listShow.value = true;
    datas.value = [];
  }
};
const onEvent = (data: any, node: any) => {
  // listShow.value = false;
  if (data.list.length == 0) {
    listShow.value = true;
    datas.value = [data];
    pNode.value = node;
    emits("ok", data, node);
  }
};

// 保存
function confirm() {
  dialogVisible.value = false;
  emits("ok", {});
}
function updateTermlist() {
  emits("ok", {});
}
</script>

<style scoped>
.custom-re-tree >>> .el-tree-node.is-current > .el-tree-node__content {
  background-color: #ffaaa64d;
}
</style>
