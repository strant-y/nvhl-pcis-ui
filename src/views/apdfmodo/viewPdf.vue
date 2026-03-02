<template>
	<div>
		<el-dialog 
			v-model="visible" 
			title="浏览手册" 
			:width="1000"
			:destroy-on-close="false" 
			@close="handleClose"
		>
			<div v-loading="isLoading " element-loading-text="PDF 加载中..." style="height: 500px;">
				<embed v-if="pdfUrl" :src="pdfUrl" :key="renderKey"  type="application/pdf" width="100%" height="500px"/>
			</div>
		</el-dialog>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

// 状态定义
const visible = ref(false);
const pdfUrl = ref(null);
const error = ref(null);
const renderKey = ref(0);

// 【关键新增】加载状态标记
const isLoading = ref(false);

// 内部缓存
let cachedBlob = null;
let currentObjectUrl = null;
let fetchFunctionRef = null; 
let currentPromise = null; // 保存当前的 Promise 对象，可选优化

/**
 * 核心执行逻辑
 */
const executeLoad = async (fetchFn, forceRefresh = false) => {
  // 1. 如果正在加载中，且不是强制刷新，直接返回（避免重复请求）
  if (isLoading.value && !forceRefresh) {
    console.log('⏳ 请求正在进行中，跳过重复调用');
    return; 
  }

  // 2. 检查缓存 (只有没在加载且没强制刷新时才检查)
  if (!forceRefresh && currentObjectUrl && cachedBlob) {
    console.log('✅ 命中缓存');
    pdfUrl.value = currentObjectUrl;
    renderKey.value++;
    error.value = null;
    return;
  }

  // 3. 开始加载
  isLoading.value = true;
  error.value = null;
  fetchFunctionRef = fetchFn;

  try {
    if (!fetchFn) throw new Error('未提供数据获取函数');
    
    const response = await fetchFn();
    
    if (!response.data || response.data.size <= 0) {
      throw new Error('PDF 文件内容为空');
    }

    // 清理旧资源
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }

    // 创建新资源
    cachedBlob = new Blob([response.data], { type: 'application/pdf' });
    currentObjectUrl = URL.createObjectURL(cachedBlob);

    // 更新视图
    pdfUrl.value = currentObjectUrl;
    renderKey.value++;
    
    console.log('🎉 加载完成');
  } catch (err) {
    console.error(err);
    error.value = err;
  } finally {
    // 4. 结束加载
    isLoading.value = false;
  }
};

/**
 * 对外暴露：打开对话框
 * 逻辑：
 * 1. 打开 Dialog
 * 2. 如果正在预加载 (isLoading=true)，则什么都不做，让用户看着 Loading 转圈等待完成
 * 3. 如果没在加载且没缓存，则触发加载
 */
const open = async (fetchFn) => {
  visible.value = true;
  await nextTick();

  // 【关键逻辑】
  if (isLoading.value) {
    // 场景：预加载还没完成，用户点击了按钮
    // 动作：Dialog 已打开，内部 v-loading="true" 已经在转圈
    // 结果：等待预加载的 Promise 完成，自动显示 PDF，不会发起新请求
    console.log('👀 预加载进行中，直接展示 Dialog 等待完成');
    return; 
  }

  // 场景：第一次打开，或者之前加载过/失败过
  await executeLoad(fetchFn, false);
};

/**
 * 对外暴露：静默预加载
 */
const preload = async (fetchFn) => {
  if (isLoading.value) {
    console.log('🤫 已经在预加载了，忽略重复调用');
    return;
  }
  console.log('🤫 开始静默预加载...');
  await executeLoad(fetchFn, false);
};

const handleClose = () => {
  visible.value = false;
};

const handleRefresh = () => {
  if (fetchFunctionRef) {
    executeLoad(fetchFunctionRef, true);
  }
};

const retry = () => {
  if (fetchFunctionRef) {
    executeLoad(fetchFunctionRef, true);
  }
};

onUnmounted(() => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }
});

defineExpose({
  open,
  preload
});
</script>
