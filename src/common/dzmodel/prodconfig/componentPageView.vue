<template>
  <div>
    <el-main>
      <template v-for="(pageConfig, v) in formconfig1" :key="v">
        <div
          class="card_"
          v-for="(k, i) in pageConfig?.pageInfo"
          :key="i"
          :id="k.pageKey"
        >
          <component
            v-if="currentIndex >= i"
            :is="k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'"
            :pageSchema="k.pageSchema"
          />
        </div>
      </template>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { dataParam } from "@/store/modules/dataParam";

const currentIndex = ref(0);
const formconfig1 = ref({});

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
const emits = defineEmits(["handleClose"]);
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
import { formInit } from "@/shared/from-init";
import { getPageViewByPage } from "@/api/prod";

const dataparam = dataParam();

// 绑定方法
const method = {};

// 绑定特殊验证器
const exRules = {};

onMounted(async () => {
  // 将预览参数中的 cProdNo 写入全局 dataParam store，供子组件读取
  if (props.data?.param?.cProdNo) {
    dataparam.setParam({ cProdNo: props.data.param.cProdNo });
  }
  const res = await getPageViewByPage(props.data.param);
  if (200 === res.code) {
    formconfig1.value = res.data;
    renderComponents();
  } else {
    ElMessage.error("预览加载失败!" + res.msg);
  }
});

function renderComponents() {
  const interval = setInterval(() => {
    if (currentIndex.value < formconfig1.value?.[0]?.pageInfo?.length - 1) {
      currentIndex.value++;
    } else {
      clearInterval(interval);
      loadAfter();
    }
  }, 100); // 延迟组件渲染,增加页面响应效率
}

function loadAfter() {
  nextTick(() => {
    //TODO 组件加载后执行方法预留,目前暂时没有可执行方法
  });
}
</script>

<style scoped>
.container {
  width: 300px; /* 设置固定宽度 */
  height: 250px; /* 设置固定高度 */
  overflow-y: auto; /* 开启垂直滚动条 */
}
.drag-container {
  height: 100%; /* 让列表填充整个容器高度 */
}
.list-item {
  border: 1px solid #ccc; /* 设置列表项边框 */
  padding: 10px; /* 设置列表项内边距 */
  margin-top: 5px; /* 设置列表项间的间隔 */
  background-color: #fff; /* 设置列表项背景色 */
  cursor: move; /* 设置移动指针样式 */
}
</style>
