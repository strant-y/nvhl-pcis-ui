<template>
  <el-dialog v-model="dialogVisible" width="90%">
    
  </el-dialog>
</template>

<script setup lang="ts">
const emits = defineEmits(["ok", "cancel"]);
const props = defineProps({
  data: Object,
});
const dialogVisible = ref(true);
onMounted(() => {});
</script>
