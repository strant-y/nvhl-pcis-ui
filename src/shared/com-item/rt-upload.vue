<template>
  <el-upload
    ref="uploadRef"
    :http-request="uploadMethod"
    multiple
    :limit="10"
    :before-upload="beforeUpload"
    :on-remove="handleRemove"
  >
    <el-button type="primary">点击选择文件</el-button>
  </el-upload>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
const uploadRef = ref();
type IconNames = keyof typeof ElementPlusIconsVue;
const props = defineProps({
  modelValue: {
    type: Object,
  },
  item: {
    type: Object as () => Record<string, any>,
    required: true,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
  parentFromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
  row: {
    // 新增属性，用于接收当前行的数据
    type: Object as () => Record<string, any>,
    required: false,
  },
});

// 手动触发上传
const submitUpload = () => {
  uploadRef.value!.submit();
}
const uploadMethod = async(options) => {
  const { file, onSuccess, onError } = options;
  console.log(props.item);
  if(props.item.uploadfunc && typeof props.item.uploadfunc === 'function'){
    props.item.uploadfunc(file);
  }
}

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const beforeUpload: UploadProps['onPreview'] = (file) => {
  if(props.item.beforeUpload){
    const s = props.item.beforeUpload(file);
    if(s === false){
      return false;
    }
  }
}

onMounted(() => {
});

const renderIcon = (iconName: string) => {
  const iconComponent = ElementPlusIconsVue[iconName as IconNames];
  if (iconComponent) {
    return h(resolveComponent(iconComponent.name));
  }
  return null;
};

defineExpose({
  submitUpload
});
</script>
<style lang="scss" scoped>
</style>
