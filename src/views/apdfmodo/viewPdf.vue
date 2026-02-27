<template>
  <div class="pdf-container" v-loading="loading" element-loading-text="PDF 加载中...">
    <embed :src="pdfUrl" type="application/pdf" width="100%" height="500px" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { viewManual } from "@/api/prod";

// 替换为实际的接口地址
const apiUrl = ref('');
const pdfUrl = ref('');
const loading = ref(false);
const fetchPdf = async () => {
	try {
		loading.value = true
    const response = await viewManual();
		if (response.data?.size <= 0) {
			throw new Error('无法获取 PDF 文件');
    }
		const blob = new Blob([response.data], { type: 'application/pdf' });
		pdfUrl.value = URL.createObjectURL(blob);
  } catch (error) {
		console.error('获取 PDF 文件时出错:', error);
  } finally {
    loading.value = false;
  }
};

const downloadPdf = () => {
  const a = document.createElement('a');
  a.href = pdfUrl.value;
  a.download = 'document.pdf';
  a.click();
  URL.revokeObjectURL(pdfUrl.value);
};

defineExpose({
  apiUrl,
  fetchPdf
});
</script>
