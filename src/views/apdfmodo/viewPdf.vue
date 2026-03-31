<template>
	<div>
		<el-dialog 
			v-model="visible" 
			title="浏览手册" 
			:width="1000"
			:destroy-on-close="false" 
			@close="handleClose"
		>
			<!-- 容器高度固定，用于承载 loading、PDF 或 错误提示 -->
			<div v-loading="isLoading" element-loading-text="文档正在加载，大约需要 20 秒，感谢您的耐心 " style="height: 500px; position: relative;">
				
				<!-- 场景 1: 加载出错 (优先显示) -->
				<div v-if="error" class="error-container">
					<el-result icon="error" title="PDF 加载失败" :sub-title="errorMessage">
						<template #extra>
							<el-button type="primary" @click="retry">重新加载</el-button>
							<el-button @click="handleClose">关闭</el-button>
						</template>
					</el-result>
				</div>

				<!-- 场景 2: 加载成功 (显示 PDF) -->
				<!-- 注意：只有当没有错误且 URL 存在时才渲染 embed -->
				<embed 
					v-else-if="pdfUrl" 
					:src="pdfUrl" 
					:key="renderKey"  
					type="application/pdf" 
					width="100%" 
					height="500px"
				/>
				
				<!-- 场景 3: 初始状态或加载中但无内容 (由 v-loading 覆盖，此处可留空或放占位) -->
				<div v-else-if="!isLoading && !pdfUrl" class="empty-state">
					<el-empty description="暂无 PDF 内容" />
				</div>

			</div>
		</el-dialog>
	</div>
</template>

<script setup>
import { ref, nextTick, onUnmounted } from 'vue';
// 假设你使用了 Element Plus，如果没有全局引入，需要手动导入组件
// import { ElDialog, ElResult, ElButton, ElEmpty } from 'element-plus'; 

// 状态定义
const visible = ref(false);
const pdfUrl = ref(null);
const error = ref(null); // 存储 Error 对象
const renderKey = ref(0);
const isLoading = ref(false);

// 内部缓存
let cachedBlob = null;
let currentObjectUrl = null;
let fetchFunctionRef = null; 

/**
 * 获取友好的错误消息
 */
const errorMessage = computed(() => {
	if (!error.value) return '';
	// 可以根据 error 类型返回不同提示
	// if (error.value.message.includes('为空')) return '文件内容为空，请联系管理员。';
	// if (error.value.message.includes('网络')) return '网络连接异常，请检查网络后重试。';
	return error.value.message || '加载失败，请检查网络后重试。';
});

// 需要引入 computed
import { computed } from 'vue';

/**
 * 核心执行逻辑
 */
const executeLoad = async (fetchFn, forceRefresh = false) => {
  if (isLoading.value && !forceRefresh) {
    console.log('⏳ 请求正在进行中，跳过重复调用');
    return; 
  }

  if (!forceRefresh && currentObjectUrl && cachedBlob && !error.value) {
    console.log('✅ 命中缓存');
    pdfUrl.value = currentObjectUrl;
    renderKey.value++;
    error.value = null; // 清除旧错误
    return;
  }

  isLoading.value = true;
  error.value = null; // 开始新请求前清除错误
  fetchFunctionRef = fetchFn;

  try {
    if (!fetchFn) throw new Error('未提供数据获取函数');
    
    const response = await fetchFn();
    
    // 兼容不同的响应结构，确保能拿到 Blob 或 ArrayBuffer
    const data = response.data; 

    if (!data || (data instanceof Blob ? data.size <= 0 : !data.length)) {
      throw new Error('PDF 文件内容为空');
    }

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }

    // 确保创建 Blob 的数据格式正确
    const blobData = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });
    
    cachedBlob = blobData;
    currentObjectUrl = URL.createObjectURL(cachedBlob);

    // 更新视图
    pdfUrl.value = currentObjectUrl;
    renderKey.value++;
    
    console.log('🎉 加载完成');
  } catch (err) {
    console.error('PDF 加载失败:', err);
    error.value = err; // 将错误对象赋值给 error，触发模板显示
    // 可选：这里也可以调用 ElMessage.error(err.message) 做全局提示
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
  
  // 如果有错误且用户重新打开，可以选择是否自动重试，这里保持原逻辑由用户点击重试
  // 如果希望打开时自动重试，可以取消下面这行的注释：
  // if (error.value) { await executeLoad(fetchFn, true); return; }

  await executeLoad(fetchFn, false);
};

/**
 * 对外暴露：静默预加载
 */
const preload = async (fetchFn) => {
  if (isLoading.value) return;
  await executeLoad(fetchFn, false);
};

const handleClose = () => {
  visible.value = false;
  // 可选：关闭时是否清除错误状态？通常保留以便用户下次打开看到上次为什么失败
  error.value = null; 
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

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>