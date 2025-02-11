<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div style="background-color: #f3f3f3">
          <span style="font-size: 18px; margin-left: 15px"
            >必须选择至少一项主条款</span
          >
        </div>
      </el-col>
      <el-col :span="12">
        <div class="search-btn">
          <div style="width: 50%; float: right">
            <div class="inline-block-div" style="width: 75%">
              <rtinput :item="{ placeholder: '请输入主条款名称或编码' }" />
            </div>
            <rtButton
              :item="{
                icon: 'Search',
              }"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="search-btn">
          <span style="font-size: 16px"> 请选择附加条款责任 </span>
          <div style="width: 50%; float: right">
            <div class="inline-block-div" style="width: 75%">
              <rtinput :item="{ placeholder: '请输入附加条款名称或编码' }" />
            </div>
            <rtButton
              :item="{
                icon: 'Search',
              }"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div style="height: 250px; border: 1px solid #f3f3f3">
          <el-tree
            style="max-width: 600px"
            :props="dataprops"
            node-key="id"
            show-checkbox
            :data="data1"
          />
        </div>
      </el-col>
      <el-col :span="12">
        <div style="height: 250px; border: 1px solid #f3f3f3">
          <el-tree
            style="max-width: 600px"
            :props="dataprops"
            node-key="id"
            show-checkbox
            :data="data2"
          />
        </div>
      </el-col>
      <el-col :span="24">
        <div style="background-color: #f3f3f3">
          <span style="font-size: 18px; margin-left: 15px">已选择的条款</span>
        </div>
      </el-col>
      <el-col :span="24">
        <el-tree
          style="max-width: 600px"
          :props="dataprops"
          node-key="id"
          :data="data3"
        />
      </el-col>
      <el-col :span="24">
        <div style="float: right; margin-right: 20px">
          <rtButton
            :item="{
              icon: 'RefreshLeft',
              label: '取消',
            }"
          />
          <rtButton
            :item="{
              icon: 'Pointer',
              label:'确定',
              type:'primary',
              func:() => {
                selectOne();
              }
            }"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
const emits = defineEmits(["handleClose"]);
const isFree = ref(true);
const isCopy = ref(false);
const showMsg = ref("组件预览");
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

const dataprops = {
  children: "children",
  label: "label",
};

const data1 = ref([
  {
    id: 1,
    label: "保险主条款1(2024款)",
    children: [
      {
        id: 4,
        label: "保险责任1-1",
        children: [],
      },
    ],
  },
  {
    id: 2,
    label: "保险主条款2(2024款)",
    children: [
      {
        id: 5,
        label: "保险责任2-1",
      },
      {
        id: 6,
        label: "保险责任2-2",
      },
    ],
  },
  {
    id: 3,
    label: "保险主条款3(2024款)",
    children: [
      {
        id: 7,
        label: "保险责任3-1",
      },
      {
        id: 8,
        label: "保险责任3-2",
      },
    ],
  },
]);

const data2 = ref([
  {
    id: 1,
    label: "保险附加条款1(2024款)",
    children: [
      {
        id: 4,
        label: "保险附加责任1-1",
        children: [],
      },
    ],
  },
  {
    id: 2,
    label: "保险附加条款2(2024款)",
    children: [
      {
        id: 5,
        label: "保险附加责任2-1",
      },
      {
        id: 6,
        label: "保险附加责任2-2",
      },
    ],
  },
  {
    id: 3,
    label: "保险附加条款3(2024款)",
    children: [
      {
        id: 7,
        label: "保险附加责任3-1",
      },
      {
        id: 8,
        label: "保险附加责任3-2",
      },
    ],
  },
]);

const data3 = ref([
  {
    id: 1,
    label: "保险附加条款1(2024款)",
    children: [
      {
        id: 4,
        label: "保险附加责任1-1",
        children: [],
      },
    ],
  },
]);

// 绑定方法
const method = {};

// 绑定特殊验证器
const exRules = {};

onMounted(async () => {});

async function selectOne() {
  props.method.isOk();
  emits("handleClose");
}

function fail() {
  emits("handleClose");
}
</script>

<style scoped>
.inline-block-div {
  display: inline-block;
}
.search-btn {
  width: 100%;
  height: 45px;
  background-color: #f3f3f3;
}
</style>
