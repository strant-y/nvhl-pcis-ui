<template>
  <prodFactoryInfo :param="dialogParam" />
</template>

<script setup lang="ts">
import prodFactoryInfo from "@/views/prodconfiguration/prodFactoryInfo.vue";

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

const dialogParam = computed(() => ({
  ...(props.data?.param || {}),
  inDialog: true,
  onSaved: () => {
    props.method?.isOk?.({ type: "ok" });
  },
  onClose: () => {
    emits("handleClose");
  },
}));
</script>

